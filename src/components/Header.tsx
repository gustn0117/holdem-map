"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function Header() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/map?q=${encodeURIComponent(query.trim())}`);
      inputRef.current?.blur();
    }
  };

  const navLinks = [
    { href: "/events", label: "대회" },
    { href: "/jobs", label: "구인구직" },
    { href: "/shorts", label: "숏츠" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-border-custom">
        <div className="container-main h-14 flex items-center justify-between relative">
          {/* Left: Logo */}
          <Link href="/" className="text-[21px] font-black text-accent shrink-0 relative z-10">홀덤맵</Link>

          {/* Center: Search - absolute center */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] px-[140px] lg:px-0">
            <form onSubmit={handleSearch}>
              <div className={`relative rounded-full border transition-all ${focused ? "border-accent shadow-[0_0_0_3px_rgba(3,199,90,0.1)] bg-white" : "border-border-custom bg-[#f5f6f8]"}`}>
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="매장명, 지역, 구인구직으로 검색하세요"
                  className="w-full bg-transparent rounded-full pl-11 pr-20 py-2.5 text-[14px] focus:outline-none placeholder:text-[#bbb]"
                />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold px-4 py-1.5 rounded-full transition-all">
                  검색
                </button>
              </div>
            </form>
          </div>

          {/* Right: Nav */}
          <div className="flex items-center gap-1 shrink-0 relative z-10">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`hidden md:block text-[13px] font-medium px-3 py-1.5 rounded-md transition-all ${pathname === l.href ? "text-accent bg-accent-light" : "text-sub hover:text-accent hover:bg-[#f5f6f8]"}`}>
                {l.label}
              </Link>
            ))}
            <Link href="/contact" className="hidden md:block bg-accent hover:bg-accent-hover text-white text-[13px] font-bold px-4 py-[7px] rounded-lg transition-all ml-1">매장 등록</Link>
            <button className="md:hidden text-surface p-1.5" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-border-custom px-5 py-4">
            <div className="grid grid-cols-4 gap-2">
              {[...navLinks, { href: "/contact", label: "매장 등록" }].map((item, i) => (
                <Link key={item.href} href={item.href}
                  className={`text-center py-2.5 rounded-lg text-[13px] font-medium ${i === 3 ? "bg-accent text-white" : "bg-[#f5f6f8] text-sub"}`}
                  onClick={() => setMenuOpen(false)}>{item.label}</Link>
              ))}
            </div>
          </div>
        )}
        {/* Mobile search bar - always visible below header */}
        <div className="md:hidden border-t border-border-custom px-4 py-2.5 bg-white">
          <form onSubmit={handleSearch}>
            <div className={`relative rounded-full border transition-all ${focused ? "border-accent shadow-[0_0_0_3px_rgba(3,199,90,0.1)] bg-white" : "border-border-custom bg-[#f5f6f8]"}`}>
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="매장명, 지역, 구인구직으로 검색하세요"
                className="w-full bg-transparent rounded-full pl-10 pr-16 py-2.5 text-[14px] focus:outline-none placeholder:text-[#bbb]"
              />
              <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all">
                검색
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-custom">
        <div className="flex items-center justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
          {[
            { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/map", label: "지도", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
            { href: "/events", label: "대회", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { href: "/jobs", label: "구인구직", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 min-w-14">
              <svg className={`w-5 h-5 ${pathname === item.href ? "text-accent" : "text-[#ccc]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={pathname === item.href ? 2 : 1.5} d={item.icon} />
              </svg>
              <span className={`text-[10px] ${pathname === item.href ? "text-accent font-bold" : "text-[#bbb] font-medium"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
