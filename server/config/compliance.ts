/**
 * Compliance thresholds for enhanced review.
 * Keep in sync with docs/COMPLIANCE_THRESHOLDS.md.
 */

const ENHANCED_REVIEW_WITHDRAWAL_AMOUNT = process.env.ENHANCED_REVIEW_WITHDRAWAL_AMOUNT
  ? parseFloat(process.env.ENHANCED_REVIEW_WITHDRAWAL_AMOUNT)
  : 10_000;

const ENHANCED_REVIEW_MONTHLY_VOLUME = process.env.ENHANCED_REVIEW_MONTHLY_VOLUME
  ? parseFloat(process.env.ENHANCED_REVIEW_MONTHLY_VOLUME)
  : undefined;

export const complianceConfig = {
  /** Single withdrawal amount (USD) above which enhanced review is required. */
  enhancedReviewWithdrawalAmount: ENHANCED_REVIEW_WITHDRAWAL_AMOUNT,
  /** Optional: monthly volume per merchant (USD) above which enhanced review is required. */
  enhancedReviewMonthlyVolume: ENHANCED_REVIEW_MONTHLY_VOLUME,
};

export function isAboveWithdrawalThreshold(amount: number | string): boolean {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return false;
  return num >= complianceConfig.enhancedReviewWithdrawalAmount;
}
