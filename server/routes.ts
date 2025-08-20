import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { stripeService } from "./services/stripe";
import { storjService } from "./services/storj";
import { z } from "zod";
import { randomBytes } from "crypto";

// Extend Request interface to include vendor
declare global {
  namespace Express {
    interface Request {
      vendor?: any;
    }
  }
}

// Auth middleware
async function authenticateVendor(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const session = await storage.getSessionByToken(token);
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const vendor = await storage.getVendor(session.vendorId);
    if (!vendor) {
      return res.status(401).json({ message: 'Vendor not found' });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      let vendor = await storage.getVendorByEmail(email);
      if (!vendor) {
        vendor = await storage.createVendor({
          email,
          name: email.split('@')[0], // Use email prefix as default name
        });
      }

      // Create session token
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await storage.createSession({
        vendorId: vendor.id,
        token,
        expiresAt,
      });

      res.json({ token, vendor });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(400).json({ success: false, message: error.message || 'Login failed' });
    }
  });

  app.post("/api/auth/logout", authenticateVendor, async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await storage.deleteSession(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vendor profile routes
  app.get("/api/vendor/profile", authenticateVendor, async (req, res) => {
    res.json(req.vendor);
  });

  // Payment link routes
  app.post("/api/payment-links", authenticateVendor, async (req, res) => {
    try {
      const { productName, amount } = z.object({
        productName: z.string().min(1),
        amount: z.number().positive(),
      }).parse(req.body);

      const paymentLink = await stripeService.createPaymentLink({
        productName,
        amount,
        vendorId: req.vendor.id,
      });

      const dbPaymentLink = await storage.createPaymentLink({
        vendorId: req.vendor.id,
        stripePaymentLinkId: paymentLink.id,
        productName,
        amount: amount.toString(),
        url: paymentLink.url,
      });

      res.json(dbPaymentLink);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/payment-links", authenticateVendor, async (req, res) => {
    try {
      const paymentLinks = await storage.getVendorPaymentLinks(req.vendor.id);
      res.json(paymentLinks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payments routes
  app.get("/api/payments", authenticateVendor, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const payments = await storage.getVendorPayments(req.vendor.id, limit);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Withdrawal routes
  app.post("/api/withdrawals", authenticateVendor, async (req, res) => {
    try {
      const { amount } = z.object({
        amount: z.number().positive(),
      }).parse(req.body);

      const vendorBalance = parseFloat(req.vendor.balance);
      if (amount > vendorBalance) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      if (amount < 25) {
        return res.status(400).json({ message: 'Minimum withdrawal amount is $25' });
      }

      const withdrawal = await storage.createWithdrawalRequest({
        vendorId: req.vendor.id,
        amount: amount.toString(),
      });

      res.json(withdrawal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/withdrawals", authenticateVendor, async (req, res) => {
    try {
      const withdrawals = await storage.getVendorWithdrawalRequests(req.vendor.id);
      res.json(withdrawals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Support ticket routes
  app.post("/api/support/tickets", authenticateVendor, async (req, res) => {
    try {
      const { subject, description, priority, category } = z.object({
        subject: z.string().min(1).max(200),
        description: z.string().min(1).max(2000),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
        category: z.enum(['technical', 'billing', 'kyc', 'withdrawal', 'general']),
      }).parse(req.body);

      const ticket = await storage.createSupportTicket({
        vendorId: req.vendor.id,
        subject,
        description,
        priority,
        category,
      });

      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/support/tickets", authenticateVendor, async (req, res) => {
    try {
      const tickets = await storage.getVendorSupportTickets(req.vendor.id);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // KYC routes
  app.post("/api/kyc/upload", authenticateVendor, async (req, res) => {
    try {
      const { documentType, fileName, fileData } = z.object({
        documentType: z.enum(['government_id', 'proof_of_address', 'selfie']),
        fileName: z.string(),
        fileData: z.string(), // base64 encoded file
      }).parse(req.body);

      // Upload to Storj
      const storjPath = await storjService.uploadFile({
        vendorId: req.vendor.id,
        fileName,
        fileData,
        documentType,
      });

      // Save to database
      const kycDocument = await storage.createKycDocument({
        vendorId: req.vendor.id,
        documentType,
        storjPath,
        fileName,
        fileSize: Buffer.from(fileData, 'base64').length.toString(),
        mimeType: 'application/octet-stream', // Could be improved with actual MIME type detection
      });

      res.json(kycDocument);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/kyc", authenticateVendor, async (req, res) => {
    try {
      const documents = await storage.getVendorKycDocuments(req.vendor.id);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kyc/:id/download", authenticateVendor, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getKycDocument(id);

      if (!document || document.vendorId !== req.vendor.id) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const signedUrl = await storjService.getSignedUrl(document.storjPath);
      res.json({ downloadUrl: signedUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe webhook endpoint
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const event = stripeService.constructWebhookEvent(req.body, req.headers['stripe-signature'] as string);

      if (event.type === 'checkout.session.completed') {
        await stripeService.handlePaymentSuccess(event.data.object);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes (for KYC review, withdrawal processing, and user management)
  app.get("/api/admin/kyc-pending", async (req, res) => {
    try {
      // This would need admin authentication in production
      const documents = await storage.getAllPendingKycDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = z.object({
        status: z.enum(['approved', 'rejected']),
        reviewNotes: z.string().optional(),
      }).parse(req.body);

      const document = await storage.updateKycDocumentStatus(id, status, reviewNotes);

      // Check if all required documents are approved and verify vendor
      if (status === 'approved') {
        const vendorDocuments = await storage.getVendorKycDocuments(document.vendorId);
        const requiredTypes = ['government_id', 'proof_of_address', 'selfie'];
        const approvedTypes = vendorDocuments
          .filter((doc: any) => doc.status === 'approved')
          .map((doc: any) => doc.documentType);

        if (requiredTypes.every(type => approvedTypes.includes(type))) {
          await storage.updateVendorVerification(document.vendorId, true);
        }
      }

      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllVendors();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/:action", async (req, res) => {
    try {
      const { id, action } = req.params;

      let result;
      switch (action) {
        case 'verify':
          result = await storage.updateVendorVerification(id, true);
          break;
        case 'unverify':
          result = await storage.updateVendorVerification(id, false);
          break;
        case 'suspend':
          // Implement suspension logic - for now just unverify
          result = await storage.updateVendorVerification(id, false);
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawalRequests();
      res.json(withdrawals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/withdrawals/:id/process", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = z.object({
        status: z.enum(['approved', 'rejected']),
        notes: z.string().optional(),
      }).parse(req.body);

      const withdrawal = await storage.processWithdrawalRequest(id, status, notes);

      // If approved, update vendor balance
      if (status === 'approved' && withdrawal.vendor) {
        const currentBalance = parseFloat(withdrawal.vendor.balance || '0');
        const withdrawalAmount = parseFloat(withdrawal.amount);
        const newBalance = currentBalance - withdrawalAmount;

        await storage.updateVendorBalance(withdrawal.vendorId, newBalance.toString());
      }

      res.json(withdrawal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin support routes
  app.get("/api/admin/support/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/support/tickets/:id/respond", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminResponse } = z.object({
        status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
        adminResponse: z.string().optional(),
      }).parse(req.body);

      const ticket = await storage.updateSupportTicketStatus(id, status, adminResponse);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}