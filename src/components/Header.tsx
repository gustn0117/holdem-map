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
      <header className="sticky top-0 z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/40 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-8 h-8 bg-linear-to-br from-accent to-accent-light rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-white font-black text-xs">H</span>
              </div>
            </div>
            <span className="text-base font-bold text-white">홀덤맵</span>
          </Link>

          <nav className="hidden md:flex items-center bg-white/[0.03] rounded-full p-1 border border-white/[0.04]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    isActive ? "bg-accent/15 text-accent-light" : "text-muted hover:text-surface"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="text-muted hover:text-surface text-[13px] transition-colors">관리자</Link>
            <button className="bg-linear-to-r from-accent to-accent-light text-white text-[13px] font-semibold px-5 py-2 rounded-full shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all">
              매장 등록
            </button>
          </div>

          <button className="md:hidden text-surface p-1.5" onClick={() => setMenuOpen(!menuOpen)}>
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
          <nav className="md:hidden glass border-t border-white/[0.04] px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                  pathname === item.href ? "bg-accent/10 text-accent-light" : "text-muted"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/admin" className="block px-4 py-3 rounded-xl text-sm text-muted" onClick={() => setMenuOpen(false)}>관리자</Link>
          </nav>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.04] safe-area-bottom">
        <div className="flex items-center justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {[
            { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/map", label: "지도", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
            { href: "/events", label: "대회", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { href: "/admin", label: "관리", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 min-w-[56px]">
                <svg className={`w-5 h-5 transition-colors ${isActive ? "text-accent-light" : "text-muted/50"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className={`text-[10px] font-medium ${isActive ? "text-accent-light" : "text-muted/40"}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
