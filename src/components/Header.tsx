"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/map", label: "지도" },
  { href: "/events", label: "대회" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-red text-base">♠</span>
            <span className="gold-text-shine text-xl font-black tracking-tight">홀덤맵</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-card rounded-full p-1.5 border border-border-custom">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${pathname === item.href ? "gold-btn text-dark shadow-md" : "text-muted hover:text-white"}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/admin" className="text-muted hover:text-white text-sm transition-colors">관리자</Link>
            <Link href="/contact" className="gold-btn text-dark text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-accent/30 hover:-translate-y-0.5 transition-all">
              매장 등록
            </Link>
          </div>

          <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden glass border-t border-border-custom px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`block px-5 py-3.5 rounded-xl text-base font-medium ${pathname === item.href ? "text-accent bg-accent/10" : "text-muted"}`}
                onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border-custom">
        <div className="flex items-center justify-around py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {[
            { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/map", label: "지도", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
            { href: "/events", label: "대회", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 min-w-16">
              <svg className={`w-6 h-6 ${pathname === item.href ? "text-accent" : "text-muted/50"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className={`text-xs font-medium ${pathname === item.href ? "text-accent" : "text-muted/50"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
