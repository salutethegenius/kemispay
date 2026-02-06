-- Index foreign key columns for faster lookups.
-- Aligns with Supabase Performance Advisor (unindexed foreign keys).
--
-- Run via: npm run db:add-indexes
-- Or paste into Supabase Dashboard > SQL Editor

-- payments: getUserPayments filters by user_id, orders by created_at
CREATE INDEX IF NOT EXISTS ix_payments_user_id_created_at
  ON public.payments (user_id, created_at DESC);

-- payment_links: getUserPaymentLinks filters by user_id, orders by created_at
CREATE INDEX IF NOT EXISTS ix_payment_links_user_id_created_at
  ON public.payment_links (user_id, created_at DESC);

-- kyc_documents: getUserKycDocuments filters by user_id, orders by uploaded_at
CREATE INDEX IF NOT EXISTS ix_kyc_documents_user_id_uploaded_at
  ON public.kyc_documents (user_id, uploaded_at DESC);

-- withdrawal_requests: getUserWithdrawalRequests filters by user_id, orders by requested_at
CREATE INDEX IF NOT EXISTS ix_withdrawal_requests_user_id_requested_at
  ON public.withdrawal_requests (user_id, requested_at DESC);

-- ledger_entries: ledger service queries by wallet_id
CREATE INDEX IF NOT EXISTS ix_ledger_entries_wallet_id
  ON public.ledger_entries (wallet_id);
