import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/verify?login=...&server=...
 * Header: x-ea-key: <EA_VERIFY_API_KEY>
 *
 * Called by the MT5 EA on every start/tick to verify the license.
 */
export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────
  const eaKey = req.headers.get("x-ea-key");
  const validKey = process.env.EA_VERIFY_API_KEY;

  if (!validKey) {
    console.error("[verify] EA_VERIFY_API_KEY env is not set.");
    return NextResponse.json(
      { ok: false, status: "server_error" },
      { status: 500 }
    );
  }

  if (!eaKey || eaKey !== validKey) {
    return NextResponse.json(
      { ok: false, status: "unauthorized" },
      { status: 401 }
    );
  }

  // ── Params ────────────────────────────────────────────────
  const { searchParams } = new URL(req.url);
  const loginStr = searchParams.get("login");
  const server   = searchParams.get("server");

  if (!loginStr || !server) {
    return NextResponse.json(
      { ok: false, status: "bad_request", error: "login and server are required" },
      { status: 400 }
    );
  }

  const login = parseInt(loginStr, 10);
  if (isNaN(login) || login <= 0) {
    return NextResponse.json(
      { ok: false, status: "bad_request", error: "login must be a positive integer" },
      { status: 400 }
    );
  }

  // ── Lookup ────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from("licenses")
    .select("status, expires_at")
    .eq("login", login)
    .eq("server", server.trim())
    .maybeSingle();

  if (error) {
    console.error("[verify] db error:", error);
    return NextResponse.json(
      { ok: false, status: "server_error" },
      { status: 500 }
    );
  }

  // Not found
  if (!data) {
    return NextResponse.json({ ok: false, status: "not_found" });
  }

  // Not approved
  if (data.status !== "approved") {
    return NextResponse.json({
      ok: false,
      status: data.status, // pending | rejected | revoked
    });
  }

  // Approved but expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({
      ok: false,
      status: "expired",
      expiresAt: data.expires_at,
    });
  }

  // Valid license
  return NextResponse.json({
    ok: true,
    status: "approved",
    expiresAt: data.expires_at,
  });
}
