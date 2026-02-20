"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type LicenseStatus = "pending" | "approved" | "rejected" | "revoked";
type AdminAction   = "approve" | "reject" | "revoke";
type FilterTab     = "all" | "pending" | "approved" | "rejected" | "revoked" | "expired";

interface License {
  id: string;
  email: string;
  whatsapp: string | null;
  login: number;
  server: string;
  broker: string | null;
  status: LicenseStatus;
  plan_days: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  approved_at: string | null;
  client_uid: string | null;
  exness_status: string | null;
}

/* ─── Exness Types ──────────────────────────────────────── */
type MainTab = "licenses" | "exness";

interface ExnessClient {
  client_uid: string;
  reg_date: string;
  client_country: string;
  client_status: string;
  volume_lots: number;
  volume_mln_usd: number;
  reward_usd: string;
  trade_fn: string | null;
  kyc_passed: boolean;
  ftd_received: boolean;
  ftt_made: boolean;
  balance_label: string;
  equity_label: string;
  deposit_label: string;
  last_week_failed_deposit_count: number;
}

interface ExnessStats {
  fetched_at: string;
  partner_link: { full_default_link: string; code: string } | null;
  wallet: { accounts: { id: string; currency: string; balance: number; type: string }[]; total_balance_usd: number };
  summary: {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    kyc_passed: number;
    ftd_received: number;
    trading_active: number;
    volume_lots: number;
    volume_mln_usd: number;
    reward_usd: string;
    server_dt: string | null;
  };
  clients: ExnessClient[];
}

/* ─── Helpers ───────────────────────────────────────────── */
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

/** Client-side expiry check — compares expires_at with current time */
function isExpired(expiresAt: string | null): boolean {
  return !!expiresAt && new Date(expiresAt) < new Date();
}

/** Derives "expired" as a virtual status for display purposes */
function effectiveStatus(lic: License): string {
  return lic.status === "approved" && isExpired(lic.expires_at) ? "expired" : lic.status;
}

/* ─── Sub-components ────────────────────────────────────── */
function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function StatusBadge({ lic }: { lic: License }) {
  const s = effectiveStatus(lic);
  const map: Record<string, { cls: string; label: string }> = {
    pending:  { cls: "badge-pending",  label: "Pending"  },
    approved: { cls: "badge-approved", label: "Aktif"    },
    rejected: { cls: "badge-rejected", label: "Ditolak"  },
    revoked:  { cls: "badge-revoked",  label: "Dicabut"  },
    expired:  { cls: "badge-expired",  label: "Expired"  },
  };
  const { cls, label } = map[s] ?? { cls: "badge-revoked", label: s };
  return <span className={cls}>{label}</span>;
}

function ActionBtn({
  label, variant, loading, onClick, disabled,
}: {
  label: string; variant: "green" | "red" | "gray";
  loading?: boolean; onClick: () => void; disabled?: boolean;
}) {
  const colors = {
    green: "bg-green-400/[0.07] text-green-400 border-green-400/[0.2] hover:bg-green-400/[0.14] hover:border-green-400/[0.35]",
    red:   "bg-red-400/[0.07]   text-red-400   border-red-400/[0.2]   hover:bg-red-400/[0.14]   hover:border-red-400/[0.35]",
    gray:  "bg-zinc-400/[0.06]  text-zinc-400  border-zinc-400/[0.18] hover:bg-zinc-400/[0.12]  hover:border-zinc-400/[0.3]",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${colors[variant]}`}>
      {loading && <Spinner className="w-3 h-3" />}
      {label}
    </button>
  );
}

function Toast({ toast }: { toast: { type: "success" | "error"; msg: string } | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-20 right-5 z-50 max-w-xs px-4 py-3 rounded-xl border text-[13px] font-medium shadow-2xl animate-[fadeUp_0.35s_cubic-bezier(0.16,1,0.3,1)_both] ${
      toast.type === "success"
        ? "bg-[#0d1a10] border-green-400/25 text-green-300"
        : "bg-[#1a0d0d] border-red-400/25 text-red-300"
    }`}>
      <div className="flex items-start gap-2.5">
        {toast.type === "success"
          ? <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          : <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        }
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}

/* ─── Auth gate ─────────────────────────────────────────── */
function AuthGate({ onAuth }: { onAuth: (pass: string, licenses: License[]) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/admin/list", { headers: { "x-admin-pass": password } });
      const data = await res.json();
      if (!res.ok) { setError("Password salah. Silakan coba lagi."); return; }
      onAuth(password, data.licenses ?? []);
    } catch { setError("Gagal menghubungi server."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(217,119,6,0.08) 0%, transparent 65%)" }} />
      <div className="relative w-full max-w-[360px]">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))", border: "1px solid rgba(245,158,11,0.2)" }}>
            <svg className="w-7 h-7 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin <span className="text-gold-gradient">Portal</span></h1>
          <p className="text-zinc-500 text-sm">Masukkan password admin untuk melanjutkan</p>
        </div>
        <div className="card-glass p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label">Password Admin</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••" required autoFocus className="input-field" />
            </div>
            {error && (
              <p className="text-[12px] text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm">
              {loading ? <><Spinner />Memverifikasi…</> : "Masuk ke Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab bar definition ─────────────────────────────────── */
const TABS: { key: FilterTab; label: string; dotColor: string }[] = [
  { key: "all",      label: "Semua",   dotColor: "bg-zinc-400"   },
  { key: "pending",  label: "Pending", dotColor: "bg-yellow-400" },
  { key: "approved", label: "Aktif",   dotColor: "bg-green-400"  },
  { key: "expired",  label: "Expired", dotColor: "bg-orange-400" },
  { key: "rejected", label: "Ditolak", dotColor: "bg-red-400"    },
  { key: "revoked",  label: "Dicabut", dotColor: "bg-zinc-500"   },
];

/* ─── Page ──────────────────────────────────────────────── */
export default function AdminPage() {
  const [password, setPassword]         = useState("");
  const [authed, setAuthed]             = useState(false);
  const [licenses, setLicenses]         = useState<License[]>([]);
  const [fetchError, setFetchError]     = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [tab, setTab]       = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  /* ── Exness Monitor ── */
  const [mainTab, setMainTab]         = useState<MainTab>("licenses");
  const [exStats, setExStats]         = useState<ExnessStats | null>(null);
  const [exLoading, setExLoading]     = useState(false);
  const [exError, setExError]         = useState("");
  const [exSearch, setExSearch]       = useState("");

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLicenses = useCallback(async (pass: string) => {
    setFetchLoading(true); setFetchError("");
    try {
      const res  = await fetch("/api/admin/list", { headers: { "x-admin-pass": pass } });
      const data = await res.json();
      if (!res.ok) { setFetchError(data.error ?? "Gagal memuat data."); return; }
      setLicenses(data.licenses ?? []);
    } catch { setFetchError("Gagal menghubungi server."); }
    finally { setFetchLoading(false); }
  }, []);

  const doAction = async (id: string, action: AdminAction) => {
    setActionLoading(id + action);
    try {
      const res  = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pass": password },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.error ?? "Aksi gagal."); return; }
      showToast("success", data.message ?? "Berhasil!");
      await fetchLicenses(password);
    } catch { showToast("error", "Gagal menghubungi server."); }
    finally { setActionLoading(null); }
  };

  const fetchExnessStats = useCallback(async (pass: string) => {
    setExLoading(true); setExError("");
    try {
      const res  = await fetch("/api/admin/exness-stats", { headers: { "x-admin-password": pass } });
      const data = await res.json();
      if (!res.ok) { setExError(data.error ?? "Gagal memuat data Exness."); return; }
      setExStats(data as ExnessStats);
    } catch { setExError("Gagal menghubungi server."); }
    finally { setExLoading(false); }
  }, []);

  // Auto-load Exness data ketika tab Exness dibuka untuk pertama kali
  useEffect(() => {
    if (mainTab === "exness" && authed && !exStats && !exLoading) {
      fetchExnessStats(password);
    }
  }, [mainTab, authed, exStats, exLoading, password, fetchExnessStats]);

  /* ── Derived counts (client-side expired logic) ── */
  const counts: Record<FilterTab, number> = useMemo(() => ({
    all:      licenses.length,
    pending:  licenses.filter(l => l.status === "pending").length,
    approved: licenses.filter(l => l.status === "approved" && !isExpired(l.expires_at)).length,
    expired:  licenses.filter(l => l.status === "approved" &&  isExpired(l.expires_at)).length,
    rejected: licenses.filter(l => l.status === "rejected").length,
    revoked:  licenses.filter(l => l.status === "revoked").length,
  }), [licenses]);

  /* ── Filter by tab ── */
  const byTab: License[] = useMemo(() => {
    if (tab === "all")     return licenses;
    if (tab === "expired") return licenses.filter(l => l.status === "approved" && isExpired(l.expires_at));
    return licenses.filter(l => l.status === tab);
  }, [licenses, tab]);

  /* ── Filter by search (login or email) ── */
  const finalRows: License[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(l =>
      l.login.toString().includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  }, [byTab, search]);

  const hasSearch  = search.trim().length > 0;
  const hasFilters = tab !== "all" || hasSearch;

  if (!authed) {
    return (
      <AuthGate onAuth={(pass, lics) => { setPassword(pass); setLicenses(lics); setAuthed(true); }} />
    );
  }

  return (
    <div className="min-h-screen px-5 sm:px-8 py-10">
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 80% 25% at 50% 0%, rgba(217,119,6,0.05) 0%, transparent 55%)" }} />

      <Toast toast={toast} />

      <div className="relative max-w-[1280px] mx-auto">

        {/* ══════════════════ PAGE HEADER ══════════════════ */}
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">
                Admin <span className="text-gold-gradient">Dashboard</span>
              </h1>
            </div>
            <p className="text-zinc-600 text-xs ml-[42px]">Kelola permintaan aktivasi lisensi AURAxGOLD</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => mainTab === "licenses" ? fetchLicenses(password) : fetchExnessStats(password)}
              disabled={fetchLoading || exLoading}
              className="btn-ghost text-xs py-1.5 px-3">
              <svg className={`w-3.5 h-3.5 ${(fetchLoading || exLoading) ? "animate-spin" : ""}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
            <button onClick={() => { setAuthed(false); setPassword(""); setLicenses([]); setExStats(null); }}
              className="btn-ghost text-xs py-1.5 px-3 text-red-400/70 hover:text-red-400 hover:border-red-400/20">
              Keluar
            </button>
          </div>
        </div>

        {/* ══════════════════ MAIN TAB SWITCHER ══════════════════ */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 w-fit">
          {([
            { key: "licenses", label: "📋 Manajemen Lisensi" },
            { key: "exness",   label: "📊 Exness Monitor" },
          ] as { key: MainTab; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setMainTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mainTab === key
                  ? "bg-gold-500/15 text-gold-300 border border-gold-500/25"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════ EXNESS MONITOR PANEL ══════════════════ */}
        {mainTab === "exness" && (
          <div className="space-y-6">

            {/* Loading */}
            {exLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Spinner className="w-7 h-7 text-gold-400" />
                <p className="text-zinc-500 text-sm">Mengambil data dari Exness…</p>
              </div>
            )}

            {/* Error */}
            {exError && !exLoading && (
              <div className="alert-error">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-semibold text-red-300 text-sm mb-0.5">Gagal memuat data Exness</p>
                  <p className="text-red-400/70 text-[12px]">{exError}</p>
                </div>
              </div>
            )}

            {exStats && !exLoading && (
              <>
                {/* ─── Timestamp & Partner Link ─── */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-500 text-xs">
                      Data per: {fmtDate(exStats.fetched_at)}
                    </span>
                  </div>
                  {exStats.partner_link && (
                    <a href={exStats.partner_link.full_default_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gold-400/80 hover:text-gold-300 transition-colors border border-gold-500/20 bg-gold-500/5 px-3 py-1.5 rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      Link Afiliasi: {exStats.partner_link.code}
                    </a>
                  )}
                </div>

                {/* ─── Summary Cards ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { label: "Total Klien",   value: exStats.summary.total_clients,  color: "text-zinc-200",    icon: "👥" },
                    { label: "Aktif",         value: exStats.summary.active_clients,  color: "text-emerald-400", icon: "✅" },
                    { label: "Inactive",      value: exStats.summary.inactive_clients,color: "text-red-400",     icon: "🔴" },
                    { label: "KYC Verified",  value: exStats.summary.kyc_passed,      color: "text-blue-400",    icon: "🪪" },
                    { label: "Sudah Deposit", value: exStats.summary.ftd_received,    color: "text-purple-400",  icon: "💰" },
                    { label: "Sudah Trading", value: exStats.summary.trading_active,  color: "text-amber-400",   icon: "📈" },
                    { label: "Volume (Lot)",  value: exStats.summary.volume_lots.toFixed(2), color: "text-gold-400", icon: "📊" },
                    { label: "Reward (USD)",  value: `$${parseFloat(exStats.summary.reward_usd).toFixed(2)}`, color: "text-emerald-300", icon: "🏆" },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="stat-card flex flex-col gap-1">
                      <span className="text-lg">{icon}</span>
                      <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
                      <p className="text-[10px] text-zinc-600 font-medium leading-tight">{label}</p>
                    </div>
                  ))}
                </div>

                {/* ─── Wallet Balance ─── */}
                {exStats.wallet.accounts.length > 0 && (
                  <div className="card-glass p-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">💳 Wallet Partner</p>
                    <div className="flex flex-wrap gap-3">
                      {exStats.wallet.accounts.map((acc) => (
                        <div key={acc.id} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                          <span className="text-xs text-zinc-500">{acc.type}</span>
                          <span className="text-sm font-bold text-white">${acc.balance.toFixed(2)}</span>
                          <span className="text-[10px] text-zinc-600">{acc.currency}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <span className="text-xs text-zinc-500">Total</span>
                        <span className="text-sm font-bold text-emerald-400">${exStats.wallet.total_balance_usd.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Client Table ─── */}
                <div className="card-glass p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <p className="text-sm font-semibold text-white">Daftar Klien Exness</p>
                    <input
                      type="text" placeholder="Cari client_uid…"
                      value={exSearch} onChange={e => setExSearch(e.target.value)}
                      className="input-field text-xs py-1.5 px-3 w-48"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Client UID</th>
                          <th>Daftar</th>
                          <th>Negara</th>
                          <th>Status</th>
                          <th>KYC</th>
                          <th>Deposit</th>
                          <th>Trading</th>
                          <th>Volume (lot)</th>
                          <th>Reward</th>
                          <th>Saldo</th>
                          <th>Last Trade</th>
                          <th>Failed Dep</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exStats.clients
                          .filter(c => !exSearch || c.client_uid.includes(exSearch.toLowerCase()))
                          .map((c) => (
                            <tr key={c.client_uid}>
                              {/* UID */}
                              <td>
                                <span className="font-mono text-[11px] text-zinc-400 truncate block max-w-[120px]"
                                  title={c.client_uid}>
                                  {c.client_uid.slice(0, 8)}…
                                </span>
                              </td>
                              {/* Reg date */}
                              <td><span className="text-[12px] text-zinc-500">{c.reg_date}</span></td>
                              {/* Country */}
                              <td><span className="chip">{c.client_country}</span></td>
                              {/* Status */}
                              <td>
                                {c.client_status === "ACTIVE" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    ACTIVE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    INACTIVE
                                  </span>
                                )}
                              </td>
                              {/* KYC */}
                              <td className="text-center">
                                {c.kyc_passed
                                  ? <span className="text-emerald-400 text-base">✓</span>
                                  : <span className="text-zinc-600 text-base">✗</span>}
                              </td>
                              {/* FTD */}
                              <td className="text-center">
                                {c.ftd_received
                                  ? <span className="text-emerald-400 text-base">✓</span>
                                  : <span className="text-zinc-600 text-base">✗</span>}
                              </td>
                              {/* Trading */}
                              <td className="text-center">
                                {c.ftt_made
                                  ? <span className="text-emerald-400 text-base">✓</span>
                                  : <span className="text-zinc-600 text-base">✗</span>}
                              </td>
                              {/* Volume */}
                              <td>
                                <span className={`text-[12px] font-medium ${c.volume_lots > 0 ? "text-gold-400" : "text-zinc-600"}`}>
                                  {c.volume_lots.toFixed(2)}
                                </span>
                              </td>
                              {/* Reward */}
                              <td>
                                <span className={`text-[12px] font-medium ${parseFloat(c.reward_usd) > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
                                  ${parseFloat(c.reward_usd).toFixed(2)}
                                </span>
                              </td>
                              {/* Balance range */}
                              <td><span className="chip">{c.balance_label}</span></td>
                              {/* Last trade */}
                              <td>
                                <span className="text-[12px] text-zinc-500">{c.trade_fn ?? "—"}</span>
                              </td>
                              {/* Failed deposits */}
                              <td>
                                <span className={`text-[12px] font-medium ${c.last_week_failed_deposit_count > 0 ? "text-orange-400" : "text-zinc-600"}`}>
                                  {c.last_week_failed_deposit_count}
                                </span>
                              </td>
                            </tr>
                          ))
                        }
                        {exStats.clients.length === 0 && (
                          <tr>
                            <td colSpan={12} className="text-center py-8 text-zinc-600 text-sm">
                              Belum ada data klien
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════ LICENSES PANEL ══════════════════ */}
        {mainTab === "licenses" && (
        <div className="space-y-0">

        {/* ══════════════════ STAT CARDS ══════════════════ */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {(
            [
              { key: "all",      label: "Total",   color: "text-zinc-200"  },
              { key: "pending",  label: "Pending", color: "text-yellow-400"},
              { key: "approved", label: "Aktif",   color: "text-green-400" },
              { key: "expired",  label: "Expired", color: "text-orange-400"},
              { key: "rejected", label: "Ditolak", color: "text-red-400"   },
              { key: "revoked",  label: "Dicabut", color: "text-zinc-500"  },
            ] as { key: FilterTab; label: string; color: string }[]
          ).map(({ key, label, color }) => (
            <div key={key}
              className="stat-card flex flex-col gap-0.5">
              <p className={`text-xl font-bold leading-none ${color}`}>{counts[key]}</p>
              <p className="text-[11px] text-zinc-600 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* ══════════════ TOOLBAR: tabs + search ══════════════ */}
        <div className="card mb-4 overflow-hidden">
          {/* Tab row */}
          <div className="flex items-center overflow-x-auto scrollbar-none border-b border-white/[0.05]"
            style={{ scrollbarWidth: "none" }}>
            {TABS.map(({ key, label, dotColor }) => {
              const active = tab === key;
              const count  = counts[key];
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 group ${
                    active
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {/* Active underline */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 to-gold-400 rounded-t-full" />
                  )}
                  {/* Dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-opacity duration-200 ${dotColor} ${active ? "opacity-100" : "opacity-40 group-hover:opacity-60"}`} />
                  {label}
                  {/* Count pill */}
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold transition-all duration-200 ${
                    active
                      ? "bg-gold-500/15 text-gold-400 border border-gold-500/20"
                      : "bg-white/[0.04] text-zinc-600 border border-white/[0.06]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search row */}
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Search box */}
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari login atau email…"
                className="input-field pl-9 py-2 text-[13px]"
              />
              {hasSearch && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all duration-150"
                  aria-label="Hapus pencarian"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Active filter chips */}
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              {tab !== "all" && (
                <button
                  onClick={() => setTab("all")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gold-500/25 bg-gold-500/[0.06] text-[11px] font-medium text-gold-400 hover:border-gold-500/40 hover:bg-gold-500/10 transition-all duration-150">
                  <span>Status: {TABS.find(t => t.key === tab)?.label}</span>
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
              {hasSearch && (
                <button
                  onClick={() => setSearch("")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-600/40 bg-white/[0.03] text-[11px] font-medium text-zinc-400 hover:border-zinc-500/60 hover:text-zinc-200 transition-all duration-150">
                  <span>"{search.trim()}"</span>
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
              {hasFilters && (
                <button
                  onClick={() => { setTab("all"); setSearch(""); }}
                  className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors duration-150 ml-auto">
                  Hapus semua filter
                </button>
              )}
            </div>

            {/* Result count */}
            <p className="text-[12px] text-zinc-600 shrink-0 hidden sm:block">
              <span className="text-zinc-400 font-medium">{finalRows.length}</span>
              {" "}/{" "}
              <span>{licenses.length}</span> data
            </p>
          </div>
        </div>

        {/* ══════════════════ ERROR ══════════════════ */}
        {fetchError && (
          <div className="alert-error mb-4">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-[13px]">{fetchError}</p>
          </div>
        )}

        {/* ══════════════════ TABLE ══════════════════ */}
        {fetchLoading ? (
          <div className="card flex items-center justify-center py-24 gap-3 text-zinc-600">
            <svg className="w-5 h-5 animate-spin text-gold-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-sm">Memuat data…</span>
          </div>

        ) : finalRows.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-800/60 border border-zinc-700/60">
              {hasSearch ? (
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
              )}
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-sm font-medium mb-1">
                {hasSearch
                  ? `Tidak ada hasil untuk "${search.trim()}"`
                  : tab === "all"
                    ? "Belum ada data lisensi"
                    : `Tidak ada data dengan status "${tab}"`}
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setTab("all"); setSearch(""); }}
                  className="text-[12px] text-gold-600 hover:text-gold-400 transition-colors duration-150 underline underline-offset-2">
                  Hapus semua filter
                </button>
              )}
            </div>
          </div>

        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>Login</th>
                    <th>Server</th>
                    <th>Broker</th>
                    <th>Paket</th>
                    <th>Status</th>
                    <th>Exness</th>
                    <th>Berlaku Hingga</th>
                    <th>Dibuat</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {finalRows.map((lic) => {
                    const expired = lic.status === "approved" && isExpired(lic.expires_at);
                    const eff     = effectiveStatus(lic);
                    const q       = search.trim().toLowerCase();

                    /* Highlight matching text */
                    function hl(text: string) {
                      if (!q || !text.toLowerCase().includes(q)) return <>{text}</>;
                      const idx = text.toLowerCase().indexOf(q);
                      return (
                        <>
                          {text.slice(0, idx)}
                          <mark className="bg-gold-500/25 text-gold-200 rounded px-0.5 not-italic">
                            {text.slice(idx, idx + q.length)}
                          </mark>
                          {text.slice(idx + q.length)}
                        </>
                      );
                    }

                    return (
                      <tr key={lic.id}>
                        {/* Email */}
                        <td className="max-w-[180px]">
                          <span className="block truncate text-zinc-300 text-[13px]" title={lic.email}>
                            {hl(lic.email)}
                          </span>
                        </td>
                        {/* WhatsApp */}
                        <td>
                          {lic.whatsapp ? (
                            <a
                              href={`https://wa.me/${lic.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Chat WA: ${lic.whatsapp}`}
                              className="inline-flex items-center gap-1.5 text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              {lic.whatsapp}
                            </a>
                          ) : (
                            <span className="text-zinc-700 text-[12px]">—</span>
                          )}
                        </td>
                        {/* Login */}
                        <td>
                          <span className="font-mono text-gold-400 text-[13px] font-medium">
                            {hl(lic.login.toString())}
                          </span>
                        </td>
                        {/* Server */}
                        <td className="max-w-[140px]">
                          <span className="block truncate text-zinc-400 text-[12px]" title={lic.server}>
                            {lic.server}
                          </span>
                        </td>
                        {/* Broker */}
                        <td>
                          <span className="text-zinc-600 text-[12px]">{lic.broker ?? "—"}</span>
                        </td>
                        {/* Plan */}
                        <td>
                          {lic.plan_days === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                              </svg>
                              Lifetime
                            </span>
                          ) : (
                            <span className="chip">{lic.plan_days}d</span>
                          )}
                        </td>
                        {/* Status */}
                        <td><StatusBadge lic={lic} /></td>
                        {/* Exness Status */}
                        <td>
                          {lic.exness_status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ACTIVE
                            </span>
                          ) : lic.exness_status === "INACTIVE" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              INACTIVE
                            </span>
                          ) : lic.exness_status === "NOT_FOUND" ? (
                            <span className="text-[11px] text-orange-400">Not Found</span>
                          ) : (
                            <span className="text-zinc-700 text-[12px]">—</span>
                          )}
                        </td>
                        {/* Expiry */}
                        <td className="whitespace-nowrap">
                          {lic.expires_at ? (
                            <span className={`text-[12px] ${expired ? "text-orange-400" : eff === "approved" ? "text-green-400" : "text-zinc-600"}`}>
                              {fmtDate(lic.expires_at)}
                            </span>
                          ) : lic.plan_days === 0 && lic.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-purple-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                              </svg>
                              Selamanya
                            </span>
                          ) : (
                            <span className="text-zinc-700 text-[12px]">—</span>
                          )}
                        </td>
                        {/* Created */}
                        <td className="whitespace-nowrap">
                          <span className="text-[12px] text-zinc-600">{fmtDate(lic.created_at)}</span>
                        </td>
                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {(lic.status === "pending" || lic.status === "rejected" || expired) && (
                              <ActionBtn label="Approve" variant="green"
                                loading={actionLoading === lic.id + "approve"}
                                disabled={!!actionLoading}
                                onClick={() => doAction(lic.id, "approve")} />
                            )}
                            {(lic.status === "pending" || lic.status === "approved") && !expired && (
                              <ActionBtn label="Reject" variant="red"
                                loading={actionLoading === lic.id + "reject"}
                                disabled={!!actionLoading}
                                onClick={() => doAction(lic.id, "reject")} />
                            )}
                            {lic.status === "approved" && !expired && (
                              <ActionBtn label="Revoke" variant="gray"
                                loading={actionLoading === lic.id + "revoke"}
                                disabled={!!actionLoading}
                                onClick={() => doAction(lic.id, "revoke")} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between gap-4">
              <p className="text-[11px] text-zinc-700">
                Menampilkan{" "}
                <span className="text-zinc-400 font-medium">{finalRows.length}</span>{" "}
                {hasFilters && (
                  <>dari <span className="text-zinc-500 font-medium">{counts[tab]}</span> hasil filter, </>
                )}
                total{" "}
                <span className="text-zinc-500 font-medium">{licenses.length}</span> data
              </p>
              <p className="text-[11px] text-zinc-700 hidden md:block">
                Cari berdasarkan login atau email
              </p>
            </div>
          </div>
        )}
        </div>
        )}

      </div>
    </div>
  );
}
