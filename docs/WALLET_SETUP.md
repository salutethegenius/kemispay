# KemisPay Wallet Setup

Customer card payments send USDC to your **custody wallet** on **Solana**. We use Solana for lower fees and faster finality; Transak supports Solana USDC. This guide explains how to set it up.

## Quick Start (Testing)

1. **Create a Solana wallet** (e.g. Phantom)
   - Install [Phantom](https://phantom.app) (or another Solana wallet)
   - Create a new wallet or use an existing one
   - Copy your **Solana address** (base58, typically 32–44 characters; no `0x`)

2. **Add to `.env`**
   ```
   KEMISPAY_CUSTODY_WALLET_ADDRESS=YourSolanaAddressHere...
   ```

3. **Restart the server** and try a payment link again.

## How It Works

For the full 6-step flow, see [PAYMENT_FLOW.md](PAYMENT_FLOW.md).

- **Customer** pays with card (Visa, etc.) on KemisPay
- **KemisPay** converts fiat → USDC and sends it to your custody wallet on Solana
- **KemisPay** receives the payment, credits the business owner's ledger balance
- **Business owner** withdraws from their ledger (separate flow)

The customer never sees or enters a wallet address—USDC is sent directly to your custody address.

## Production

For production, use a more secure custody setup:

| Option | Use case |
|--------|----------|
| **Multisig / custody provider** | Recommended for production—requires multiple signers or institutional custody |
| **Dedicated hot wallet** | Simpler; use a fresh Solana wallet, never share the private key |
| **Fireblocks / custody provider** | Enterprise-grade institutional custody |

Custody is now USDC on Solana (lower fees, faster finality). Your `.env` must contain a valid Solana address (base58) for `KEMISPAY_CUSTODY_WALLET_ADDRESS`.
