/**
 * Test KYC flow: create demo user, upload KYC docs, verify they appear in admin.
 * Run: npx tsx scripts/test-kyc-flow.ts
 * Requires: server running (npm run dev), DATABASE_URL, ADMIN_API_KEY, SUPABASE_* in .env
 */
import "dotenv/config";
import { nanoid } from "nanoid";
import { storage } from "../server/storage";

const BASE = process.env.BASE_URL || "http://localhost:5000";
const ADMIN_KEY = process.env.ADMIN_API_KEY;

// Minimal 1x1 PNG (68 bytes)
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  if (!ADMIN_KEY) {
    console.error("ADMIN_API_KEY not set in .env");
    process.exit(1);
  }

  const demoEmail = `demo-kyc-${Date.now()}@test.kemispay.com`;
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  console.log("1. Creating demo user:", demoEmail);

  const user = await storage.createUser({
    email: demoEmail,
    name: "Demo KYC Test User",
  });
  await storage.createWallet({ userId: user.id, balance: "0", currency: "USDC" });
  await storage.createSession({
    userId: user.id,
    token,
    expiresAt,
  });

  console.log("   User ID:", user.id);
  console.log("2. Uploading KYC documents...");

  const docTypes = ["government_id", "proof_of_address", "selfie"] as const;
  for (const documentType of docTypes) {
    const res = await fetch(`${BASE}/api/kyc/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentType,
        fileName: `${documentType}.png`,
        fileData: TINY_PNG_B64,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`KYC upload ${documentType} failed: ${res.status} ${err}`);
    }
    const doc = await res.json();
    console.log(`   ✓ ${documentType} uploaded, id: ${doc.id}, status: ${doc.status}`);
  }

  console.log("3. Fetching admin KYC pending...");

  const adminRes = await fetch(`${BASE}/api/admin/kyc-pending`, {
    headers: { "X-Admin-API-Key": ADMIN_KEY! },
  });
  if (!adminRes.ok) {
    throw new Error(`Admin fetch failed: ${adminRes.status} ${await adminRes.text()}`);
  }
  const pending = (await adminRes.json()) as any[];

  const myDocs = pending.filter((d: any) => d.userId === user.id);
  console.log(`   Pending total: ${pending.length}, for demo user: ${myDocs.length}`);

  if (myDocs.length >= 3) {
    console.log("\n✅ SUCCESS: KYC documents appear in admin KYC section");
    myDocs.forEach((d: any) =>
      console.log(`   - ${d.documentType}: ${d.fileName} (${d.status})`)
    );
  } else {
    console.log("\n❌ FAIL: Expected 3 pending docs for demo user, got", myDocs.length);
    if (pending.length > 0) {
      console.log("   Other pending docs:", pending.map((d: any) => ({ type: d.documentType, userId: d.userId })));
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
