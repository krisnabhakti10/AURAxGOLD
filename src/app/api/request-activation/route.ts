import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  email: z.string().email("Email tidak valid"),
  whatsapp: z.string().max(20).optional(),
  login: z
    .number({ invalid_type_error: "Login harus berupa angka" })
    .int("Login harus bilangan bulat")
    .positive("Login harus positif"),
  server: z.string().min(2, "Server minimal 2 karakter").max(100),
  broker: z.string().max(100).optional(),
  planDays: z.union([z.literal(30), z.literal(90)]).default(30),
});

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
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Input tidak valid." },
        { status: 400 }
      );
    }

    const { email, whatsapp, login, server, broker, planDays } = parsed.data;

    // Check if record already exists
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
      // Allow re-submission only if rejected or revoked
      if (existing.status === "pending" || existing.status === "approved") {
        return NextResponse.json(
          {
            error: `Login MT5 ini sudah terdaftar dengan status "${existing.status}". Cek status di halaman /status.`,
          },
          { status: 409 }
        );
      }

      // Update existing rejected/revoked record to pending
      const { error: updateErr } = await supabaseAdmin
        .from("licenses")
        .update({
          email,
          whatsapp: whatsapp ?? null,
          broker: broker ?? null,
          plan_days: planDays,
          status: "pending",
          expires_at: null,
          approved_at: null,
          note: null,
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
        message:
          "Permintaan aktivasi ulang berhasil dikirim. Admin akan memverifikasi dalam 1×24 jam.",
      });
    }

    // Insert new record
    const { error: insertErr } = await supabaseAdmin.from("licenses").insert({
      email,
      whatsapp: whatsapp ?? null,
      login,
      server,
      broker: broker ?? null,
      plan_days: planDays,
      status: "pending",
    });

    if (insertErr) {
      console.error("[request-activation] insert error:", insertErr);
      // Handle unique constraint (race condition)
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
      message:
        "Permintaan aktivasi berhasil dikirim! Admin akan memverifikasi dalam 1×24 jam.",
    });
  } catch (err) {
    console.error("[request-activation] unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan tidak terduga." },
      { status: 500 }
    );
  }
}
