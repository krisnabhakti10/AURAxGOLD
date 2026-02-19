import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loginStr = searchParams.get("login");
  const server   = searchParams.get("server");

  if (!loginStr || !server) {
    return NextResponse.json(
      { error: "Parameter login dan server wajib diisi." },
      { status: 400 }
    );
  }

  const login = parseInt(loginStr, 10);
  if (isNaN(login) || login <= 0) {
    return NextResponse.json(
      { error: "Parameter login harus berupa angka positif." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("licenses")
    .select(
      "id, status, plan_days, expires_at, approved_at, broker, created_at"
    )
    .eq("login", login)
    .eq("server", server.trim())
    .maybeSingle();

  if (error) {
    console.error("[public-status] error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data. Silakan coba lagi." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({
      ok: false,
      status: "not_found",
    });
  }

  // Check expiry for approved licenses
  let effectiveStatus = data.status;
  if (
    data.status === "approved" &&
    data.expires_at &&
    new Date(data.expires_at) < new Date()
  ) {
    effectiveStatus = "expired";
  }

  return NextResponse.json({
    ok: effectiveStatus === "approved",
    status: effectiveStatus,
    planDays:   data.plan_days,
    expiresAt:  data.expires_at,
    approvedAt: data.approved_at,
    broker:     data.broker,
  });
}
