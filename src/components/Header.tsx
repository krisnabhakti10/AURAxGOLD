"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/",        label: "Beranda"    },
  { href: "/activate", label: "Aktivasi"  },
  { href: "/status",   label: "Cek Status" },
];

export default function Header() {
  const pathname    = usePathname();
  const [open, setOpen]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[60px]">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold-400/20 to-gold-600/10 group-hover:from-gold-400/30 transition-all duration-300" />
            <svg className="w-4 h-4 text-gold-400 relative z-10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l1.8 5.4H15l-4.6 3.3 1.8 5.4L8 12.1 3.8 15.1l1.8-5.4L1 6.4h5.2L8 1z"/>
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight leading-none">
            <span className="text-gold-gradient">AURA</span>
            <span className="text-zinc-400 font-light">x</span>
            <span className="text-gold-gradient">GOLD</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "text-gold-400"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 rounded-lg bg-gold-500/[0.08] border border-gold-500/[0.15]" />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop CTA ── */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link href="/status" className="btn-ghost text-[13px] py-1.5 px-3.5">
            Cek Status
          </Link>
          <Link href="/activate" className="btn-gold text-[13px] py-2 px-4">
            Ajukan Aktivasi
          </Link>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0c0c0c]/98 backdrop-blur-xl px-5 pt-3 pb-5 space-y-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-gold-400 bg-gold-500/[0.08] border border-gold-500/[0.15]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="pt-3 space-y-2">
            <Link href="/activate" className="btn-gold w-full py-3 text-sm">
              ✦ Ajukan Aktivasi
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
