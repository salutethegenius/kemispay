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
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase-auth.ts:getSupabaseUserFromToken',message:'Client check',data:{hasClient:!!supabase,tokenLen:accessToken?.length||0},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase-auth.ts:getUser',message:'Supabase getUser result',data:{hasUser:!!user,hasError:!!error,errorMsg:error?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (error || !user) return null;
    return user;
  } catch (e: any) {
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/6b597c48-09d7-4176-b1b0-b57a5a5a9f64',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase-auth.ts:catch',message:'getSupabaseUserFromToken error',data:{message:e?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    return null;
  }
}
