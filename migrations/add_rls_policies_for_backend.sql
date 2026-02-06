-- Allow backend (Node app) to read/write when connecting via pooler.
-- With RLS enabled and no policies, non-owner roles get 0 rows.
-- These policies ensure our backend can SELECT even if it doesn't bypass RLS.
--
-- Run: Supabase Dashboard > SQL Editor, or: psql $DATABASE_URL -f migrations/add_rls_policies_for_backend.sql

-- Users (admin needs to list all)
DROP POLICY IF EXISTS "Backend read users" ON public.users;
CREATE POLICY "Backend read users" ON public.users FOR SELECT USING (true);

-- KYC documents (admin needs to list pending)
DROP POLICY IF EXISTS "Backend read kyc_documents" ON public.kyc_documents;
CREATE POLICY "Backend read kyc_documents" ON public.kyc_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Backend insert kyc_documents" ON public.kyc_documents;
CREATE POLICY "Backend insert kyc_documents" ON public.kyc_documents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Backend update kyc_documents" ON public.kyc_documents;
CREATE POLICY "Backend update kyc_documents" ON public.kyc_documents FOR UPDATE USING (true);
