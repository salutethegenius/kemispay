import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { ledgerService } from "./ledger";

const TRANSAK_ACCESS_TOKEN = process.env.TRANSAK_ACCESS_TOKEN;
const TRANSAK_API_KEY = process.env.TRANSAK_API_KEY;
const TRANSAK_BASE_URL = process.env.TRANSAK_BASE_URL || "https://global-stg.transak.com";
const KEMISPAY_CUSTODY_WALLET_ADDRESS = process.env.KEMISPAY_CUSTODY_WALLET_ADDRESS;
const CLIENT_URL = process.env.CLIENT_URL || "https://kemispay.com";

function isEthereumAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test((addr || "").trim());
}
function isSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test((addr || "").trim());
}
function custodyNetwork(addr: string): "ethereum" | "solana" {
  const a = (addr || "").trim();
  if (isEthereumAddress(a)) return "ethereum";
  if (isSolanaAddress(a)) return "solana";
  return "solana"; // default for validation message
}

export interface TransakWebhookPayload {
  data?: string; // JWT encrypted
  webhookData?: TransakWebhookData;
  eventID?: string;
}

export interface TransakWebhookData {
  id: string;
  walletAddress?: string;
  status?: string;
  cryptoCurrency?: string;
  cryptoAmount?: number;
  fiatAmount?: number;
  userId?: string;
  partnerOrderId?: string; // we pass linkId when opening widget
  [key: string]: unknown;
}

function decryptWebhookPayload(body: { data?: string }): { webhookData: TransakWebhookData; eventID?: string } {
  if (!TRANSAK_ACCESS_TOKEN) {
    throw new Error("TRANSAK_ACCESS_TOKEN is not set");
  }
  const encrypted = body.data;
  if (!encrypted || typeof encrypted !== "string") {
    throw new Error("Webhook payload missing data field");
  }
  const decoded = jwt.verify(encrypted, TRANSAK_ACCESS_TOKEN) as {
    webhookData?: TransakWebhookData;
    eventID?: string;
    id?: string;
    status?: string;
    [key: string]: unknown;
  };
  const webhookData = (decoded.webhookData ?? decoded) as TransakWebhookData;
  const eventID = decoded.eventID;
  return { webhookData, eventID };
}

export async function handleTransakWebhook(body: { data?: string }): Promise<void> {
  const { webhookData, eventID } = decryptWebhookPayload(body);

  if (eventID === "ORDER_COMPLETED" && webhookData.status === "COMPLETED") {
    const orderId = webhookData.id;
    const walletAddress = (webhookData.walletAddress ?? "").trim();
    const custodyAddress = (KEMISPAY_CUSTODY_WALLET_ADDRESS ?? "").trim();
    const match =
      custodyAddress &&
      (isEthereumAddress(custodyAddress)
        ? walletAddress.toLowerCase() === custodyAddress.toLowerCase()
        : walletAddress === custodyAddress);
    if (!match) {
      if (custodyAddress && walletAddress) {
        console.warn(
          "[Transak webhook] Custody address mismatch (order " +
            orderId +
            "). Webhook wallet: ..." +
            walletAddress.slice(-6) +
            " vs env: ..." +
            custodyAddress.slice(-6)
        );
      }
      return;
    }

    // Idempotency: already processed?
    const existing = await storage.getPaymentByTransakOrderId(orderId);
    if (existing) {
      return;
    }

    // Resolve user from partnerOrderId (linkId) or from order metadata
    const linkId = webhookData.partnerOrderId ?? (webhookData as any).partnerOrderId;
    if (!linkId) {
      throw new Error("ORDER_COMPLETED missing partnerOrderId (linkId)");
    }

    const paymentLink = await storage.getPaymentLinkByLinkId(linkId);
    if (!paymentLink) {
      throw new Error(`Payment link not found for linkId: ${linkId}`);
    }

    const user = await storage.getUser(paymentLink.userId);
    if (!user) {
      throw new Error("User not found for payment link");
    }

    const wallet = await storage.getWalletByUserId(user.id);
    if (!wallet) {
      throw new Error("Wallet not found for user");
    }

    // Amount: use cryptoAmount (USDC) from Transak, or fiatAmount converted
    const rawAmount = webhookData.cryptoAmount ?? webhookData.fiatAmount ?? 0;
    const amount = typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount));
    if (amount <= 0) {
      throw new Error("Invalid amount in webhook");
    }

    const platformFee = ledgerService.computePlatformFee(amount);
    const netAmount = amount - platformFee;

    await storage.createPayment({
      userId: user.id,
      transakOrderId: orderId,
      paymentLinkId: paymentLink.id,
      payerName: null,
      payerEmail: null,
      amount: amount.toFixed(6),
      platformFee: platformFee.toFixed(6),
      netAmount: netAmount.toFixed(6),
      status: "completed",
      productName: paymentLink.productName,
    });

    await ledgerService.creditWallet({
      walletId: wallet.id,
      amount: netAmount,
      type: "payment",
      referenceId: orderId,
      metadata: { linkId, transakOrderId: orderId },
    });
    console.info("[Transak webhook] Credited order " + orderId + " amount " + netAmount + " USDC (link " + linkId + ")");
  }

  if (eventID === "ORDER_FAILED" || eventID === "ORDER_REFUNDED") {
    // Optional: update payment status or reverse ledger if we had created a record
    const orderId = webhookData.id;
    const payment = await storage.getPaymentByTransakOrderId(orderId);
    if (payment) {
      // Could mark payment as failed/refunded and reverse ledger entry
      // For MVP we only credit on ORDER_COMPLETED; no pre-creation on ORDER_PROCESSING
    }
  }
}

export async function getWidgetUrlForPaymentLink(linkId: string): Promise<string> {
  const paymentLink = await storage.getPaymentLinkByLinkId(linkId);
  if (!paymentLink || !paymentLink.isActive) {
    throw new Error("Payment link not found");
  }
  if (!TRANSAK_API_KEY || !KEMISPAY_CUSTODY_WALLET_ADDRESS) {
    throw new Error("Transak or custody wallet not configured");
  }
  const addr = (KEMISPAY_CUSTODY_WALLET_ADDRESS || "").trim();
  const network = custodyNetwork(addr);
  if (!isEthereumAddress(addr) && !isSolanaAddress(addr)) {
    throw new Error(
      "KEMISPAY_CUSTODY_WALLET_ADDRESS must be a valid Ethereum (0x + 40 hex) or Solana (base58) address. " +
        "Set it in .env - see docs/WALLET_SETUP.md for wallet setup."
    );
  }

  const referrerDomain = new URL(CLIENT_URL).hostname;
  const defaultFiatAmount = Math.round(parseFloat(paymentLink.amount));
  const params = new URLSearchParams({
    apiKey: TRANSAK_API_KEY,
    referrerDomain,
    walletAddress: addr,
    disableWalletAddressForm: "true", // Customer pays to our custody wallet; no wallet screen
    network,
    cryptoCurrencyCode: "USDC",
    defaultFiatAmount: String(defaultFiatAmount),
    fiatCurrency: "USD",
    partnerOrderId: linkId,
    redirectURL: `${CLIENT_URL}/payment-success`,
    productsAvailed: "BUY",
  });
  return `${TRANSAK_BASE_URL}?${params.toString()}`;
}
