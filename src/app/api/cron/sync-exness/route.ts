/**
 * GET /api/cron/sync-exness
 *
 * Dipanggil secara otomatis oleh Vercel Cron setiap hari (lihat vercel.json).
 * Juga bisa dipanggil manual dari admin dengan header Authorization yang benar.
 *
 * Tugas:
 * 1. Ambil semua lisensi "approved" yang punya client_uid dari DB
 * 2. Cek status tiap client ke Exness Partnership API
 * 3. Jika client_status == "INACTIVE" → revoke lisensi + update exness_status
 * 4. Jika client_status == "ACTIVE"   → update exness_status saja (tetap approved)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getExnessToken } from "@/lib/exnessApi";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 detik max (Vercel Pro limit)

const EXNESS_CLIENTS_URL = "https://my.xsspartners.com/api/v2/reports/clients/";

interface ExnessClient {
  client_uid: string;
  client_status: "ACTIVE" | "INACTIVE" | string;
}

interface ExnessClientsResponse {
  data: ExnessClient[];
  totals: { count: number };
}

/** Ambil status semua client sekaligus (batch by client_uid list) */
async function fetchClientStatuses(
  clientUids: string[]
): Promise<Map<string, string>> {
  const statusMap = new Map<string, string>();
  if (clientUids.length === 0) return statusMap;

  const token = await getExnessToken();

  // Exness API mendukung array filter: ?client_uid=uid1&client_uid=uid2
  const params = new URLSearchParams();
  clientUids.forEach((uid) => params.append("client_uid", uid));
  params.set("limit", "200");

  const res = await fetch(`${EXNESS_CLIENTS_URL}?${params.toString()}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Exness clients API gagal: ${res.status}`);

  const body = (await res.json()) as ExnessClientsResponse;
  body.data.forEach((c) => statusMap.set(c.client_uid, c.client_status));
  return statusMap;
}

// ─────────────────────────────────────────────────────────────
// GET Handler
// ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // ── Validasi akses ─────────────────────────────────────────
  // Vercel Cron menyertakan header Authorization: Bearer <CRON_SECRET>
  // Manual call juga harus menyertakan secret yang sama
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET ?? process.env.ADMIN_PASSWORD;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    checked: 0,
    revoked: 0,
    updated: 0,
    errors: 0,
    details: [] as { login: number; server: string; action: string }[],
  };

  try {
    // ── 1. Ambil lisensi approved yang punya client_uid ────────
    const { data: licenses, error: dbErr } = await supabaseAdmin
      .from("licenses")
      .select("id, login, server, plan_days, client_uid, exness_status")
      .eq("status", "approved")
      .not("client_uid", "is", null);

    if (dbErr) throw new Error(`DB query error: ${dbErr.message}`);
    if (!licenses || licenses.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada lisensi approved dengan client_uid.",
        results,
        duration_ms: Date.now() - startTime,
      });
    }

    results.checked = licenses.length;

    // ── 2. Fetch status dari Exness (batch) ────────────────────
    const uids = licenses.map((l) => l.client_uid as string);
    const statusMap = await fetchClientStatuses(uids);

    // ── 3. Proses tiap lisensi ─────────────────────────────────
    for (const lic of licenses) {
      const uid        = lic.client_uid as string;
      const newStatus  = statusMap.get(uid) ?? null;

      if (!newStatus) {
        // Client tidak ditemukan di Exness (mungkin dihapus) → revoke
        const { error } = await supabaseAdmin
          .from("licenses")
          .update({
            status: "revoked",
            exness_status: "NOT_FOUND",
            note: `Auto-revoked: client_uid tidak ditemukan di Exness (sync ${new Date().toISOString()})`,
          })
          .eq("id", lic.id);

        if (error) {
          results.errors++;
          console.error(`[sync-exness] revoke error for ${uid}:`, error);
        } else {
          results.revoked++;
          results.details.push({ login: lic.login, server: lic.server, action: "revoked (not_found)" });
        }
        continue;
      }

      if (newStatus === "INACTIVE") {
        // Client inactive → revoke lisensi
        const { error } = await supabaseAdmin
          .from("licenses")
          .update({
            status: "revoked",
            exness_status: "INACTIVE",
            note: `Auto-revoked: status Exness INACTIVE (sync ${new Date().toISOString()})`,
          })
          .eq("id", lic.id);

        if (error) {
          results.errors++;
          console.error(`[sync-exness] revoke error for ${uid}:`, error);
        } else {
          results.revoked++;
          results.details.push({ login: lic.login, server: lic.server, action: "revoked (inactive)" });
        }
      } else if (newStatus !== lic.exness_status) {
        // Status berubah tapi masih ACTIVE → update saja
        const { error } = await supabaseAdmin
          .from("licenses")
          .update({ exness_status: newStatus })
          .eq("id", lic.id);

        if (error) {
          results.errors++;
        } else {
          results.updated++;
          results.details.push({ login: lic.login, server: lic.server, action: `updated → ${newStatus}` });
        }
      }
    }

    console.log(`[sync-exness] Done: ${results.revoked} revoked, ${results.updated} updated, ${results.errors} errors`);

    return NextResponse.json({
      success: true,
      results,
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.error("[sync-exness] fatal error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        results,
        duration_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
