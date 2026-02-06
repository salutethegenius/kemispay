# Compliance Thresholds – Enhanced Review

Thresholds above which the Platform Operations Lead must perform **enhanced review** or **escalate** before approving. Do not approve high-risk or above-threshold items without escalation to the Compliance Officer or management.

## Withdrawal thresholds

| Threshold | Default (example) | Purpose |
|-----------|-------------------|---------|
| Single withdrawal amount | e.g. $10,000 USD | Single withdrawal above this triggers “Above threshold – enhanced review” in the dashboard. Escalate before approving. |
| Monthly volume per merchant | Optional; e.g. $50,000 USD | If implemented, monthly volume above this per merchant triggers enhanced review. |

- Values are configured in server config (e.g. `ENHANCED_REVIEW_WITHDRAWAL_AMOUNT`, `ENHANCED_REVIEW_MONTHLY_VOLUME`). Keep this doc and config in sync.
- When in doubt, escalate; do not approve above-threshold or high-risk transactions without sign-off.

## KYC and support

- **Red-flagged or escalated KYC:** Any submission marked with red flags or “Escalate to compliance” must be reviewed by Compliance Officer or management before approval.
- **Support tickets** categorized as high priority or indicating potential fraud/sanctions concerns should be escalated similarly.
