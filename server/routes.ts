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
      res.status(400).json({ message: error.message });
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

  // Admin routes (for KYC review and withdrawal processing)
  app.get("/api/admin/kyc-pending", async (req, res) => {
    try {
      // This would need admin authentication in production
      const documents = await storage.getVendorKycDocuments('all'); // Need to implement this method
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
      
      // If all required documents are approved, verify the vendor
      // This logic would need to be implemented

      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
