import { 
  vendors, payments, paymentLinks, withdrawalRequests, kycDocuments, sessions,
  type Vendor, type InsertVendor, type Payment, type InsertPayment,
  type PaymentLink, type InsertPaymentLink, type WithdrawalRequest, type InsertWithdrawalRequest,
  type KycDocument, type InsertKycDocument, type Session, type InsertSession
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
  updateKycDocumentStatus(id: string, status: string, reviewNotes?: string): Promise<KycDocument>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
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
      .where(and(
        eq(sessions.token, token),
        // Check if session hasn't expired
      ));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
}

export const storage = new DatabaseStorage();
