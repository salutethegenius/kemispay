import { createClient } from "@supabase/supabase-js";
import type { User as SupabaseUser } from "@supabase/supabase-js";

let supabaseAuthClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAuthClient(): ReturnType<typeof createClient> | null {
  if (supabaseAuthClient !== null) return supabaseAuthClient;
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  supabaseAuthClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return supabaseAuthClient;
}

/**
 * Validates a Supabase access token (JWT) and returns the Supabase user if valid.
 */
export async function getSupabaseUserFromToken(accessToken: string): Promise<SupabaseUser | null> {
  try {
    const supabase = getSupabaseAuthClient();
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}
