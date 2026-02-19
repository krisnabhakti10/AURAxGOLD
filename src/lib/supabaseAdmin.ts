import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side only Supabase client using the service role key.
 * NEVER import this in client components or expose to the browser.
 *
 * Lazy-initialized so the module can be imported at build time
 * without requiring env vars to be present.
 */
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  _client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/** @deprecated Gunakan getSupabaseAdmin() agar lazy init */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

export type LicenseStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export interface License {
  id: string;
  email: string;
  login: number;
  server: string;
  broker: string | null;
  status: LicenseStatus;
  plan_days: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  approved_at: string | null;
}
