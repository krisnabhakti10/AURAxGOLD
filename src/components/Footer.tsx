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
              <li>
                <a
                  href="https://one.exnessonelink.com/a/dk95kv8jji"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold-500/70 hover:text-gold-400 transition-colors duration-200 inline-flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Daftar Akun Exness
                </a>
              </li>
              <li>
                <a
                  href="https://www.digitalku.com/aff/6399"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500/70 hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Daftar VPS Digitalku
                </a>
              </li>
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
            <div className="mt-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Kontak Admin</p>
              <a
                href="https://wa.me/+6282223240329"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-emerald-500/80 hover:text-emerald-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat via WhatsApp
              </a>
            </div>
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
