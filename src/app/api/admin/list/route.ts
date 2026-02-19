import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function checkAdminAuth(req: NextRequest): boolean {
  const pass = req.headers.get("x-admin-pass");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("[admin] ADMIN_PASSWORD env is not set.");
    return false;
  }
  return pass === adminPassword;
}

/**
 * GET /api/admin/list
 * Header: x-admin-pass: <ADMIN_PASSWORD>
 *
 * Returns the latest 200 license records for the admin dashboard.
 */
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Password salah atau tidak diberikan." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/list] db error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dari database." },
      { status: 500 }
    );
  }

  return NextResponse.json({ licenses: data ?? [] });
}
