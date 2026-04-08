"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [tournerBtnIdx, setTournerBtnIdx] = useState(0);
  const tournerTexts = ["무료토너", "선착순 참가권받기"];
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") { setDark(true); document.documentElement.classList.add("dark"); }

    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);

    const tournerInterval = setInterval(() => setTournerBtnIdx(prev => (prev + 1) % 2), 2000);
    return () => { window.removeEventListener("beforeinstallprompt", handler); clearInterval(tournerInterval); };
  }, []);

  const handleInstall = async () => {
    if (installPrompt && "prompt" in (installPrompt as any)) {
      (installPrompt as any).prompt();
      setInstallPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/map?q=${encodeURIComponent(query.trim())}`);
      inputRef.current?.blur();
    }
  };

  const navLinks = [
    { href: "/live", label: "실시간" },
    { href: "/events", label: "대회" },
    { href: "/jobs", label: "구인구직" },
    { href: "/market", label: "매장매매" },
    { href: "/board", label: "게시판" },
    { href: "/shorts", label: "숏츠" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-border-custom">
        <div className="w-full mx-auto px-5 md:px-10 h-14 flex items-center justify-between relative" style={{ maxWidth: "1400px" }}>
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 relative z-10 group">
            <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#03C75A" />
              <path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="#DC2626" />
            </svg>
            <span className="text-[19px] font-black text-surface leading-none">홀덤맵<span className="text-accent">KOREA</span></span>
          </Link>

          {/* Right: Nav */}
          <div className="flex items-center gap-1 shrink-0 relative z-10">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`hidden md:block text-[13px] font-medium px-3 py-1.5 rounded-md transition-all ${pathname === l.href ? "text-accent bg-accent-light" : "text-sub hover:text-accent hover:bg-[#f5f6f8]"}`}>
                {l.label}
              </Link>
            ))}
            <Link href="/tournament" className="hidden md:block bg-[#00874a] hover:bg-[#006b3a] text-white text-[13px] font-bold px-4 py-[7px] rounded-lg transition-all ml-1">무료토너</Link>
            <Link href="/contact" className="hidden md:block bg-accent hover:bg-accent-hover text-white text-[13px] font-bold px-4 py-[7px] rounded-lg transition-all ml-0.5">매장 등록</Link>
            {user ? (
              <div className="hidden md:block relative ml-1">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[13px] font-bold hover:bg-accent/20 transition-colors">
                  {profile?.nickname?.charAt(0) || "U"}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl card-shadow border border-border-custom py-2 z-50">
                    <div className="px-4 py-2 border-b border-border-custom">
                      <p className="text-surface text-[13px] font-bold">{profile?.nickname}</p>
                      <p className="text-muted text-[11px]">{profile?.email}</p>
                    </div>
                    <Link href="/mypage" onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-[13px] text-sub hover:bg-[#f5f6f8] transition-colors">마이페이지</Link>
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors">로그아웃</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:block text-[13px] font-medium text-sub hover:text-accent px-3 py-1.5 rounded-md transition-all ml-1">로그인</Link>
            )}
            {/* Dark mode toggle - PC only */}
            <button onClick={toggleDark} className="hidden md:flex w-8 h-8 rounded-full items-center justify-center hover:bg-[#f5f6f8] dark:hover:bg-[#27272a] transition-colors ml-1" title={dark ? "라이트 모드" : "다크 모드"}>
              {dark ? (
                <svg className="w-[18px] h-[18px] text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-[18px] h-[18px] text-sub" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            {/* Mobile: login/register or user */}
            {!user ? (
              <div className="md:hidden flex items-center gap-1">
                <Link href="/login" className="text-[11px] font-semibold text-sub px-2 py-1.5 rounded-md">로그인</Link>
                <Link href="/register" className="text-[11px] font-bold text-white bg-accent px-2.5 py-1.5 rounded-md">회원가입</Link>
              </div>
            ) : (
              <Link href="/mypage" className="md:hidden w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-[11px] font-bold">
                {profile?.nickname?.charAt(0) || "U"}
              </Link>
            )}
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
          <div className="md:hidden bg-white border-t border-border-custom px-5 py-4 space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {[...navLinks, { href: "/contact", label: "매장 등록" }].map((item) => (
                <Link key={item.href} href={item.href}
                  className={`text-center py-2.5 rounded-lg text-[12px] font-medium ${pathname === item.href ? "bg-accent text-white" : "bg-[#f5f6f8] text-sub"}`}
                  onClick={() => setMenuOpen(false)}>{item.label}</Link>
              ))}
            </div>
            {user ? (
              <div className="flex items-center justify-between bg-[#f5f6f8] rounded-lg px-4 py-2.5">
                <Link href="/mypage" onClick={() => setMenuOpen(false)}>
                  <p className="text-surface text-[13px] font-bold">{profile?.nickname}</p>
                  <p className="text-accent text-[11px]">마이페이지 →</p>
                </Link>
                <button onClick={() => { signOut(); setMenuOpen(false); }}
                  className="text-red-400 text-[12px] font-semibold">로그아웃</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="text-center py-2.5 rounded-lg text-[13px] font-semibold bg-[#f5f6f8] text-sub" onClick={() => setMenuOpen(false)}>로그인</Link>
                <Link href="/register" className="text-center py-2.5 rounded-lg text-[13px] font-semibold bg-accent text-white" onClick={() => setMenuOpen(false)}>회원가입</Link>
              </div>
            )}
          </div>
        )}
        {/* Search bar + 무료토너 */}
        <div className="border-t border-border-custom px-4 py-2 bg-white">
          <div className="flex items-center gap-2 max-w-[700px] mx-auto">
          <form onSubmit={handleSearch} className="flex-1">
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
          <Link href="/tournament" className="shrink-0 bg-[#00874a] hover:bg-[#006b3a] text-white text-[11px] md:text-[13px] font-black py-2 md:py-2.5 rounded-full transition-all whitespace-nowrap flex items-center justify-center gap-1 relative" style={{ width: "120px" }}>
            <svg className="w-3.5 h-3.5 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span className="relative h-4 overflow-hidden" style={{ width: "75px" }}>
              {tournerTexts.map((text, i) => (
                <span key={text} className="absolute inset-0 flex items-center transition-opacity duration-500" style={{ opacity: tournerBtnIdx === i ? 1 : 0 }}>{text}</span>
              ))}
            </span>
          </Link>
          </div>
          <div className="md:hidden flex items-center gap-2 mt-2">
            {[
              { href: "/live", label: "실시간", icon: "M13 10V3L4 14h7v7l9-11h-7z", bg: "bg-[#dc2626] hover:bg-[#b91c1c]" },
              { href: "/jobs", label: "구인구직", icon: "M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0h2a2 2 0 012 2v6M8 6H6a2 2 0 00-2 2v6", bg: "bg-[#ef6b6b] hover:bg-[#e05252]" },
              { href: "/events", label: "대회", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", bg: "bg-[#60a5fa] hover:bg-[#4d94ef]" },
              { href: "/map", label: "매장정보", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", bg: "bg-[#a78bfa] hover:bg-[#9575f0]" },
              { href: "/shorts", label: "숏츠", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z", bg: "bg-[#fbbf24] hover:bg-[#e5ac1e]" },
              { href: "/market", label: "대관/매매", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", bg: "bg-[#1e3a5f] hover:bg-[#162d4a]" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex items-center justify-center gap-0.5 text-white rounded-lg py-2 transition-all whitespace-nowrap ${item.bg}`}>
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-[9px] font-bold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-custom">
        <div className="flex items-center justify-around py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
          {[
            { href: "/", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { href: "/live", label: "실시간", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
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
          <button onClick={handleInstall} className="flex flex-col items-center gap-0.5 min-w-14">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-[10px] text-accent font-bold">앱 설치</span>
          </button>
        </div>
      </nav>

      {/* Install guide modal (iOS Safari) */}
      {showInstallGuide && (
        <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInstallGuide(false)} />
          <div className="relative bg-white rounded-t-2xl w-full max-w-md p-6 pb-10 safe-area-bottom">
            <button onClick={() => setShowInstallGuide(false)} className="absolute top-4 right-4 text-muted">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center mb-5">
              <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="8" fill="#03C75A" />
                <path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="#DC2626" />
              </svg>
              <h3 className="text-surface text-lg font-black">홀덤맵KOREA 앱 설치</h3>
              <p className="text-muted text-sm mt-1">홈 화면에 추가하여 앱처럼 사용하세요</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">1</span>
                <p className="text-sub text-[14px]">하단 브라우저 메뉴에서 <span className="inline-flex items-center">
                  <svg className="w-4 h-4 text-blue-500 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </span> <strong>공유</strong> 버튼을 눌러주세요</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">2</span>
                <p className="text-sub text-[14px]"><strong>홈 화면에 추가</strong>를 선택하세요</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">3</span>
                <p className="text-sub text-[14px]">우측 상단 <strong>추가</strong>를 눌러 완료하세요</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
