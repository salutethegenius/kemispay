import { db } from "../db";
import { wallets, ledgerEntries } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const PLATFORM_FEE_PERCENT = 0.015; // 1.5%

export type LedgerEntryType = "payment" | "withdrawal" | "fee" | "adjustment";

export interface CreditParams {
  walletId: string;
  amount: number;
  type: LedgerEntryType;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export interface DebitParams {
  walletId: string;
  amount: number;
  type: LedgerEntryType;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

export class LedgerService {
  async creditWallet(params: CreditParams): Promise<string> {
    const { walletId, amount, type, referenceId, metadata } = params;
    if (amount <= 0) throw new Error("Credit amount must be positive");

    const [entry] = await db
      .insert(ledgerEntries)
      .values({
        walletId,
        amount: amount.toFixed(6),
        type,
        referenceId,
        metadata: metadata ?? null,
      })
      .returning({ id: ledgerEntries.id });

    await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId));

    return entry.id;
  }

  async debitWallet(params: DebitParams): Promise<string> {
    const { walletId, amount, type, referenceId, metadata } = params;
    if (amount <= 0) throw new Error("Debit amount must be positive");

    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId));
    if (!wallet) throw new Error("Wallet not found");
    const currentBalance = parseFloat(wallet.balance ?? "0");
    if (currentBalance < amount) throw new Error("Insufficient balance");

    const [entry] = await db
      .insert(ledgerEntries)
      .values({
        walletId,
        amount: (-amount).toFixed(6),
        type,
        referenceId,
        metadata: metadata ?? null,
      })
      .returning({ id: ledgerEntries.id });

    await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId));

    return entry.id;
  }

  computePlatformFee(amount: number): number {
    return Math.round(amount * PLATFORM_FEE_PERCENT * 1e6) / 1e6;
  }

  getPlatformFeePercent(): number {
    return PLATFORM_FEE_PERCENT * 100;
  }
}

export const ledgerService = new LedgerService();
