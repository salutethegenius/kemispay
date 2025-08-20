import { 
  vendors, payments, paymentLinks, withdrawalRequests, kycDocuments, sessions, supportTickets,
  type Vendor, type InsertVendor, type Payment, type InsertPayment,
  type PaymentLink, type InsertPaymentLink, type WithdrawalRequest, type InsertWithdrawalRequest,
  type KycDocument, type InsertKycDocument, type Session, type InsertSession,
  type SupportTicket, type InsertSupportTicket
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Vendor methods
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendorBalance(id: string, balance: string): Promise<Vendor>;
  updateVendorVerification(id: string, isVerified: boolean): Promise<Vendor>;
  updateVendorStripeCustomerId(id: string, stripeCustomerId: string): Promise<Vendor>;
  updateVendorTotalEarned(id: string, totalEarned: string): Promise<Vendor>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getVendorPayments(vendorId: string, limit?: number): Promise<Payment[]>;

  // Payment link methods
  createPaymentLink(paymentLink: InsertPaymentLink): Promise<PaymentLink>;
  getVendorPaymentLinks(vendorId: string): Promise<PaymentLink[]>;

  // Withdrawal methods
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getVendorWithdrawalRequests(vendorId: string): Promise<WithdrawalRequest[]>;
  updateWithdrawalStatus(id: string, status: string, notes?: string): Promise<WithdrawalRequest>;

  // KYC methods
  createKycDocument(document: InsertKycDocument): Promise<KycDocument>;
  getVendorKycDocuments(vendorId: string): Promise<KycDocument[]>;
  getKycDocument(id: string): Promise<KycDocument | undefined>;
  updateKycDocumentStatus(id: string, status: string, reviewNotes?: string): Promise<KycDocument>;

  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;

  // Support ticket methods
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getVendorSupportTickets(vendorId: string): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  updateSupportTicketStatus(id: string, status: string, adminResponse?: string): Promise<SupportTicket>;
  getAllSupportTickets(): Promise<any[]>;

  // Admin methods
  getAllPendingKycDocuments(): Promise<any[]>;
  getAllVendors(): Promise<Vendor[]>;
  updateVendorVerification(vendorId: string, isVerified: boolean): Promise<Vendor>;
  getAllWithdrawalRequests(): Promise<any[]>;
  processWithdrawalRequest(id: string, status: string, notes?: string): Promise<any>;
  updateVendorBalance(vendorId: string, newBalance: string): Promise<Vendor>;
  updateKycDocumentStatus(id: string, status: string, reviewNotes?: string): Promise<KycDocument>;
}

export class DatabaseStorage implements IStorage {
  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendorBalance(id: string, balance: string): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({ balance })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async updateVendorVerification(id: string, isVerified: boolean): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({ isVerified })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async updateVendorStripeCustomerId(id: string, stripeCustomerId: string): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({ stripeCustomerId })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async updateVendorTotalEarned(id: string, totalEarned: string): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({ totalEarned })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getVendorPayments(vendorId: string, limit = 10): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.vendorId, vendorId))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  }

  async createPaymentLink(insertPaymentLink: InsertPaymentLink): Promise<PaymentLink> {
    const [paymentLink] = await db
      .insert(paymentLinks)
      .values(insertPaymentLink)
      .returning();
    return paymentLink;
  }

  async getVendorPaymentLinks(vendorId: string): Promise<PaymentLink[]> {
    return await db
      .select()
      .from(paymentLinks)
      .where(eq(paymentLinks.vendorId, vendorId))
      .orderBy(desc(paymentLinks.createdAt));
  }

  async createWithdrawalRequest(insertRequest: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [request] = await db
      .insert(withdrawalRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async getVendorWithdrawalRequests(vendorId: string): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.vendorId, vendorId))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async updateWithdrawalStatus(id: string, status: string, notes?: string): Promise<WithdrawalRequest> {
    const [request] = await db
      .update(withdrawalRequests)
      .set({ 
        status, 
        notes,
        processedAt: status !== 'pending' ? new Date() : undefined
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request;
  }

  async createKycDocument(insertDocument: InsertKycDocument): Promise<KycDocument> {
    const [document] = await db
      .insert(kycDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getVendorKycDocuments(vendorId: string): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.vendorId, vendorId))
      .orderBy(desc(kycDocuments.uploadedAt));
  }

  async getKycDocument(id: string): Promise<KycDocument | undefined> {
    const [document] = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.id, id));
    return document || undefined;
  }

  async updateKycDocumentStatus(id: string, status: string, reviewNotes?: string): Promise<KycDocument> {
    const [document] = await db
      .update(kycDocuments)
      .set({ 
        status, 
        reviewNotes,
        reviewedAt: new Date()
      })
      .where(eq(kycDocuments.id, id))
      .returning();
    return document;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  // Support ticket methods
  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async getVendorSupportTickets(vendorId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.vendorId, vendorId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async updateSupportTicketStatus(id: string, status: string, adminResponse?: string): Promise<SupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({ 
        status, 
        adminResponse,
        updatedAt: new Date(),
        resolvedAt: status === 'resolved' || status === 'closed' ? new Date() : undefined
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return ticket;
  }

  async getAllSupportTickets(): Promise<any[]> {
    return await db
      .select({
        id: supportTickets.id,
        vendorId: supportTickets.vendorId,
        subject: supportTickets.subject,
        description: supportTickets.description,
        priority: supportTickets.priority,
        status: supportTickets.status,
        category: supportTickets.category,
        adminResponse: supportTickets.adminResponse,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        resolvedAt: supportTickets.resolvedAt,
        vendor: {
          id: vendors.id,
          name: vendors.name,
          email: vendors.email,
        }
      })
      .from(supportTickets)
      .leftJoin(vendors, eq(supportTickets.vendorId, vendors.id))
      .orderBy(desc(supportTickets.createdAt));
  }

  // Admin methods
  async getAllPendingKycDocuments() {
    return await db
      .select({
        id: kycDocuments.id,
        vendorId: kycDocuments.vendorId,
        documentType: kycDocuments.documentType,
        fileName: kycDocuments.fileName,
        fileSize: kycDocuments.fileSize,
        status: kycDocuments.status,
        uploadedAt: kycDocuments.uploadedAt,
        vendor: {
          id: vendors.id,
          name: vendors.name,
          email: vendors.email,
        }
      })
      .from(kycDocuments)
      .leftJoin(vendors, eq(kycDocuments.vendorId, vendors.id))
      .where(eq(kycDocuments.status, 'pending'))
      .orderBy(desc(kycDocuments.uploadedAt));
  }

  async getAllVendors() {
    return await db
      .select()
      .from(vendors)
      .orderBy(desc(vendors.createdAt));
  }



  async getAllWithdrawalRequests() {
    return await db
      .select({
        id: withdrawalRequests.id,
        vendorId: withdrawalRequests.vendorId,
        amount: withdrawalRequests.amount,
        status: withdrawalRequests.status,
        requestedAt: withdrawalRequests.requestedAt,
        processedAt: withdrawalRequests.processedAt,
        notes: withdrawalRequests.notes,
        vendor: {
          id: vendors.id,
          name: vendors.name,
          email: vendors.email,
          balance: vendors.balance,
          bankAccount: vendors.bankAccount,
        }
      })
      .from(withdrawalRequests)
      .leftJoin(vendors, eq(withdrawalRequests.vendorId, vendors.id))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async processWithdrawalRequest(id: string, status: string, notes?: string) {
    const [withdrawal] = await db
      .update(withdrawalRequests)
      .set({ 
        status, 
        notes,
        processedAt: new Date() 
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();

    // Get the vendor info for balance updates
    const vendor = await this.getVendor(withdrawal.vendorId);
    return { ...withdrawal, vendor };
  }


}

export const storage = new DatabaseStorage();