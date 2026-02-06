/**
 * Add indexes on foreign key columns for query performance.
 * Run: npx tsx scripts/add-indexes.ts
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
    const sql = readFileSync(join(__dirname, "../migrations/add_foreign_key_indexes.sql"), "utf-8");
    await client.query(sql);
    console.log("Indexes created successfully.");
  } catch (err: any) {
    console.error("Failed to add indexes:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
