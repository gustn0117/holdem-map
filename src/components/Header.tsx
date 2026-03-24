"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/map", label: "지도", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { href: "/events", label: "대회", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/30 rounded-xl blur-md group-hover:blur-lg transition-all" />
            <div className="relative w-9 h-9 bg-linear-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/25">
              <span className="text-white font-black text-sm">H</span>
            </div>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            홀덤맵
          </span>
        </Link>

        <nav className="hidden md:flex items-center bg-white/[0.03] rounded-full px-1.5 py-1 border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent/15 text-accent-light"
                    : "text-muted hover:text-surface"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/admin"
            className="text-muted hover:text-surface text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            관리자
          </Link>
          <button className="bg-linear-to-r from-accent to-accent-light hover:opacity-90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-lg shadow-accent/25">
            매장 등록
          </button>
        </div>

        <button
          className="md:hidden text-surface p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden glass border-t border-white/5 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-accent/10 text-accent-light" : "text-muted"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-muted"
            onClick={() => setMenuOpen(false)}
          >
            관리자
          </Link>
        </nav>
      )}
    </header>
  );
}
