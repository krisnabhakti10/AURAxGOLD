import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function checkAdminAuth(req: NextRequest): boolean {
  const pass = req.headers.get("x-admin-pass");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[admin] ADMIN_PASSWORD env is not set.");
    return false;
  }
  return pass === adminPassword;
}

const updateSchema = z.object({
  login_id:          z.string().min(1, "Login ID wajib diisi"),
  server:            z.string().min(1, "Server wajib diisi"),
  investor_password: z.string().min(1, "Investor password wajib diisi"),
  description:       z.string().nullable().optional(),
});

/**
 * GET /api/admin/live-account
 * Header: x-admin-pass: <ADMIN_PASSWORD>
 * Mengambil data lengkap akun live trading.
 */
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("live_account")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error("[admin/live-account] GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/live-account
 * Header: x-admin-pass: <ADMIN_PASSWORD>
 * Body: { login_id, server, investor_password, description? }
 * Update data akun live trading.
 */
export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("live_account")
      .upsert({
        id: 1,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[admin/live-account] PUT error:", err);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
