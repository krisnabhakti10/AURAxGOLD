import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getExnessToken, checkExnessAffiliation } from "@/lib/exnessApi";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function calcExpiresAt(planDays: number): Date | null {
  if (planDays === 0) return null; // Lifetime
  const d = new Date();
  d.setDate(d.getDate() + planDays);
  return d;
}

// ─────────────────────────────────────────────────────────────
// Request Schema
// ─────────────────────────────────────────────────────────────

const requestSchema = z.object({
  email:    z.string().email("Email tidak valid"),
  whatsapp: z.string().max(20).optional(),
  login: z
    .number({ invalid_type_error: "Login harus berupa angka" })
    .int("Login harus bilangan bulat")
    .positive("Login harus positif"),
  server:   z.string().min(2, "Server minimal 2 karakter").max(100),
  broker:   z.string().max(100).optional(),
  planDays: z.union([z.literal(0), z.literal(30), z.literal(90)]).default(30),
  skipAffiliationCheck: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────
// POST Handler
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body tidak valid (bukan JSON)." },
        { status: 400 }
      );
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Input tidak valid." },
        { status: 400 }
      );
    }

    const { email, whatsapp, login, server, broker, planDays, skipAffiliationCheck } =
      parsed.data;

    // ── Verifikasi & Auto-Approve via Exness API ───────────────
    let autoApprove  = false;
    let clientUid: string | null = null;

    if (!skipAffiliationCheck) {
      try {
        const result = await checkExnessAffiliation(email);

        if (!result.affiliated) {
          return NextResponse.json(
            {
              error:
                "Email ini belum terdaftar sebagai klien kami di Exness. " +
                "Silakan buat akun Exness terlebih dahulu melalui link resmi kami, " +
                "lalu gunakan email yang sama untuk aktivasi.",
              code: "NOT_AFFILIATED",
            },
            { status: 422 }
          );
        }

        // Email terverifikasi → set auto-approve
        autoApprove = true;
        clientUid   = result.clientUid;
      } catch (affiliErr) {
        // Jika Exness API down → fallback ke manual approve
        console.warn("[request-activation] Exness check error (fallback to manual):", affiliErr);
      }
    }

    const now        = new Date();
    const expiresAt  = autoApprove ? calcExpiresAt(planDays) : null;
    const status     = autoApprove ? "approved" : "pending";
    const approvedAt = autoApprove ? now.toISOString() : null;

    // ── Cek record existing ────────────────────────────────────
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from("licenses")
      .select("id, status")
      .eq("login", login)
      .eq("server", server)
      .maybeSingle();

    if (selectErr) {
      console.error("[request-activation] select error:", selectErr);
      return NextResponse.json(
        { error: "Gagal memeriksa data. Silakan coba lagi." },
        { status: 500 }
      );
    }

    if (existing) {
      if (existing.status === "pending" || existing.status === "approved") {
        return NextResponse.json(
          {
            error: `Login MT5 ini sudah terdaftar dengan status "${existing.status}". Cek status di halaman /status.`,
          },
          { status: 409 }
        );
      }

      // Update record yang sudah ada (rejected / revoked)
      const { error: updateErr } = await supabaseAdmin
        .from("licenses")
        .update({
          email,
          whatsapp:       whatsapp ?? null,
          broker:         broker ?? null,
          plan_days:      planDays,
          status,
          expires_at:     expiresAt ? expiresAt.toISOString() : null,
          approved_at:    approvedAt,
          note:           null,
          client_uid:     clientUid,
          exness_status:  autoApprove ? "ACTIVE" : null,
        })
        .eq("id", existing.id);

      if (updateErr) {
        console.error("[request-activation] update error:", updateErr);
        return NextResponse.json(
          { error: "Gagal memperbarui data. Silakan coba lagi." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        autoApproved: autoApprove,
        message: autoApprove
          ? `Aktivasi berhasil! Lisensi EA kamu sudah aktif${
              planDays === 0
                ? " selamanya (Lifetime)."
                : ` hingga ${expiresAt!.toLocaleDateString("id-ID")}.`
            }`
          : "Permintaan aktivasi ulang berhasil dikirim. Admin akan memverifikasi dalam 1×24 jam.",
      });
    }

    // ── Insert record baru ────────────────────────────────────
    const { error: insertErr } = await supabaseAdmin.from("licenses").insert({
      email,
      whatsapp:       whatsapp ?? null,
      login,
      server,
      broker:         broker ?? null,
      plan_days:      planDays,
      status,
      expires_at:     expiresAt ? expiresAt.toISOString() : null,
      approved_at:    approvedAt,
      client_uid:     clientUid,
      exness_status:  autoApprove ? "ACTIVE" : null,
    });

    if (insertErr) {
      console.error("[request-activation] insert error:", insertErr);
      if (insertErr.code === "23505") {
        return NextResponse.json(
          { error: "Login MT5 ini sudah terdaftar. Silakan cek status Anda." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Gagal menyimpan data. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      autoApproved: autoApprove,
      message: autoApprove
        ? `Aktivasi berhasil! Lisensi EA kamu sudah aktif${
            planDays === 0
              ? " selamanya (Lifetime)."
              : ` hingga ${expiresAt!.toLocaleDateString("id-ID")}.`
          }`
        : "Permintaan aktivasi berhasil dikirim! Admin akan memverifikasi dalam 1×24 jam.",
    });
  } catch (err) {
    console.error("[request-activation] unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan tidak terduga." },
      { status: 500 }
    );
  }
}
