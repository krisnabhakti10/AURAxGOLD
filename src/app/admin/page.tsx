"use client";

import { useState, useCallback, useMemo } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type LicenseStatus = "pending" | "approved" | "rejected" | "revoked";
type AdminAction   = "approve" | "reject" | "revoke";
type FilterTab     = "all" | "pending" | "approved" | "rejected" | "revoked" | "expired";

interface License {
  id: string;
  email: string;
  login: number;
  server: string;
  broker: string | null;
  status: LicenseStatus;
  plan_days: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  approved_at: string | null;
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
            <button onClick={() => fetchLicenses(password)} disabled={fetchLoading}
              className="btn-ghost text-xs py-1.5 px-3">
              <svg className={`w-3.5 h-3.5 ${fetchLoading ? "animate-spin" : ""}`}
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
            <button onClick={() => { setAuthed(false); setPassword(""); setLicenses([]); }}
              className="btn-ghost text-xs py-1.5 px-3 text-red-400/70 hover:text-red-400 hover:border-red-400/20">
              Keluar
            </button>
          </div>
        </div>

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
                    <th>Login</th>
                    <th>Server</th>
                    <th>Broker</th>
                    <th>Paket</th>
                    <th>Status</th>
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
                          <span className="chip">{lic.plan_days}d</span>
                        </td>
                        {/* Status */}
                        <td><StatusBadge lic={lic} /></td>
                        {/* Expiry */}
                        <td className="whitespace-nowrap">
                          {lic.expires_at ? (
                            <span className={`text-[12px] ${expired ? "text-orange-400" : eff === "approved" ? "text-green-400" : "text-zinc-600"}`}>
                              {fmtDate(lic.expires_at)}
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
    </div>
  );
}
