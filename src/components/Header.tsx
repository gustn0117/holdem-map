"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/map?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
          <Link href="/" className="text-2xl font-black text-accent tracking-tight shrink-0">홀덤맵</Link>

          {/* Search in header - centered */}
          <form onSubmit={handleSearch} className="flex-1 hidden md:flex justify-center">
            <div className="relative w-full max-w-lg">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="지역명, 매장명 검색"
                className="w-full bg-gray-100 border border-transparent text-surface rounded-xl pl-12 pr-4 py-2.5 text-base focus:outline-none focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted"
              />
            </div>
          </form>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <Link href="/admin" className="text-muted hover:text-surface text-sm transition-colors hidden md:block">관리자</Link>
            <Link href="/contact" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all hidden md:block">
              매장 등록
            </Link>
            <button className="md:hidden text-surface p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border-custom px-4 py-3 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="지역명, 매장명 검색"
                  className="w-full bg-gray-100 border border-transparent text-surface rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:bg-white transition-all placeholder:text-muted"
                />
              </div>
            </form>
            <div className="flex gap-2">
              <Link href="/map" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-surface" onClick={() => setMenuOpen(false)}>지도</Link>
              <Link href="/events" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-surface" onClick={() => setMenuOpen(false)}>대회</Link>
              <Link href="/contact" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium bg-accent text-white" onClick={() => setMenuOpen(false)}>매장 등록</Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-custom">
        <div className="flex items-center justify-around py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          {[
            { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/map", label: "지도", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
            { href: "/events", label: "대회", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 min-w-16">
              <svg className={`w-6 h-6 ${pathname === item.href ? "text-accent" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className={`text-xs font-medium ${pathname === item.href ? "text-accent" : "text-muted"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
