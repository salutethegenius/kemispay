import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { ledgerService } from "./services/ledger";
import { supabaseStorageService } from "./services/supabase-storage";
import { getSupabaseUserFromToken } from "./services/supabase-auth";
import { EmailService } from "./services/email";
import { handleTransakWebhook } from "./services/transak";
import { complianceConfig, isAboveWithdrawalThreshold } from "./config/compliance";
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

const CLIENT_URL = process.env.CLIENT_URL || "https://kemispay.com";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function authenticateAdmin(req: Request, res: Response, next: Function) {
  if (!ADMIN_API_KEY) {
    return res.status(503).json({ message: "Admin not configured" });
  }
  const key = req.headers["x-admin-api-key"] ?? req.headers.authorization?.replace("Bearer ", "");
  if (key !== ADMIN_API_KEY) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
}

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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts; try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const waitlistJoinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many signups; try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: "Too many webhook requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", loginLimiter, async (req, res) => {
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

  app.post("/api/auth/verify", loginLimiter, async (req, res) => {
    try {
      const { accessToken } = z.object({ accessToken: z.string().min(1) }).parse(req.body);

      const supabaseUser = await getSupabaseUserFromToken(accessToken);
      // #region agent log
      fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes.ts:auth/verify',message:'Supabase user',data:{hasSupabaseUser:!!supabaseUser,hasEmail:!!supabaseUser?.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (!supabaseUser?.email) {
        return res.status(401).json({ message: "Invalid or expired magic link" });
      }

      let user = await storage.getUserBySupabaseUserId(supabaseUser.id);
      let path = user ? "bySupabaseId" : "";
      if (!user) {
        user = await storage.getUserByEmail(supabaseUser.email);
        if (user) {
          path = "byEmailThenUpdate";
          await storage.updateUserSupabaseId(user.id, supabaseUser.id);
        } else {
          path = "createNew";
          user = await storage.createUser({
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email.split("@")[0],
            supabaseUserId: supabaseUser.id,
          });
          await storage.createWallet({
            userId: user.id,
            balance: "0",
            currency: "USDC",
          });
        }
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
      // #region agent log
      fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes.ts:auth/verify:success',message:'Verify success',data:{userId:user?.id,path,isNewUser},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
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
      res.status(400).json({ message: error?.message ?? "Verification failed" });
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
  app.post("/api/transak/webhook", webhookLimiter, async (req, res) => {
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

  // Admin routes (require ADMIN_API_KEY in X-Admin-API-Key or Authorization: Bearer)
  // Operator identity: X-Operator-Email header or body.operatorEmail for audit trail
  function getAdminOperator(req: Request): string | undefined {
    const fromHeader = req.headers["x-operator-email"];
    if (typeof fromHeader === "string" && fromHeader.trim()) return fromHeader.trim();
    const body = req.body as { operatorEmail?: string };
    if (body?.operatorEmail && typeof body.operatorEmail === "string" && body.operatorEmail.trim()) return body.operatorEmail.trim();
    return undefined;
  }

  app.get("/api/admin/kyc-pending", authenticateAdmin, async (req, res) => {
    try {
      const documents = await storage.getAllPendingKycDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/review", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = z
        .object({
          status: z.enum(["approved", "rejected", "changes_requested"]),
          reviewNotes: z.string().optional(),
        })
        .parse(req.body);

      const { status, reviewNotes } = parsed;
      if (status === "changes_requested" && (!reviewNotes || !reviewNotes.trim())) {
        return res.status(400).json({ message: "Review notes are required when requesting changes" });
      }

      const actor = getAdminOperator(req);
      const document = await storage.updateKycDocumentStatus(id, status, reviewNotes, actor);
      // #region agent log
      fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'routes.ts:kyc/review',message:'KYC review',data:{status,hasReviewNotes:!!reviewNotes?.trim(),docId:id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      await storage.createAuditEvent({
        actor: actor ?? "admin",
        action: "kyc_reviewed",
        entityType: "kyc_document",
        entityId: id,
        newValue: { status, reviewNotes: reviewNotes ?? null, reviewedBy: actor ?? null },
      });

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

  app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/:action", authenticateAdmin, async (req, res) => {
    try {
      const { id, action } = req.params;
      const actor = getAdminOperator(req);

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

      await storage.createAuditEvent({
        actor: actor ?? "admin",
        action: `user_${action}`,
        entityType: "user",
        entityId: id,
        newValue: { action },
      });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/withdrawals", authenticateAdmin, async (req, res) => {
    try {
      const rows = await storage.getAllWithdrawalRequests();
      const withdrawals = rows.map((w: any) => ({
        ...w,
        aboveEnhancedReviewThreshold: isAboveWithdrawalThreshold(w.amount ?? 0),
      }));
      res.json({
        withdrawals,
        enhancedReviewWithdrawalAmount: complianceConfig.enhancedReviewWithdrawalAmount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/withdrawals/:id/process", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = z
        .object({
          status: z.enum(["approved", "rejected"]),
          notes: z.string().optional(),
        })
        .parse(req.body);

      const actor = getAdminOperator(req);
      const withdrawal = await storage.processWithdrawalRequest(id, status, notes, actor);
      await storage.createAuditEvent({
        actor: actor ?? "admin",
        action: "withdrawal_processed",
        entityType: "withdrawal_request",
        entityId: id,
        newValue: { status, notes: notes ?? null, processedBy: actor ?? null },
      });

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
            metadata: { processedBy: actor ?? "admin" },
          });
        }
      }

      res.json(withdrawal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/support/tickets", authenticateAdmin, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/support/tickets/:id/respond", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminResponse } = z
        .object({
          status: z.enum(["open", "in_progress", "resolved", "closed"]),
          adminResponse: z.string().optional(),
        })
        .parse(req.body);

      const actor = getAdminOperator(req);
      const ticket = await storage.updateSupportTicketStatus(id, status, adminResponse);
      await storage.createAuditEvent({
        actor: actor ?? "admin",
        action: "support_ticket_responded",
        entityType: "support_ticket",
        entityId: id,
        newValue: { status, hasResponse: !!adminResponse },
      });
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/audit-log", authenticateAdmin, async (req, res) => {
    try {
      const from = req.query.from ? new Date(String(req.query.from)) : undefined;
      const to = req.query.to ? new Date(String(req.query.to)) : undefined;
      const entityType = typeof req.query.entityType === "string" ? req.query.entityType : undefined;
      const actor = typeof req.query.actor === "string" ? req.query.actor : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
      if (from && isNaN(from.getTime())) return res.status(400).json({ message: "Invalid from date" });
      if (to && isNaN(to.getTime())) return res.status(400).json({ message: "Invalid to date" });
      const events = await storage.getAuditEvents({ from, to, entityType, actor, limit });
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/flag", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { flagReason } = z.object({ flagReason: z.string().min(1) }).parse(req.body);
      const actor = getAdminOperator(req);
      const document = await storage.updateKycDocumentFlag(id, flagReason, actor);
      await storage.createAuditEvent({
        actor: actor ?? "admin",
        action: "kyc_flagged",
        entityType: "kyc_document",
        entityId: id,
        newValue: { flagReason },
      });
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/admin/kyc/:id/escalate", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const actor = getAdminOperator(req);
      const document = await storage.updateKycDocumentEscalated(id, actor);
      await storage.createAuditEvent({
        actor: actor ?? "admin",
        action: "kyc_escalated",
        entityType: "kyc_document",
        entityId: id,
        newValue: {},
      });
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Waitlist routes
  app.post("/api/waitlist/join", waitlistJoinLimiter, async (req, res) => {
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

  app.get("/api/waitlist/entries", authenticateAdmin, async (req, res) => {
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
