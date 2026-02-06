# KemisPay Payment Flow

This document describes the end-to-end flow from payment link creation to payout. It is the canonical reference for how funds move through the platform.

---

## Step 1 – Business owner creates a payment link

- The business owner enters the amount and purpose (e.g. $200 haircut).
- KemisPay generates a unique payment link.
- The customer uses the link to pay.

---

## Step 2 – Customer pays

- The customer chooses their payment method (card, bank, Apple Pay, etc.).
- The payment provider handles:
  - Payment processing
  - KYC/AML for the payer
  - Conversion to stablecoin if needed
- Funds (e.g. USDC) are sent to KemisPay’s custodial wallet.
- KemisPay updates the business owner’s internal ledger/wallet balance to reflect the received payment.

---

## Step 3 – Business owner sees balance in KemisPay

- The business owner’s account now shows the paid amount (e.g. $200).
- Funds remain in KemisPay custody until withdrawal.

---

## Step 4 – Business owner requests a withdrawal

- The business owner clicks “Withdraw”.
- Platform logic:
  1. Checks balance
  2. Confirms funds are available
  3. Marks the requested amount as in progress

---

## Step 5 – Payout

- The backend calls the payout API (e.g. Transak Stream or equivalent).
- The payout provider converts the balance (e.g. USDC) to fiat if necessary.
- The payout provider pays out to:
  - The business owner’s bank account, or
  - The business owner’s debit card (Visa/Mastercard) on file
- The business owner receives funds: instant to card or 1–3 days to bank, depending on payout type and region.

---

## Step 6 – Platform update

- The backend updates the business owner’s ledger:
  - Deducts the withdrawn amount
  - Logs the payout transaction
  - Optionally sends a notification (e.g. “$200 paid to your bank/card”)

---

## Key takeaways

- **Custodial wallet** holds funds until withdrawal.
- **In-app balance** is ledger accounting only; it does not represent separate physical custody.
- **Withdrawal** only occurs if the balance is sufficient.
- **Payout provider** handles compliance, conversion, and delivery to bank or card.
- You do not need to issue cards yourself; the payout provider can send funds directly to the business owner’s existing bank account or debit card.

---

## Regulated counterparty

**Transak** is the regulated counterparty for payer KYC, AML, sanctions, and fund movement. KemisPay does not perform those functions; the platform orchestrates access and relies on Transak for regulated processing.

## Technical note

The current implementation uses Transak for both customer payments (Step 2) and business owner payouts (Step 5). Custody is on **Solana** for lower fees and faster finality; **Transak supports Solana USDC**. USDC is received at your Solana address; the Transak widget uses `network=solana` when `KEMISPAY_CUSTODY_WALLET_ADDRESS` is a Solana (base58) address. Payment links open the Transak widget; webhooks credit the ledger when the custody address matches. Withdrawals are processed via the payout provider’s API. See [WALLET_SETUP.md](WALLET_SETUP.md) for Solana custody wallet configuration.
