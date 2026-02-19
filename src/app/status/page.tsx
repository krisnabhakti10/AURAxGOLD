"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────── */
type LicenseResult = {
  ok: boolean;
  status: string;
  expiresAt?: string | null;
  planDays?: number;
  approvedAt?: string | null;
  broker?: string | null;
};

/* ─── Helpers ───────────────────────────────────────────── */
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Jakarta", timeZoneName: "short",
  }).format(new Date(iso));
}

function fmtDateShort(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

function daysLeft(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

const STATUS_CONFIG: Record<string, {
  badge: string;
  label: string;
  icon: React.ReactNode;
  headline: string;
  desc: string;
  iconBg: string;
}> = {
  approved: {
    badge: "badge-approved",
    label: "Aktif",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    headline: "Lisensi Aktif & Valid",
    desc: "EA dapat dijalankan pada akun MT5 Anda.",
    iconBg: "bg-green-400/10 text-green-400 border-green-400/20",
  },
  pending: {
    badge: "badge-pending",
    label: "Menunggu",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    headline: "Menunggu Persetujuan",
    desc: "Permintaan Anda sedang dalam review admin. Harap tunggu konfirmasi dalam 1×24 jam.",
    iconBg: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  },
  rejected: {
    badge: "badge-rejected",
    label: "Ditolak",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    headline: "Permintaan Ditolak",
    desc: "Aktivasi tidak disetujui. Hubungi admin untuk informasi lebih lanjut atau ajukan kembali.",
    iconBg: "bg-red-400/10 text-red-400 border-red-400/20",
  },
  revoked: {
    badge: "badge-revoked",
    label: "Dicabut",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>,
    headline: "Lisensi Dicabut",
    desc: "Lisensi Anda telah dicabut oleh admin. Hubungi support untuk bantuan.",
    iconBg: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",
  },
  expired: {
    badge: "badge-expired",
    label: "Expired",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    headline: "Lisensi Kadaluarsa",
    desc: "Masa berlaku lisensi Anda telah habis. Ajukan aktivasi baru untuk melanjutkan.",
    iconBg: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  },
  not_found: {
    badge: "badge-revoked",
    label: "Tidak Ditemukan",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
    headline: "Data Tidak Ditemukan",
    desc: "Kombinasi MT5 Login dan Server ini belum terdaftar di sistem kami.",
    iconBg: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",
  },
};

/* ─── Sub-components ────────────────────────────────────── */
function BackLink() {
  return (
    <Link href="/"
      className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs font-medium mb-8 transition-colors duration-200 group">
      <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
      Kembali ke Beranda
    </Link>
  );
}

function DetailRow({ label, value, valueClass = "text-zinc-300" }: {
  label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] text-zinc-500 shrink-0">{label}</span>
      <span className={`text-[13px] font-medium text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function StatusPage() {
  const [login, setLogin]   = useState("");
  const [server, setServer] = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<LicenseResult | null>(null);
  const [error, setError]         = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const onCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setHasSearched(true);

    try {
      const qs  = new URLSearchParams({ login: login.trim(), server: server.trim() });
      const res = await fetch(`/api/public-status?${qs}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal mengambil data."); return; }
      setResult(data);
    } catch {
      setError("Gagal menghubungi server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG.not_found) : null;
  const remaining = result?.expiresAt ? daysLeft(result.expiresAt) : null;
  const needsReactivation = result && ["expired","revoked","rejected","not_found"].includes(result.status);

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-5 sm:px-8 py-12">

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 55% 30% at 50% 0%, rgba(217,119,6,0.06) 0%, transparent 65%)" }} />

      <div className="relative w-full max-w-[460px]">
        <BackLink />

        {/* Header */}
        <div className="mb-8">
          <div className="page-badge mb-4">
            <span className="page-badge-dot" />
            Cek Status Lisensi
          </div>
          <h1 className="text-[2rem] font-bold tracking-tight text-white leading-tight mb-2">
            Status{" "}
            <span className="text-gold-gradient">Lisensi Anda</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            Masukkan MT5 Login dan Server untuk memeriksa status lisensi Anda.
          </p>
        </div>

        {/* Search card */}
        <div className="card-glass p-6 mb-5">
          <form onSubmit={onCheck} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="field-label">MT5 Login <span className="text-gold-500">*</span></label>
                <input type="text" value={login} onChange={e => setLogin(e.target.value)}
                  placeholder="12345678" required pattern="[0-9]+" title="Hanya angka"
                  className="input-field" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label">MT5 Server <span className="text-gold-500">*</span></label>
                <input type="text" value={server} onChange={e => setServer(e.target.value)}
                  placeholder="BrokerName-Server" required className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-sm">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Mencari…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Cek Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="alert-error mb-5">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p className="text-[13px]">{error}</p>
          </div>
        )}

        {/* Result card */}
        {result && cfg && !error && (
          <div className="card-glass p-6 animate-[fadeUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">

            {/* Status header */}
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${cfg.iconBg}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-zinc-100 text-[15px]">{cfg.headline}</p>
                  <span className={cfg.badge}>{cfg.label}</span>
                </div>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{cfg.desc}</p>
              </div>
            </div>

            {/* Progress bar for active licenses */}
            {result.status === "approved" && remaining !== null && remaining > 0 && result.planDays && (
              <div className="mb-5 p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-zinc-500 font-medium">Sisa masa aktif</span>
                  <span className="text-[13px] font-bold text-green-400">{remaining} hari lagi</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (remaining / result.planDays) * 100)}%`,
                      background: "linear-gradient(90deg, #4ade80, #22c55e)",
                      boxShadow: "0 0 8px rgba(74,222,128,0.4)",
                    }}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 mt-1.5">
                  Berlaku hingga {fmtDateShort(result.expiresAt)}
                </p>
              </div>
            )}

            {/* Expired countdown */}
            {result.status === "expired" && (
              <div className="mb-5 p-3.5 rounded-xl bg-orange-400/[0.04] border border-orange-400/15">
                <p className="text-[12px] text-orange-400/80">
                  Kadaluarsa sejak <span className="font-semibold text-orange-400">{fmtDateShort(result.expiresAt)}</span>
                </p>
              </div>
            )}

            <div className="divider mb-4" />

            {/* Detail rows */}
            <div className="space-y-0">
              {result.planDays && (
                <DetailRow label="Paket" value={`${result.planDays} Hari`} />
              )}
              {result.broker && (
                <DetailRow label="Broker" value={result.broker} />
              )}
              {result.approvedAt && (
                <DetailRow label="Disetujui" value={fmtDate(result.approvedAt)} />
              )}
              {result.expiresAt && (
                <DetailRow
                  label={result.status === "expired" ? "Kadaluarsa" : "Berlaku Hingga"}
                  value={fmtDate(result.expiresAt)}
                  valueClass={result.status === "expired" ? "text-orange-400" : "text-green-400"}
                />
              )}
            </div>

            {/* Re-activate CTA */}
            {needsReactivation && (
              <div className="mt-5 pt-4 border-t border-white/[0.05]">
                <Link href="/activate" className="btn-outline-gold w-full py-2.5 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Ajukan Aktivasi Baru
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Empty – searched but no result/error shown */}
        {!result && !error && hasSearched && !loading && (
          <div className="text-center py-10 text-zinc-600 text-sm">
            Tidak ada data yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
