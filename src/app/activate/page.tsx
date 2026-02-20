"use client";

import { useState } from "react";
import Link from "next/link";

type FormState = {
  email: string;
  whatsapp: string;
  login: string;
  server: string;
  broker: string;
  planDays: "0" | "30" | "90";
};

type SubmitState = "idle" | "loading" | "success" | "error" | "not_affiliated";

/* ─── Small helpers ────────────────────────────────────── */
function BackLink() {
  return (
    <Link href="/"
      className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-xs font-medium mb-8 transition-colors duration-200 group">
      <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200"
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Kembali ke Beranda
    </Link>
  );
}

function FieldWrapper({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="field-label">
        {label}
        {required && <span className="text-gold-500 ml-0.5">*</span>}
        {!required && <span className="text-zinc-600 font-normal ml-1.5 text-[11px]">(opsional)</span>}
      </label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function ActivatePage() {
  const [form, setForm] = useState<FormState>({
    email: "", whatsapp: "", login: "", server: "", broker: "", planDays: "30",
  });

  const PLANS: { value: "0" | "30" | "90"; label: string; sub: string; badge?: string }[] = [
    { value: "30",  label: "30",       sub: "hari"     },
    { value: "90",  label: "90",       sub: "hari",    badge: "Hemat"    },
    { value: "0",   label: "∞",        sub: "Lifetime", badge: "Permanen" },
  ];
  const [state, setState]       = useState<SubmitState>("idle");
  const [message, setMessage]   = useState("");
  const [autoApproved, setAutoApproved] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const res  = await fetch("/api/request-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:     form.email.trim(),
          whatsapp:  form.whatsapp.trim() || undefined,
          login:     Number(form.login),
          server:    form.server.trim(),
          broker:    form.broker.trim() || undefined,
          planDays:  Number(form.planDays),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Kasus khusus: email belum terdaftar via link Exness kita
        if (data.code === "NOT_AFFILIATED") {
          setState("not_affiliated");
        } else {
          setState("error");
        }
        setMessage(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }
      setState("success");
      setMessage(data.message ?? "Permintaan aktivasi berhasil dikirim! Admin akan memverifikasi dalam 1×24 jam.");
      setForm({ email: "", whatsapp: "", login: "", server: "", broker: "", planDays: "30" });
      // Tandai apakah ini auto-approve
      setAutoApproved(data.autoApproved === true);
    } catch {
      setState("error");
      setMessage("Gagal menghubungi server. Periksa koneksi Anda.");
    }
  };

  const isLoading = state === "loading";

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-5 sm:px-8 py-12">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 35% at 50% 0%, rgba(217,119,6,0.07) 0%, transparent 65%)" }} />

      <div className="relative w-full max-w-[480px]">
        <BackLink />

        {/* Page header */}
        <div className="mb-8">
          <div className="page-badge mb-4">
            <span className="page-badge-dot" />
            Permintaan Aktivasi
          </div>
          <h1 className="text-[2rem] font-bold tracking-tight text-white leading-tight mb-2">
            Ajukan{" "}
            <span className="text-gold-gradient">Aktivasi Lisensi</span>
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Isi data MT5 Anda di bawah. Pastikan sudah membuat akun Exness melalui link resmi kami sebelum mengajukan.
          </p>
        </div>

        {/* Main card */}
        <div className="card-glass p-6 sm:p-8">

          {/* Success — Auto Approved */}
          {state === "success" && autoApproved && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300 mb-0.5">✅ Lisensi Aktif Sekarang!</p>
                  <p className="text-emerald-400/80 text-[12px] leading-relaxed mb-2">{message}</p>
                  <p className="text-zinc-500 text-[11px] mb-2">EA kamu sudah bisa digunakan. Salin lisensi key dari halaman status.</p>
                  <Link href="/status" className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 text-[12px] font-semibold transition-colors">
                    Lihat Lisensi Saya →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Success — Manual Pending */}
          {state === "success" && !autoApproved && (
            <div className="alert-success mb-6">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="font-semibold text-green-300 mb-0.5">Permintaan Terkirim!</p>
                <p className="text-green-400/80 text-[12px] leading-relaxed">{message}</p>
                <Link href="/status" className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300 text-[12px] mt-2 font-medium transition-colors">
                  Cek status lisensi
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Error — Not Affiliated (belum daftar via link Exness) */}
          {state === "not_affiliated" && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-300 mb-1 text-sm">Akun Exness Belum Terdeteksi</p>
                  <p className="text-amber-400/80 text-[12px] leading-relaxed mb-3">{message}</p>
                  <a
                    href="https://one.exnessonelink.com/a/dk95kv8jji"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                    Buat Akun Exness Sekarang
                  </a>
                  <p className="text-zinc-600 text-[11px] mt-2">
                    Setelah daftar, kembali ke sini dan ajukan aktivasi dengan email yang sama.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error — General */}
          {state === "error" && (
            <div className="alert-error mb-6">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="font-semibold text-red-300 mb-0.5">Gagal Mengirim</p>
                <p className="text-red-400/80 text-[12px] leading-relaxed">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Email */}
            <FieldWrapper label="Email" required hint="Gunakan email aktif untuk notifikasi">
              <input type="email" name="email" value={form.email} onChange={onChange}
                placeholder="contoh@email.com" required className="input-field" />
            </FieldWrapper>

            {/* WhatsApp */}
            <FieldWrapper label="Nomor WhatsApp" hint="Format: 628xxxxxxxxxx — untuk notifikasi aktivasi">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-emerald-500/70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </span>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={onChange}
                  placeholder="6282xxxxxxxxx" className="input-field pl-9" />
              </div>
            </FieldWrapper>

            {/* Login & Server - 2 col on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldWrapper label="MT5 Login" required hint="Hanya angka">
                <input type="text" name="login" value={form.login} onChange={onChange}
                  placeholder="12345678" required pattern="[0-9]+" title="Hanya angka"
                  className="input-field" />
              </FieldWrapper>
              <FieldWrapper label="MT5 Server" required hint="Nama server broker">
                <input type="text" name="server" value={form.server} onChange={onChange}
                  placeholder="BrokerName-Server" required className="input-field" />
              </FieldWrapper>
            </div>

            {/* Broker */}
            <FieldWrapper label="Nama Broker" required={false}>
              <input type="text" name="broker" value={form.broker} onChange={onChange}
                placeholder="XM, ICMarkets, Exness…" className="input-field" />
            </FieldWrapper>

            {/* Plan selector */}
            <div className="space-y-2">
              <label className="field-label">
                Paket Berlangganan <span className="text-gold-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PLANS.map((plan) => {
                  const selected = form.planDays === plan.value;
                  const isLifetime = plan.value === "0";
                  return (
                    <label key={plan.value}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                        selected
                          ? isLifetime
                            ? "bg-purple-500/[0.07] border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                            : "bg-gold-500/[0.07] border border-gold-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                          : "bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }`}>
                      <input type="radio" name="planDays" value={plan.value}
                        checked={selected} onChange={onChange} className="sr-only" />
                      {/* Check dot */}
                      <span className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
                        selected
                          ? isLifetime ? "border-purple-500 bg-purple-500" : "border-gold-500 bg-gold-500"
                          : "border-white/15"
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </span>
                      <span className={`text-3xl font-bold leading-none mb-1 transition-colors ${
                        selected
                          ? isLifetime ? "text-purple-400" : "text-gold-400"
                          : "text-zinc-400"
                      }`}>
                        {plan.label}
                      </span>
                      <span className={`text-[11px] font-medium transition-colors ${
                        selected
                          ? isLifetime ? "text-purple-500" : "text-gold-500"
                          : "text-zinc-600"
                      }`}>
                        {plan.sub}
                      </span>
                      {plan.badge && (
                        <span className={`mt-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          isLifetime
                            ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                            : "bg-gold-500/15 text-gold-400 border-gold-500/20"
                        }`}>
                          {plan.badge}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-gold w-full py-3.5 text-[15px]">
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Mengirim Permintaan…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Kirim Permintaan Aktivasi
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2.5 px-4 py-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015]">
          <svg className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-[12px] text-zinc-600 leading-relaxed">
            Aktivasi hanya berlaku untuk kombinasi MT5 Login + Server yang didaftarkan.
            Perubahan akun memerlukan pengajuan ulang.
          </p>
        </div>
      </div>
    </div>
  );
}
