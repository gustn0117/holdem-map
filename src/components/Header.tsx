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
    <header className="sticky top-0 z-50 bg-primary/80 backdrop-blur-xl border-b border-border-custom/50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-light rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white tracking-tight">홀덤맵</span>
            <span className="text-[10px] text-accent font-semibold bg-accent/10 px-1.5 py-0.5 rounded">BETA</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-white bg-accent/15 text-accent-light"
                    : "text-muted hover:text-surface hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className="text-muted hover:text-surface text-sm transition-colors"
          >
            관리자
          </Link>
          <button className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-accent/20">
            매장 등록
          </button>
        </div>

        <button
          className="md:hidden text-surface p-2 -mr-2"
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
        <nav className="md:hidden bg-primary/95 backdrop-blur-xl border-t border-border-custom/50 px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-accent-light bg-accent/10" : "text-muted hover:text-surface"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-surface transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            관리자
          </Link>
        </nav>
      )}
    </header>
  );
}
