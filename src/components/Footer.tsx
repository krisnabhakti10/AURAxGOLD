import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.05] bg-[#080808] mt-auto">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand col */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3 group w-fit">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-400/20 to-gold-600/10" />
                <svg className="w-4 h-4 text-gold-400 relative z-10" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l1.8 5.4H15l-4.6 3.3 1.8 5.4L8 12.1 3.8 15.1l1.8-5.4L1 6.4h5.2L8 1z"/>
                </svg>
              </div>
              <span className="font-bold text-[15px] tracking-tight">
                <span className="text-gold-gradient">AURA</span>
                <span className="text-zinc-500 font-light">x</span>
                <span className="text-gold-gradient">GOLD</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-xs">
              Expert Advisor premium untuk XAUUSD MetaTrader 5.
              Sistem lisensi berbasis akun MT5 yang aman dan terverifikasi.
            </p>
          </div>

          {/* Links col */}
          <div className="md:col-span-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Portal</p>
            <ul className="space-y-2">
              {[
                { href: "/",         label: "Beranda"       },
                { href: "/activate", label: "Ajukan Aktivasi"},
                { href: "/status",   label: "Cek Status"    },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-500 hover:text-gold-400 transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info col */}
          <div className="md:col-span-1">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Info</p>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>Aktivasi 1×24 jam</li>
              <li>Paket 30 & 90 hari</li>
              <li>Lisensi per akun MT5</li>
            </ul>
          </div>
        </div>

        <div className="divider-gold mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-700">
          <p>© {year} AURAxGOLD. All rights reserved.</p>
          <p>Lisensi hanya berlaku untuk akun MT5 yang terdaftar.</p>
        </div>
      </div>
    </footer>
  );
}
