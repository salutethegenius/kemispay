# KemisPay Wallet Setup

Customer payments (via Transak) send USDC to your **custody wallet**. This guide explains how to set it up.

## Quick Start (Testing)

1. **Create a MetaMask wallet** (or use an existing one)
   - Install [MetaMask](https://metamask.io) extension
   - Create a new wallet or use an existing one
   - Copy your **Ethereum address** (starts with `0x`, 42 characters total)

2. **Add to `.env`**
   ```
   KEMISPAY_CUSTODY_WALLET_ADDRESS=0xYourAddressHere...
   ```

3. **Restart the server** and try a payment link again.

## How It Works

- **Customer** pays with card (Visa, etc.) via Transak
- **Transak** converts fiat → USDC and sends it to your custody wallet
- **KemisPay** receives a webhook, credits the vendor's ledger balance
- **Vendor** withdraws from their ledger (separate flow)

The customer never sees or enters a wallet address—USDC is sent directly to your custody address.

## Production

For production, use a more secure custody setup:

| Option | Use case |
|--------|----------|
| **Gnosis Safe (2-of-3)** | Recommended for production—requires 2 of 3 signers to move funds |
| **Dedicated EOA** | Simpler; use a fresh wallet, never share the private key |
| **Fireblocks / custody provider** | Enterprise-grade institutional custody |

Your `.env.example` mentions Gnosis Safe 2-of-3—that’s a solid choice for production custody.
