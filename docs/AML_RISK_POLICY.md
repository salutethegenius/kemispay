# KemisPay AML and Risk Policy (Lightweight)

## 1. Purpose and Scope

- This policy supports platform access controls, risk management, and record-keeping. KemisPay operates as a **platform / marketplace facilitator**, not a licensed money transmitter running payment rails.
- **Payer-side compliance** (KYC, AML, sanctions) is performed by our regulated payment partner (Transak). This policy focuses on **merchant onboarding**, **internal controls**, and **when to escalate**.

## 2. Reliance on Transak

- Customer (payer) identity verification, AML, and sanctions screening are performed by **Transak**, the regulated on/off ramp. KemisPay does not perform those functions.
- We rely on Transak’s compliance for the movement of funds and payer due diligence.

## 3. Merchant KYC and Withdrawal Review

- **Merchant KYC:** We collect and review merchant documents (e.g. government ID, proof of address, selfie) for platform access and risk. The Platform Operations Lead (or designated reviewer) reviews submissions for completeness and obvious red flags; suspicious or high-risk cases are escalated.
- **Withdrawals:** Withdrawal requests are reviewed before processing. Amounts or patterns above defined thresholds (see COMPLIANCE_THRESHOLDS.md) require enhanced review or escalation before approval.

## 4. Record Retention and Audit

- We retain:
  - Merchant KYC submissions and review outcomes (approve/reject, notes, reviewer, date)
  - Withdrawal requests and processing decisions (amount, status, processor, date)
  - Support tickets and responses
  - An audit log of admin/ops actions (who did what, when)
- Records are maintained for a minimum period consistent with applicable law and partner requirements (e.g. 5–7 years where typical for financial records). Exact retention periods should be confirmed with legal counsel.

## 5. Roles

- **Compliance Officer:** A designated person (internal or fractional) responsible for oversight of this policy and liaison with counsel. They do not need to be full-time at current scale.
- **Platform Operations Lead:** Reviews merchant KYC, processes withdrawals within policy, handles support, maintains audit trails, and escalates suspicious activity or high-risk decisions. They do **not** set compliance policy or interface with regulators directly; they escalate to the Compliance Officer or management.

## 6. Escalation and Enhanced Review

- **Escalation:** Suspicious activity, red flags on merchant KYC, or withdrawals above threshold (see COMPLIANCE_THRESHOLDS.md) must be escalated to the Compliance Officer or management before approval of high-risk transactions.
- **Enhanced review:** Triggered by threshold breaches (e.g. single withdrawal above $X, monthly volume above $Y). Document thresholds in COMPLIANCE_THRESHOLDS.md and keep config in sync.

## 7. Phase 2 (When Volumes or Model Change)

- When KemisPay custodies funds directly, settles fiat itself, issues cards under its own BIN, or moves from facilitator to principal, we will adopt:
  - Full transaction monitoring where required
  - SAR (Suspicious Activity Reporting) procedures and, if required, 24/7 ops
  - Independent AML vendor and/or continuous screening where appropriate
  - Quarterly or periodic third-party compliance audits as needed
- Re-engage legal counsel and update this policy when the business model or regulatory expectations change.
