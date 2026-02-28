import Link from "next/link";

/* ─── Data ──────────────────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: "Buat Akun Exness",
    desc: "Buka akun trading MT5 melalui Exness menggunakan link resmi kami. Proses pendaftaran cepat dan mudah.",
    link: "https://one.exnessonelink.com/a/dk95kv8jji",
    linkLabel: "Buat Akun Exness →",
  },
  {
    n: "02",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Ajukan Aktivasi",
    desc: "Submit MT5 Login, Server, dan email Anda. Pilih paket 30 atau 90 hari sesuai kebutuhan.",
  },
  {
    n: "03",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Verifikasi Admin",
    desc: "Admin kami memverifikasi data dan mengaktifkan lisensi. Proses biasanya selesai dalam 1×24 jam.",
  },
  {
    n: "04",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "EA Aktif & Berjalan",
    desc: "AURAxGOLD EA terverifikasi otomatis dan siap dijalankan pada akun MT5 yang terdaftar.",
  },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Algoritma Cerdas",
    desc: "Strategi trading berbasis AI yang dioptimalkan untuk pasar XAUUSD dengan akurasi tinggi.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Manajemen Risiko",
    desc: "Built-in money management dengan stop loss dinamis untuk melindungi modal Anda setiap saat.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Performa Konsisten",
    desc: "Track record teruji dengan drawdown minimal dan profit factor yang solid sepanjang tahun.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: "Lisensi Aman",
    desc: "Sistem lisensi berbasis MT5 login unik. Tidak bisa dipindah atau dibagikan ke akun lain.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Multi-Broker",
    desc: "Kompatibel dengan berbagai broker MT5 terkemuka dengan eksekusi order yang cepat dan stabil.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Support Aktif",
    desc: "Tim kami siap membantu konfigurasi, optimasi, dan troubleshooting EA Anda kapan saja.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    title: "Rekomendasi VPS",
    desc: "Gunakan VPS agar EA berjalan 24/7 tanpa gangguan. Kami rekomendasikan Digitalku VPS — stabil, cepat, dan terjangkau.",
    link: "https://www.digitalku.com/aff/6399",
    linkLabel: "Daftar VPS Digitalku →",
  },
];

const STATS = [
  { value: "2+",   label: "Tahun Aktif",      sub: "Terbukti & teruji" },
  { value: "500+", label: "Lisensi Aktif",     sub: "Pengguna terdaftar" },
  { value: "24/7", label: "Monitoring",        sub: "Tanpa henti" },
  { value: "99%",  label: "Uptime Server",     sub: "Infrastruktur stabil" },
];

/* ─── Page ──────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
    <div className="overflow-x-hidden">

      {/* ════════════════════════════════ HERO ══════════════════════════════ */}
      <section className="relative flex items-center justify-center min-h-[92vh] px-5 sm:px-8 overflow-hidden">

        {/* Multi-layer background */}
        <div className="pointer-events-none absolute inset-0">
          {/* Deep radial burst */}
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 55% at 50% -5%, rgba(217,119,6,0.18) 0%, transparent 65%)" }}
          />
          {/* Subtle corner glows */}
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)" }} />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)" }} />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg,rgba(245,158,11,1) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40"
            style={{ background: "linear-gradient(to top, #080808, transparent)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center py-28">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/20 bg-gold-500/[0.05] text-gold-400 text-[11px] font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-[blink_2s_ease-in-out_infinite]" />
            MT5 Expert Advisor — Lisensi Resmi
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-tight leading-none mb-5" style={{ fontSize: "clamp(3rem, 10vw, 6rem)" }}>
            <span className="text-gold-gradient">AURA</span>
            <span className="text-white/30 font-thin">×</span>
            <span className="text-gold-gradient">GOLD</span>
          </h1>

          <p className="text-zinc-300 font-medium mb-3 text-lg sm:text-xl">
            Expert Advisor Premium untuk{" "}
            <span className="text-gold-400 font-semibold">XAUUSD</span>
          </p>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl mx-auto mb-12 leading-relaxed">
            Sistem trading otomatis berbasis algoritma cerdas. Buat akun Exness,
            ajukan aktivasi, dan biarkan EA bekerja untuk Anda 24/7.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://one.exnessonelink.com/a/dk95kv8jji"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-[15px] py-3.5 px-8 shadow-[0_0_30px_rgba(245,158,11,0.25)] inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Buat Akun Exness
            </a>
            <Link href="/activate" className="btn-outline-gold text-[15px] py-3.5 px-8">
              Ajukan Aktivasi
            </Link>
            <Link href="/status" className="btn-outline-gold text-[15px] py-3.5 px-8">
              Cek Status Lisensi
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gold-gradient leading-none mb-1">{s.value}</p>
                <p className="text-xs font-medium text-zinc-300 mb-0.5">{s.label}</p>
                <p className="text-[11px] text-zinc-600">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">Cara Kerja</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Mulai dalam{" "}
              <span className="text-gold-gradient">4 Langkah</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Proses aktivasi sederhana, transparan, dan cepat.
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative group">
                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(100%+1px)] w-[calc(100%-2px)] h-px z-10"
                    style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))" }} />
                )}

                <div className="card p-5 h-full group-hover:border-gold-500/20 transition-all duration-300 flex flex-col">
                  {/* Number + icon row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gold-400"
                      style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))", border: "1px solid rgba(245,158,11,0.2)" }}>
                      {step.icon}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-700 font-mono tracking-wider">{step.n}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-2 leading-snug">{step.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors duration-200 group/link"
                    >
                      <span>{step.linkLabel}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ DIVIDER ════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-8">
        <div className="divider-gold" />
      </div>

      {/* ════════════════════════════ FEATURES ══════════════════════════════ */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">Keunggulan</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Kenapa Pilih{" "}
              <span className="text-gold-gradient">AURAxGOLD?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="card p-5 group hover:border-gold-500/20 transition-all duration-300">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 text-gold-400"
                  style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.12)" }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                {f.link && (
                  <a
                    href={f.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors duration-200"
                  >
                    {f.linkLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ LIVE ACCOUNT ═══════════════════════════ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-10">
            <p className="section-eyebrow mb-3">Transparansi</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Akun <span className="text-gold-gradient">Live Trading</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Monitor performa EA kami secara langsung. Gunakan kredensial investor (read-only) di bawah ini untuk memantau akun live kami melalui MetaTrader 5.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(20,14,0,0.95) 0%, rgba(10,8,0,0.98) 100%)",
              border: "1px solid rgba(245,158,11,0.25)",
              boxShadow: "0 0 50px rgba(245,158,11,0.06), inset 0 1px 0 rgba(245,158,11,0.08)",
            }}>

            {/* Top glow */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)" }} />

            {/* Header bar */}
            <div className="flex items-center gap-3 px-6 py-4 border-b"
              style={{ borderColor: "rgba(245,158,11,0.1)", background: "rgba(245,158,11,0.03)" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-400 tracking-wide">LIVE ACCOUNT — INVESTOR ACCESS</span>
              </div>
            </div>

            {/* Credentials grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">

              {/* Login */}
              <div className="px-6 py-6 flex flex-col gap-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Login ID</p>
                <p className="text-xl font-mono font-bold text-gold-400 tracking-wider select-all">257261514</p>
                <p className="text-[11px] text-zinc-600">MT5 Account Number</p>
              </div>

              {/* Server */}
              <div className="px-6 py-6 flex flex-col gap-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Server</p>
                <p className="text-base font-mono font-bold text-zinc-200 tracking-wide select-all">Exness-MT5Real36</p>
                <p className="text-[11px] text-zinc-600">Broker Server</p>
              </div>

              {/* Password */}
              <div className="px-6 py-6 flex flex-col gap-1.5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Kata Sandi Investor</p>
                <p className="text-base font-mono font-bold text-zinc-200 tracking-wide select-all">AURAxGOLD1@</p>
                <p className="text-[11px] text-zinc-600">Read-only · Tidak bisa trading</p>
              </div>
            </div>

            {/* Info bar */}
            <div className="px-6 py-3.5 border-t flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"
              style={{ borderColor: "rgba(245,158,11,0.1)", background: "rgba(245,158,11,0.02)" }}>
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <svg className="w-3.5 h-3.5 text-gold-500/60 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Buka MetaTrader 5 → File → Login → masukkan data di atas untuk melihat history trading secara real-time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ VPS ════════════════════════════════ */}
      <section className="py-10 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(14,22,36,0.95) 0%, rgba(8,14,24,0.98) 100%)",
              border: "1px solid rgba(59,130,246,0.2)",
              boxShadow: "0 0 40px rgba(59,130,246,0.05)",
            }}>
            {/* Left glow */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-40 opacity-20"
              style={{ background: "radial-gradient(ellipse at left, rgba(59,130,246,0.5) 0%, transparent 70%)" }} />

            {/* Icon */}
            <div className="relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}>
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>

            {/* Text */}
            <div className="relative flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-white">Butuh VPS untuk Jalankan EA 24/7?</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  Rekomendasi
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-lg">
                Expert Advisor butuh server yang selalu aktif. Gunakan <span className="text-zinc-300 font-medium">VPS Digitalku</span> — server lokal Indonesia, performa stabil, harga terjangkau, dan mudah dikonfigurasi untuk MT5.
              </p>
            </div>

            {/* CTA */}
            <a
              href="https://www.digitalku.com/aff/6399"
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))",
                boxShadow: "0 4px_20px rgba(59,130,246,0.3)",
                border: "1px solid rgba(59,130,246,0.4)",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Daftar VPS Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ CTA ═══════════════════════════════ */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(30,16,0,0.9) 0%, rgba(15,10,0,0.95) 100%)",
              border: "1px solid rgba(245,158,11,0.22)",
              boxShadow: "0 0 60px rgba(245,158,11,0.07), inset 0 1px 0 rgba(245,158,11,0.1)",
            }}>

            {/* BG glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.8) 0%, transparent 70%)", filter: "blur(40px)" }} />
            </div>

            <div className="relative z-10">
              <p className="section-eyebrow mb-4">Mulai Sekarang</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                Siap Trading dengan EA Premium?
              </h2>
              <p className="text-zinc-400 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
                Daftarkan akun MT5 Exness Anda menggunakan link resmi kami, lalu ajukan aktivasi.
                Persetujuan biasanya selesai dalam 1×24 jam.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://one.exnessonelink.com/a/dk95kv8jji"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold py-3.5 px-8 text-[15px] inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Buat Akun Exness
                </a>
                <Link href="/activate" className="btn-outline-gold py-3.5 px-8 text-[15px]">
                  Ajukan Aktivasi
                </Link>
                <a
                  href="https://wa.me/+6282223240329"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-gold py-3.5 px-8 text-[15px] inline-flex items-center gap-2 border-emerald-600/40 text-emerald-400 hover:border-emerald-500/60 hover:text-emerald-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Hubungi Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>

    {/* ═══════════════════ FLOATING WHATSAPP BUTTON ════════════════════ */}
    <a
      href="https://wa.me/+6282223240329"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.45)] hover:shadow-[0_4px_32px_rgba(16,185,129,0.65)] transition-all duration-300 hover:-translate-y-0.5 group"
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span>Hubungi Admin</span>
    </a>
    </>
  );
}
