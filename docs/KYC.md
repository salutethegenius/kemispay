# KemisPay KYC

## Current Flow (Manual)

KemisPay uses an in-house manual KYC flow for vendor verification:

- Vendors upload documents: government ID, proof of address, selfie
- Documents are stored in Supabase storage
- Admins review and approve/reject via the admin dashboard
- Verification status gates access to payment features

## Planned: Edifice Integration

**Future partner:** [Edifice Global Markets](https://edificegm.com/)  
Edifice provides KYC, EDD (Enhanced Due Diligence), and counterparty risk assessment for onboarding and ongoing monitoring.

When integrating Edifice:

- Replace or augment the manual document upload with Edifice’s API/portal
- Store verification status and reference IDs for audit
- Continue to gate payment and withdrawal features on approved status
