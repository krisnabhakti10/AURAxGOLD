import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

/**
 * Server-side only Supabase client using the service role key.
 * NEVER import this in client components or expose to the browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
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
