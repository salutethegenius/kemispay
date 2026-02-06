/**
 * Enable RLS on all public tables.
 * Run: npx tsx scripts/enable-rls.ts
 * Requires DATABASE_URL.
 */
import "dotenv/config";
import pg from "pg";
import { resolveDatabaseUrlToIPv4 } from "../server/db-url.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const connectionString = resolveDatabaseUrlToIPv4(url);
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const sql = readFileSync(join(__dirname, "../migrations/enable_rls.sql"), "utf-8");
    await client.query(sql);
    console.log("RLS enabled on all public tables.");
  } catch (err: any) {
    console.error("Failed to enable RLS:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
