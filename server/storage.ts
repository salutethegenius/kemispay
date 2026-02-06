import {
  users,
  wallets,
  payments,
  paymentLinks,
  withdrawalRequests,
  kycDocuments,
  sessions,
  supportTickets,
  waitlist,
  auditEvents,
  type User,
  type InsertUser,
  type Wallet,
  type InsertWallet,
  type Payment,
  type InsertPayment,
  type PaymentLink,
  type InsertPaymentLink,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type KycDocument,
  type InsertKycDocument,
  type Session,
  type InsertSession,
  type SupportTicket,
  type InsertSupportTicket,
  type Waitlist,
  type InsertWaitlist,
  type AuditEvent,
  type InsertAuditEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySupabaseUserId(supabaseUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: string, isVerified: boolean): Promise<User>;
  updateUserSupabaseId(userId: string, supabaseUserId: string): Promise<User>;

  // Wallet methods
  getWalletByUserId(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getUserPayments(userId: string, limit?: number): Promise<Payment[]>;
  getPaymentByTransakOrderId(transakOrderId: string): Promise<Payment | undefined>;

  // Payment link methods
  createPaymentLink(paymentLink: InsertPaymentLink): Promise<PaymentLink>;
  getUserPaymentLinks(userId: string): Promise<PaymentLink[]>;
  getPaymentLinkByLinkId(linkId: string): Promise<PaymentLink | undefined>;
  getPaymentLinkById(id: string): Promise<PaymentLink | undefined>;

  // Withdrawal methods
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]>;
  updateWithdrawalStatus(id: string, status: string, notes?: string): Promise<WithdrawalRequest>;
  processWithdrawalRequest(id: string, status: string, notes?: string, actor?: string): Promise<WithdrawalRequest & { user?: User }>;

  // KYC methods
  createKycDocument(document: InsertKycDocument): Promise<KycDocument>;
  getUserKycDocuments(userId: string): Promise<KycDocument[]>;
  getKycDocument(id: string): Promise<KycDocument | undefined>;
  updateKycDocumentStatus(id: string, status: string, reviewNotes?: string, actor?: string): Promise<KycDocument>;
  updateKycDocumentFlag(id: string, flagReason: string, actor?: string): Promise<KycDocument>;
  updateKycDocumentEscalated(id: string, actor?: string): Promise<KycDocument>;

  // Audit
  createAuditEvent(event: InsertAuditEvent): Promise<AuditEvent>;
  getAuditEvents(filters?: { from?: Date; to?: Date; entityType?: string; actor?: string; limit?: number }): Promise<AuditEvent[]>;

  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;

  // Support ticket methods
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getUserSupportTickets(userId: string): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  updateSupportTicketStatus(id: string, status: string, adminResponse?: string): Promise<SupportTicket>;
  getAllSupportTickets(): Promise<any[]>;

  // Admin methods
  getAllPendingKycDocuments(): Promise<any[]>;
  getAllUsers(): Promise<User[]>;
  updateUserVerification(userId: string, isVerified: boolean): Promise<User>;
  getAllWithdrawalRequests(): Promise<any[]>;
  updateWalletBalance(walletId: string, balance: string): Promise<Wallet>;

  // Waitlist methods
  createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist>;
  getWaitlistByEmail(email: string): Promise<Waitlist | undefined>;
  getAllWaitlistEntries(): Promise<Waitlist[]>;
  updateWaitlistConfirmation(id: string): Promise<Waitlist>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserBySupabaseUserId(supabaseUserId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.supabaseUserId, supabaseUserId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserVerification(id: string, isVerified: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isVerified })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSupabaseId(userId: string, supabaseUserId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ supabaseUserId })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet || undefined;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getUserPayments(userId: string, limit = 10): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  }

  async getPaymentByTransakOrderId(transakOrderId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.transakOrderId, transakOrderId));
    return payment || undefined;
  }

  async createPaymentLink(insertPaymentLink: InsertPaymentLink): Promise<PaymentLink> {
    const [paymentLink] = await db.insert(paymentLinks).values(insertPaymentLink).returning();
    return paymentLink;
  }

  async getUserPaymentLinks(userId: string): Promise<PaymentLink[]> {
    return await db
      .select()
      .from(paymentLinks)
      .where(eq(paymentLinks.userId, userId))
      .orderBy(desc(paymentLinks.createdAt));
  }

  async getPaymentLinkByLinkId(linkId: string): Promise<PaymentLink | undefined> {
    const [link] = await db.select().from(paymentLinks).where(eq(paymentLinks.linkId, linkId));
    return link || undefined;
  }

  async getPaymentLinkById(id: string): Promise<PaymentLink | undefined> {
    const [link] = await db.select().from(paymentLinks).where(eq(paymentLinks.id, id));
    return link || undefined;
  }

  async createWithdrawalRequest(insertRequest: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [request] = await db.insert(withdrawalRequests).values(insertRequest).returning();
    return request;
  }

  async getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async updateWithdrawalStatus(id: string, status: string, notes?: string): Promise<WithdrawalRequest> {
    const [request] = await db
      .update(withdrawalRequests)
      .set({
        status,
        notes,
        processedAt: status !== "pending" ? new Date() : undefined,
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request;
  }

  async processWithdrawalRequest(id: string, status: string, notes?: string, actor?: string): Promise<WithdrawalRequest & { user?: User }> {
    const [withdrawal] = await db
      .update(withdrawalRequests)
      .set({
        status,
        notes,
        processedAt: new Date(),
        processedBy: actor ?? null,
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    const user = withdrawal ? await this.getUser(withdrawal.userId) : undefined;
    return { ...withdrawal!, user };
  }

  async createKycDocument(insertDocument: InsertKycDocument): Promise<KycDocument> {
    const [document] = await db.insert(kycDocuments).values(insertDocument).returning();
    return document;
  }

  async getUserKycDocuments(userId: string): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.userId, userId))
      .orderBy(desc(kycDocuments.uploadedAt));
  }

  async getKycDocument(id: string): Promise<KycDocument | undefined> {
    const [document] = await db.select().from(kycDocuments).where(eq(kycDocuments.id, id));
    return document || undefined;
  }

  async updateKycDocumentStatus(id: string, status: string, reviewNotes?: string, actor?: string): Promise<KycDocument> {
    const [document] = await db
      .update(kycDocuments)
      .set({
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: actor ?? null,
      })
      .where(eq(kycDocuments.id, id))
      .returning();
    return document;
  }

  async updateKycDocumentFlag(id: string, flagReason: string, actor?: string): Promise<KycDocument> {
    const [document] = await db
      .update(kycDocuments)
      .set({
        flaggedAt: new Date(),
        flagReason: flagReason || null,
      })
      .where(eq(kycDocuments.id, id))
      .returning();
    return document;
  }

  async updateKycDocumentEscalated(id: string, actor?: string): Promise<KycDocument> {
    const [document] = await db
      .update(kycDocuments)
      .set({ escalatedAt: new Date() })
      .where(eq(kycDocuments.id, id))
      .returning();
    return document;
  }

  async createAuditEvent(event: InsertAuditEvent): Promise<AuditEvent> {
    const [e] = await db.insert(auditEvents).values(event).returning();
    return e;
  }

  async getAuditEvents(filters?: { from?: Date; to?: Date; entityType?: string; actor?: string; limit?: number }): Promise<AuditEvent[]> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.from) conditions.push(gte(auditEvents.createdAt, filters.from));
    if (filters?.to) conditions.push(lte(auditEvents.createdAt, filters.to));
    if (filters?.entityType) conditions.push(eq(auditEvents.entityType, filters.entityType));
    if (filters?.actor) conditions.push(eq(auditEvents.actor, filters.actor));
    const limit = filters?.limit ?? 200;
    const base = conditions.length > 0
      ? db.select().from(auditEvents).where(and(...conditions))
      : db.select().from(auditEvents);
    const rows = await base.orderBy(desc(auditEvents.createdAt)).limit(limit);
    return rows;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets).values(insertTicket).returning();
    return ticket;
  }

  async getUserSupportTickets(userId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async updateSupportTicketStatus(id: string, status: string, adminResponse?: string): Promise<SupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({
        status,
        adminResponse,
        updatedAt: new Date(),
        resolvedAt: status === "resolved" || status === "closed" ? new Date() : undefined,
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  async getAllSupportTickets(): Promise<any[]> {
    return await db
      .select({
        id: supportTickets.id,
        userId: supportTickets.userId,
        subject: supportTickets.subject,
        description: supportTickets.description,
        priority: supportTickets.priority,
        status: supportTickets.status,
        category: supportTickets.category,
        adminResponse: supportTickets.adminResponse,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        resolvedAt: supportTickets.resolvedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getAllPendingKycDocuments() {
    return await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        documentType: kycDocuments.documentType,
        fileName: kycDocuments.fileName,
        fileSize: kycDocuments.fileSize,
        status: kycDocuments.status,
        uploadedAt: kycDocuments.uploadedAt,
        flaggedAt: kycDocuments.flaggedAt,
        flagReason: kycDocuments.flagReason,
        escalatedAt: kycDocuments.escalatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(inArray(kycDocuments.status, ["pending", "rejected", "changes_requested"]))
      .orderBy(desc(kycDocuments.uploadedAt));
  }

  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllWithdrawalRequests() {
    return await db
      .select({
        id: withdrawalRequests.id,
        userId: withdrawalRequests.userId,
        amount: withdrawalRequests.amount,
        status: withdrawalRequests.status,
        tier: withdrawalRequests.tier,
        requestedAt: withdrawalRequests.requestedAt,
        processedAt: withdrawalRequests.processedAt,
        notes: withdrawalRequests.notes,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        wallet: {
          balance: wallets.balance,
        },
      })
      .from(withdrawalRequests)
      .leftJoin(users, eq(withdrawalRequests.userId, users.id))
      .leftJoin(wallets, eq(wallets.userId, withdrawalRequests.userId))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async updateWalletBalance(walletId: string, balance: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance, updatedAt: new Date() })
      .where(eq(wallets.id, walletId))
      .returning();
    return wallet;
  }

  async createWaitlistEntry(entry: InsertWaitlist): Promise<Waitlist> {
    const [result] = await db.insert(waitlist).values(entry).returning();
    return result;
  }

  async getWaitlistByEmail(email: string): Promise<Waitlist | undefined> {
    const [result] = await db.select().from(waitlist).where(eq(waitlist.email, email));
    return result || undefined;
  }

  async getAllWaitlistEntries(): Promise<Waitlist[]> {
    return await db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
  }

  async updateWaitlistConfirmation(id: string): Promise<Waitlist> {
    const [result] = await db
      .update(waitlist)
      .set({ confirmationSent: true })
      .where(eq(waitlist.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
