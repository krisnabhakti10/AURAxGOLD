/**
 * GET /api/admin/exness-stats
 * Mengambil data monitoring dari Exness Partnership API untuk halaman admin.
 * Dilindungi dengan ADMIN_PASSWORD.
 */

import { NextRequest, NextResponse } from "next/server";
import { getExnessToken } from "@/lib/exnessApi";

export const dynamic = "force-dynamic";

const BASE = "https://my.xsspartners.com";

interface WalletAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  type: string;
}

interface ExnessClient {
  partner_account: string;
  client_uid: string;
  reg_date: string;
  client_country: string;
  volume_lots: number;
  volume_mln_usd: number;
  reward_usd: string;
  trade_fn: string | null;
  client_contact_sharing_status: string;
  client_status: string;
  rebate_amount_usd: number;
  kyc_passed: boolean;
  ftd_received: boolean;
  ftt_made: boolean;
  client_balance: number;
  client_equity: number;
  deposit_amount: number;
  last_week_failed_deposit_count: number;
}

interface ClientsResponse {
  data: ExnessClient[];
  totals: {
    count: number;
    volume_lots: number;
    volume_mln_usd: number;
    reward_usd: string;
    server_dt: string;
    available_for_request: number;
  };
}

interface PartnerLink {
  full_default_link: string;
  domain: string;
  code: string;
}

export async function GET(req: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────
  const pw = req.headers.get("x-admin-password");
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getExnessToken();
    const headers = { Authorization: `Bearer ${token}` };

    // ── Fetch parallel ─────────────────────────────────────────
    const [clientsRes, walletRes, linkRes] = await Promise.allSettled([
      fetch(`${BASE}/api/v2/reports/clients/?limit=200`, { headers }),
      fetch(`${BASE}/api/wallet/accounts/`, { headers }),
      fetch(`${BASE}/api/partner/default_link/`, { headers }),
    ]);

    // Parse clients
    let clients: ClientsResponse | null = null;
    if (clientsRes.status === "fulfilled" && clientsRes.value.ok) {
      clients = (await clientsRes.value.json()) as ClientsResponse;
    }

    // Parse wallet
    let wallet: { accounts: WalletAccount[] } | null = null;
    if (walletRes.status === "fulfilled" && walletRes.value.ok) {
      wallet = (await walletRes.value.json()) as { accounts: WalletAccount[] };
    }

    // Parse partner link
    let partnerLink: PartnerLink | null = null;
    if (linkRes.status === "fulfilled" && linkRes.value.ok) {
      partnerLink = (await linkRes.value.json()) as PartnerLink;
    }

    // ── Hitung balance ranges ─────────────────────────────────
    const BALANCE_RANGES: Record<number, string> = {
      1: "$0–10",
      2: "$10–50",
      3: "$50–250",
      4: "$250–1K",
      5: "$1K–5K",
      6: ">$5K",
    };

    const mappedClients = (clients?.data ?? []).map((c) => ({
      ...c,
      balance_label:  BALANCE_RANGES[c.client_balance]  ?? "—",
      equity_label:   BALANCE_RANGES[c.client_equity]   ?? "—",
      deposit_label:  BALANCE_RANGES[c.deposit_amount]  ?? "—",
    }));

    // ── Agregasi stats ────────────────────────────────────────
    const activeCount   = mappedClients.filter((c) => c.client_status === "ACTIVE").length;
    const inactiveCount = mappedClients.filter((c) => c.client_status === "INACTIVE").length;
    const kycCount      = mappedClients.filter((c) => c.kyc_passed).length;
    const ftdCount      = mappedClients.filter((c) => c.ftd_received).length;
    const tradingCount  = mappedClients.filter((c) => c.ftt_made).length;
    const totalBalance  = (wallet?.accounts ?? []).reduce((s, a) => s + (a.balance ?? 0), 0);

    return NextResponse.json({
      fetched_at: new Date().toISOString(),
      partner_link: partnerLink,
      wallet: {
        accounts: wallet?.accounts ?? [],
        total_balance_usd: totalBalance,
      },
      summary: {
        total_clients:    clients?.totals.count ?? 0,
        active_clients:   activeCount,
        inactive_clients: inactiveCount,
        kyc_passed:       kycCount,
        ftd_received:     ftdCount,
        trading_active:   tradingCount,
        volume_lots:      clients?.totals.volume_lots ?? 0,
        volume_mln_usd:   clients?.totals.volume_mln_usd ?? 0,
        reward_usd:       clients?.totals.reward_usd ?? "0",
        server_dt:        clients?.totals.server_dt ?? null,
      },
      clients: mappedClients,
    });
  } catch (err) {
    console.error("[exness-stats]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mengambil data Exness." },
      { status: 500 }
    );
  }
}
