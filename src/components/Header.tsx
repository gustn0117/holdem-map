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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border-custom">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-[60px] flex items-center gap-6">
          <Link href="/" className="text-[22px] font-black text-accent shrink-0 tracking-tight">홀덤맵</Link>

          <form onSubmit={handleSearch} className="flex-1 hidden md:flex justify-center">
            <div className="relative w-full max-w-[480px]">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="매장명, 지역 검색"
                className="w-full bg-[#f5f6f8] border-none rounded-full pl-11 pr-4 py-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all placeholder:text-[#aaa]" />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto shrink-0">
            <Link href="/events" className="hidden md:block text-[14px] text-sub hover:text-accent font-medium px-3 py-2 rounded-lg hover:bg-accent-light/50 transition-all">대회</Link>
            <Link href="/jobs" className="hidden md:block text-[14px] text-sub hover:text-accent font-medium px-3 py-2 rounded-lg hover:bg-accent-light/50 transition-all">구인구직</Link>
            <Link href="/shorts" className="hidden md:block text-[14px] text-sub hover:text-accent font-medium px-3 py-2 rounded-lg hover:bg-accent-light/50 transition-all">숏츠</Link>
            <Link href="/contact" className="hidden md:block bg-accent hover:bg-accent-hover text-white text-[13px] font-bold px-4 py-[9px] rounded-lg transition-all ml-2">매장 등록</Link>
            <button className="md:hidden text-surface p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border-custom px-5 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="매장명, 지역 검색"
                className="w-full bg-bg border border-border-custom rounded-lg pl-4 pr-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-all placeholder:text-muted" />
            </form>
            <div className="grid grid-cols-4 gap-2">
              {[{ href: "/events", label: "대회" }, { href: "/jobs", label: "구인구직" }, { href: "/shorts", label: "숏츠" }, { href: "/contact", label: "매장 등록", accent: true }].map(item => (
                <Link key={item.href} href={item.href} className={`text-center py-2.5 rounded-lg text-sm font-medium ${"accent" in item ? "bg-accent text-white" : "bg-bg text-sub"}`} onClick={() => setMenuOpen(false)}>{item.label}</Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-custom">
        <div className="flex items-center justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
          {[
            { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/map", label: "지도", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
            { href: "/events", label: "대회", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { href: "/jobs", label: "구인구직", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 min-w-14">
              <svg className={`w-[22px] h-[22px] ${pathname === item.href ? "text-accent" : "text-[#bbb]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span className={`text-[10px] font-semibold ${pathname === item.href ? "text-accent" : "text-[#bbb]"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
