import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  isVerified: boolean("is_verified").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  bankAccount: text("bank_account"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0.00"),
  lastPayoutDate: timestamp("last_payout_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  stripePaymentId: text("stripe_payment_id").notNull(),
  payerName: text("payer_name").notNull(),
  payerEmail: text("payer_email"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"),
  productName: text("product_name"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const paymentLinks = pgTable("payment_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  stripePaymentLinkId: text("stripe_payment_link_id").notNull(),
  productName: text("product_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").default(sql`now()`),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
});

export const kycDocuments = pgTable("kyc_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  documentType: text("document_type").notNull(), // 'government_id', 'proof_of_address', 'selfie'
  storjPath: text("storj_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size"),
  mimeType: text("mime_type"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  payments: many(payments),
  paymentLinks: many(paymentLinks),
  withdrawalRequests: many(withdrawalRequests),
  kycDocuments: many(kycDocuments),
  sessions: many(sessions),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  vendor: one(vendors, {
    fields: [payments.vendorId],
    references: [vendors.id],
  }),
}));

export const paymentLinksRelations = relations(paymentLinks, ({ one }) => ({
  vendor: one(vendors, {
    fields: [paymentLinks.vendorId],
    references: [vendors.id],
  }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  vendor: one(vendors, {
    fields: [withdrawalRequests.vendorId],
    references: [vendors.id],
  }),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  vendor: one(vendors, {
    fields: [kycDocuments.vendorId],
    references: [vendors.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  vendor: one(vendors, {
    fields: [sessions.vendorId],
    references: [vendors.id],
  }),
}));

// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentLinkSchema = createInsertSchema(paymentLinks).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  uploadedAt: true,
  reviewedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

// Types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PaymentLink = typeof paymentLinks.$inferSelect;
export type InsertPaymentLink = z.infer<typeof insertPaymentLinkSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
