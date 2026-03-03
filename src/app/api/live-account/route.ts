import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/live-account
 * Public route — mengambil data akun live trading untuk ditampilkan di landing page.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("live_account")
      .select("login_id, server, investor_password, description")
      .eq("id", 1)
      .single();

    if (error) throw error;

    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error("[live-account] GET error:", err);
    // Fallback ke nilai default jika table belum dibuat
    return NextResponse.json({
      login_id: "257261514",
      server: "Exness-MT5Real36",
      investor_password: "AURAxGOLD1@",
      description: null,
    });
  }
}
