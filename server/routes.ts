import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ledgerService } from "./services/ledger";
import { supabaseStorageService } from "./services/supabase-storage";
import { EmailService } from "./services/email";
import { handleTransakWebhook } from "./services/transak";
import { z } from "zod";
import { randomBytes } from "crypto";
import { nanoid } from "nanoid";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      wallet?: any;
    }
  }
}

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5000";

async function authenticateUser(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const session = await storage.getSessionByToken(token);
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const wallet = await storage.getWalletByUserId(user.id);
    req.user = user;
    req.wallet = wallet;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);

      let user = await storage.getUserByEmail(email);

      if (!user) {
        user = await storage.createUser({
          email,
          name: email.split("@")[0],
        });
        await storage.createWallet({
          userId: user.id,
          balance: "0",
          currency: "USDC",
        });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      const wallet = await storage.getWalletByUserId(user.id);
      const userPayments = await storage.getUserPayments(user.id);
      const isNewUser = userPayments.length === 0 && parseFloat(wallet?.balance ?? "0") === 0;

      res.json({
        token,
        vendor: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          balance: wallet?.balance ?? "0",
          totalEarned: wallet?.balance ?? "0",
          lastPayoutDate: null,
          bankAccount: null,
          stripeCustomerId: null,
        },
        isNewUser,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", authenticateUser, async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        await storage.deleteSession(token);
      }
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/vendor/profile", authenticateUser, async (req, res) => {
    const wallet = await storage.getWalletByUserId(req.user.id);
    res.json({
      ...req.user,
      balance: wallet?.balance ?? "0",
      totalEarned: wallet?.balance ?? "0",
      lastPayoutDate: null,
      bankAccount: null,
      stripeCustomerId: null,
    });
  });

  app.post("/api/vendor/refresh", authenticateUser, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const wallet = await storage.getWalletByUserId(req.user.id);
      res.json({
        ...user,
        balance: wallet?.balance ?? "0",
        totalEarned: wallet?.balance ?? "0",
        lastPayoutDate: null,
        bankAccount: null,
        stripeCustomerId: null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment link routes: create link with linkId, return app URL
  app.post("/api/payment-links", authenticateUser, async (req, res) => {
    try {
      const { productName, amount } = z
        .object({
          productName: z.string().min(1),
          amount: z.number().positive(),
        })
        .parse(req.body);

      const linkId = nanoid(12);
      const dbPaymentLink = await storage.createPaymentLink({
        linkId,
        userId: req.user.id,
        productName,
        amount: amount.toString(),
      });

      const paymentUrl = `${CLIENT_URL}/pay/${linkId}`;
      res.json({
        ...dbPaymentLink,
        url: paymentUrl,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/payment-links", authenticateUser, async (req, res) => {
    try {
      const links = await storage.getUserPaymentLinks(req.user.id);
      const baseUrl = CLIENT_URL;
      res.json(
        links.map((link) => ({
          ...link,
          url: `${baseUrl}/pay/${link.linkId}`,
        }))
      );
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public: get Transak widget URL for payment link (for /pay/:linkId page)
  app.get("/api/transak/widget-url", async (req, res) => {
    try {
      const { linkId } = req.query;
      if (!linkId || typeof linkId !== "string") {
        return res.status(400).json({ message: "linkId required" });
      }
      const { getWidgetUrlForPaymentLink } = await import("./services/transak");
      const widgetUrl = await getWidgetUrlForPaymentLink(linkId);
      res.json({ widgetUrl });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Public: get payment link details for /pay/:linkId
  app.get("/api/payment-links/public/:linkId", async (req, res) => {
    try {
      const { linkId } = req.params;
      const link = await storage.getPaymentLinkByLinkId(linkId);
      if (!link || !link.isActive) {
        return res.status(404).json({ message: "Payment link not found" });
      }
      const user = await storage.getUser(link.userId);
      res.json({
        linkId: link.linkId,
        productName: link.productName,
        amount: link.amount,
        vendorName: user?.name ?? "Vendor",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payments", authenticateUser, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const payments = await storage.getUserPayments(req.user.id, limit);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Withdrawal routes (tier 1: auto under limit; tier 2: manual)
  const AUTO_WITHDRAWAL_LIMIT_USD = parseFloat(process.env.AUTO_WITHDRAWAL_LIMIT_USD ?? "500");
  const WITHDRAWAL_DAILY_CAP_USD = parseFloat(process.env.WITHDRAWAL_DAILY_CAP_USD ?? "500");

  app.post("/api/withdrawals", authenticateUser, async (req, res) => {
    try {
      const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);

      const wallet = await storage.getWalletByUserId(req.user.id);
      if (!wallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }
      const balance = parseFloat(wallet.balance ?? "0");
      if (amount > balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      if (amount < 25) {
        return res.status(400).json({ message: "Minimum withdrawal amount is $25" });
      }

      const allWithdrawals = await storage.getUserWithdrawalRequests(req.user.id);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayWithdrawals = allWithdrawals.filter(
        (w) => w.requestedAt && new Date(w.requestedAt) >= startOfToday && (w.status === "approved" || w.status === "pending")
      );
      const dailyTotal = todayWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount), 0);
      const underAmountLimit = amount <= AUTO_WITHDRAWAL_LIMIT_USD;
      const underDailyCap = dailyTotal + amount <= WITHDRAWAL_DAILY_CAP_USD;
      const tier: "auto" | "manual" = underAmountLimit && underDailyCap ? "auto" : "manual";

      const withdrawal = await storage.createWithdrawalRequest({
        userId: req.user.id,
        amount: amount.toString(),
        tier,
      });

      if (tier === "auto") {
        await ledgerService.debitWallet({
          walletId: wallet.id,
          amount,
          type: "withdrawal",
          referenceId: withdrawal.id,
          metadata: { tier: "auto" },
        });
        const updated = await storage.updateWithdrawalStatus(withdrawal.id, "approved");
        res.json(updated);
      } else {
        res.json(withdrawal);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/withdrawals", authenticateUser, async (req, res) => {
    try {
      const withdrawals = await storage.getUserWithdrawalRequests(req.user.id);
      res.json(withdrawals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Support ticket routes
  app.post("/api/support/tickets", authenticateUser, async (req, res) => {
    try {
      const { subject, description, priority, category } = z
        .object({
          subject: z.string().min(1).max(200),
          description: z.string().min(1).max(2000),
          priority: z.enum(["low", "medium", "high", "urgent"]),
          category: z.enum(["technical", "billing", "kyc", "withdrawal", "general"]),
        })
        .parse(req.body);

      const ticket = await storage.createSupportTicket({
        userId: req.user.id,
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

  app.get("/api/support/tickets", authenticateUser, async (req, res) => {
    try {
      const tickets = await storage.getUserSupportTickets(req.user.id);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transak webhook (ORDER_COMPLETED -> credit ledger)
  app.post("/api/transak/webhook", async (req, res) => {
    try {
      await handleTransakWebhook(req.body);
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // KYC routes
  app.post("/api/kyc/upload", authenticateUser, async (req, res) => {
    try {
      const { documentType, fileName, fileData } = z
        .object({
          documentType: z.enum(["government_id", "proof_of_address", "selfie"]),
          fileName: z.string(),
          fileData: z.string(),
        })
        .parse(req.body);

      if (!supabaseStorageService) {
        return res.status(503).json({ message: "File storage (Supabase) not configured" });
      }
      const storjPath = await supabaseStorageService.uploadFile({
        userId: req.user.id,
        fileName,
        fileData,
        documentType,
      });

      const kycDocument = await storage.createKycDocument({
        userId: req.user.id,
        documentType,
        storjPath,
        fileName,
        fileSize: Buffer.from(fileData, "base64").length.toString(),
        mimeType: "application/octet-stream",
      });

      res.json(kycDocument);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/kyc", authenticateUser, async (req, res) => {
    try {
      const documents = await storage.getUserKycDocuments(req.user.id);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/kyc/:id/download", authenticateUser, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getKycDocument(id);

      if (!document || document.userId !== req.user.id) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (!supabaseStorageService) {
        return res.status(503).json({ message: "File storage (Supabase) not configured" });
      }
      const signedUrl = await supabaseStorageService.getSignedUrl(document.storjPath);
      res.json({ downloadUrl: signedUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/kyc-pending", async (req, res) => {
    try {
      const documents = await storage.getAllPendingKycDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/review", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = z
        .object({
          status: z.enum(["approved", "rejected"]),
          reviewNotes: z.string().optional(),
        })
        .parse(req.body);

      const document = await storage.updateKycDocumentStatus(id, status, reviewNotes);

      if (status === "approved") {
        const userDocuments = await storage.getUserKycDocuments(document.userId);
        const requiredTypes = ["government_id", "proof_of_address", "selfie"];
        const approvedTypes = userDocuments
          .filter((doc: any) => doc.status === "approved")
          .map((doc: any) => doc.documentType);

        if (requiredTypes.every((type) => approvedTypes.includes(type))) {
          await storage.updateUserVerification(document.userId, true);
        }
      }

      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
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
        case "verify":
          result = await storage.updateUserVerification(id, true);
          break;
        case "unverify":
          result = await storage.updateUserVerification(id, false);
          break;
        case "suspend":
          result = await storage.updateUserVerification(id, false);
          break;
        default:
          return res.status(400).json({ message: "Invalid action" });
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
      const { status, notes } = z
        .object({
          status: z.enum(["approved", "rejected"]),
          notes: z.string().optional(),
        })
        .parse(req.body);

      const withdrawal = await storage.processWithdrawalRequest(id, status, notes);

      if (status === "approved" && withdrawal.userId) {
        const wallet = await storage.getWalletByUserId(withdrawal.userId);
        if (wallet) {
          const currentBalance = parseFloat(wallet.balance ?? "0");
          const withdrawalAmount = parseFloat(withdrawal.amount);
          const newBalance = currentBalance - withdrawalAmount;
          await ledgerService.debitWallet({
            walletId: wallet.id,
            amount: withdrawalAmount,
            type: "withdrawal",
            referenceId: id,
            metadata: { processedBy: "admin" },
          });
        }
      }

      res.json(withdrawal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

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
      const { status, adminResponse } = z
        .object({
          status: z.enum(["open", "in_progress", "resolved", "closed"]),
          adminResponse: z.string().optional(),
        })
        .parse(req.body);

      const ticket = await storage.updateSupportTicketStatus(id, status, adminResponse);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Waitlist routes
  app.post("/api/waitlist/join", async (req, res) => {
    try {
      const { name, email, phoneNumber } = z
        .object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Invalid email address"),
          phoneNumber: z.string().min(1, "Phone number is required"),
        })
        .parse(req.body);

      const existing = await storage.getWaitlistByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already on waitlist" });
      }

      const entry = await storage.createWaitlistEntry({
        name,
        email,
        phoneNumber,
      });

      const emailSent = await EmailService.sendWaitlistConfirmation(name, email);

      if (emailSent) {
        await storage.updateWaitlistConfirmation(entry.id);
      }

      res.json({
        success: true,
        message: "You're in! Check your email for confirmation.",
      });
    } catch (error: any) {
      if (error.issues && Array.isArray(error.issues)) {
        const errorMessage = error.issues.map((issue: any) => issue.message).join(", ");
        return res.status(400).json({ message: errorMessage });
      }
      res.status(400).json({ message: error.message || "Failed to join waitlist" });
    }
  });

  app.get("/api/waitlist/entries", async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
