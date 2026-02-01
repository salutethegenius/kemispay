import dns from "node:dns";

const IPv4_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/** lookupSync exists in Node 22+; on Node 20 we skip IPv4 resolution */
const dnsAny = dns as unknown as { lookupSync?: (host: string, opts: { family: number }) => { address: string } };
const lookupSync = typeof dnsAny.lookupSync === "function" ? dnsAny.lookupSync : null;

/**
 * Resolve the host in a Postgres URL to IPv4. Use when the hostname resolves to
 * IPv6 and your network can't reach it (EHOSTUNREACH). On Node 20 we return the
 * URL unchanged (use Supabase "Session pooler" if you hit EHOSTUNREACH).
 */
export function resolveDatabaseUrlToIPv4(connectionString: string): string {
  if (!connectionString) return connectionString;
  if (!lookupSync) return connectionString;
  try {
    const url = new URL(connectionString.replace(/^postgresql:\/\//, "https://"));
    const hostname = url.hostname;
    if (IPv4_REGEX.test(hostname)) return connectionString;
    const ipv4 = lookupSync(hostname, { family: 4 });
    const newHost = ipv4.address;
    const port = url.port || "5432";
    const toReplace = url.port ? `${hostname}:${url.port}` : hostname;
    const replacement = `${newHost}:${port}`;
    return connectionString.replace(toReplace, replacement);
  } catch {
    return connectionString;
  }
}
