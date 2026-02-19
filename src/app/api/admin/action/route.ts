import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

const actionSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
  action: z.enum(["approve", "reject", "revoke"]),
});

/**
 * POST /api/admin/action
 * Header: x-admin-pass: <ADMIN_PASSWORD>
 * Body: { id: uuid, action: "approve" | "reject" | "revoke" }
 */
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { error: "Unauthorized. Password salah atau tidak diberikan." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body tidak valid." },
      { status: 400 }
    );
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return NextResponse.json(
      { error: firstError?.message ?? "Input tidak valid." },
      { status: 400 }
    );
  }

  const { id, action } = parsed.data;

  // Fetch current record
  const { data: record, error: fetchErr } = await supabaseAdmin
    .from("licenses")
    .select("id, status, plan_days")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) {
    console.error("[admin/action] fetch error:", fetchErr);
    return NextResponse.json(
      { error: "Gagal mengambil data record." },
      { status: 500 }
    );
  }

  if (!record) {
    return NextResponse.json(
      { error: "Record tidak ditemukan." },
      { status: 404 }
    );
  }

  // Build update payload
  let updatePayload: Record<string, unknown>;
  let successMessage: string;

  switch (action) {
    case "approve": {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + (record.plan_days as number));
      updatePayload = {
        status: "approved",
        approved_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      };
      successMessage = `Lisensi berhasil disetujui. Berlaku hingga ${expiresAt.toLocaleDateString("id-ID")}.`;
      break;
    }
    case "reject": {
      updatePayload = {
        status: "rejected",
        expires_at: null,
        approved_at: null,
      };
      successMessage = "Lisensi berhasil ditolak.";
      break;
    }
    case "revoke": {
      updatePayload = {
        status: "revoked",
      };
      successMessage = "Lisensi berhasil dicabut.";
      break;
    }
    default:
      return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("licenses")
    .update(updatePayload)
    .eq("id", id);

  if (updateErr) {
    console.error("[admin/action] update error:", updateErr);
    return NextResponse.json(
      { error: "Gagal memperbarui data. Silakan coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: successMessage });
}
