# KemisPay Compliance Posture – Internal Memo (Draft)

> **Note:** This is an internal placeholder. Have a fintech lawyer produce a short formal memo before relying on it for partner or regulatory discussions.

## Purpose

This memo summarizes KemisPay’s regulatory posture as a **platform operator / program manager**, not a licensed money transmitter or money services business (MSB) operating payment rails directly.

## KemisPay’s Role

- **KemisPay** is a platform that enables merchants to accept payments and request withdrawals.
- KemisPay does **not**:
  - Custody funds in a discretionary way beyond pooled technical custody
  - Perform payer KYC, AML, or sanctions screening
  - Settle fiat to end users directly (e.g. direct bank settlement)
  - Issue cards under its own BIN
- KemisPay **does**:
  - Collect merchant KYC for platform access and risk controls
  - Maintain ledger balances and orchestrate access to payment and payout flows
  - Rely on a regulated third party for payer-facing compliance and fund movement

## Regulated Counterparty: Transak

- **Transak** is the regulated on-ramp and off-ramp for:
  - Customer (payer) identity verification (KYC)
  - AML and sanctions screening on payers and fund movement
  - Processing payments from payers and payouts to merchants (e.g. bank/card)
- KemisPay integrates with Transak; Transak is the regulated processor for those functions. KemisPay does not perform payer KYC, AML, or sanctions screening.

## Merchant KYC

- KemisPay collects and reviews merchant (vendor) KYC for:
  - Platform access and account integrity
  - Internal risk scoring and controls
  - Record-keeping and auditability
- This is distinct from payer-side compliance, which is handled by Transak.

## When to Re-assess

- If KemisPay begins to custody funds directly, settle fiat itself, issue cards under its own BIN, or act as principal rather than facilitator, the compliance posture and regulatory expectations (e.g. MSB licensing, third-party AML, SAR programs) should be re-assessed with legal counsel.

---

*Draft for internal use. Replace with counsel-approved memo before external use.*
