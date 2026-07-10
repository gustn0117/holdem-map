"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PointshopProductCard from "@/components/PointshopProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { listProducts, checkEligibility, POINTSHOP_MIN_POINTS, POINTSHOP_MIN_DAYS } from "@/lib/pointshop";
import type { PointshopProduct } from "@/types";
import { getRank } from "@/lib/rank";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "전체": <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>,
  "굿즈": <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>,
  "기프티콘": <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,
  "제휴": <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
  "이벤트": <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
  "기타": <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>,
};

const CATEGORIES = [
  { key: "전체", color: "bg-gray-100 text-gray-700" },
  { key: "굿즈", color: "bg-pink-100 text-pink-700" },
  { key: "기프티콘", color: "bg-purple-100 text-purple-700" },
  { key: "제휴", color: "bg-blue-100 text-blue-700" },
  { key: "이벤트", color: "bg-amber-100 text-amber-700" },
  { key: "기타", color: "bg-emerald-100 text-emerald-700" },
];

const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: "recommend", label: "추천순" },
  { key: "new", label: "신상품순" },
  { key: "price-asc", label: "낮은 가격순" },
  { key: "price-desc", label: "높은 가격순" },
];

export default function PointshopPage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<PointshopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("recommend");
  const [query, setQuery] = useState("");

  useEffect(() => {
    listProducts().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const points = (profile as { points?: number } | null)?.points || 0;
  const eligibility = checkEligibility(profile as any);
  const rank = getRank(points);

  const bestSellers = useMemo(() => [...products].sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0)).slice(0, 4), [products]);
  const newArrivals = useMemo(() => [...products].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 4), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "전체") list = list.filter(p => p.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    }
    switch (sort) {
      case "new": list = [...list].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break;
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      default: list = [...list].sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0));
    }
    return list;
  }, [products, category, sort, query]);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-secondary">
      <Header />

      {/* Hero Banner — 커머스 톤 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#0d1428] via-[#1a2547] to-[#00874a]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-350 mx-auto px-5 md:px-10 py-10 md:py-14 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-block text-[10px] md:text-[11px] font-black text-yellow-300 bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/30 uppercase tracking-widest mb-4">POINT SHOP · MEMBER ONLY</span>
              <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">홀덤맵 <span className="text-yellow-300">포인트샵</span></h1>
              <p className="text-white/85 text-[15px] md:text-lg mb-5">활동으로 모은 포인트를 굿즈·기프티콘·제휴 상품으로 교환하세요.</p>
              {user ? (
                <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md">
                  <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-4 py-2.5 border border-white/20">
                    <p className="text-white/70 text-[10px] mb-0.5">내 포인트</p>
                    <p className="text-yellow-300 text-[15px] md:text-lg font-black">{points.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-4 py-2.5 border border-white/20">
                    <p className="text-white/70 text-[10px] mb-0.5">계급</p>
                    <p className="text-white text-[13px] md:text-base font-black">{rank.name}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-4 py-2.5 border border-white/20">
                    <p className="text-white/70 text-[10px] mb-0.5">이용 가능</p>
                    <p className={`text-[13px] md:text-base font-black ${eligibility.eligible ? "text-emerald-300" : "text-red-300"}`}>{eligibility.eligible ? "가능" : "제한"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  <Link href="/register" className="bg-yellow-400 hover:bg-yellow-300 text-[#0d1428] font-black text-[13px] px-5 py-2.5 rounded-lg shadow-lg">회원가입하고 시작하기</Link>
                  <Link href="/login" className="border border-white/40 text-white hover:bg-white/10 font-bold text-[13px] px-5 py-2.5 rounded-lg">로그인</Link>
                </div>
              )}
              {user && (
                <div className="flex gap-3 mt-4 text-[13px]">
                  <Link href="/pointshop/orders" className="text-white/90 hover:text-yellow-300 font-semibold inline-flex items-center gap-1">
                    내 주문 내역
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              )}
            </div>
            {/* Marketing promo card */}
            <div className="hidden md:flex justify-end">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 max-w-sm w-full">
                <p className="text-yellow-300 text-[11px] font-black tracking-widest mb-2">이번 주 프로모션</p>
                <p className="text-white text-lg font-black leading-snug mb-3">딜러 구인구직 등록만 해도<br/><span className="text-yellow-300">+5,000pt</span> 즉시 적립</p>
                <p className="text-white/70 text-[12px] mb-4">하루 1회, 자동 지급. 첫 등록 후 14일이 지나면 바로 상품 교환 가능해요.</p>
                <Link href="/jobs/write" className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-[#0d1428] font-black text-[12px] px-4 py-2 rounded-lg">
                  지금 등록하러 가기
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full mx-auto px-5 md:px-10 py-6 md:py-8 flex-1 max-w-350">
        {/* Eligibility banner */}
        {user && !eligibility.eligible && (
          <div className="bg-white border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
            <div className="flex-1 text-[13px]">
              <p className="text-amber-800 font-bold mb-1">아직 상품 교환은 불가합니다</p>
              <ul className="text-amber-700 space-y-0.5">
                {eligibility.reasons.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
              <p className="text-amber-600 text-[12px] mt-2">
                이용 조건: 가입 후 <strong>{POINTSHOP_MIN_DAYS}일 경과</strong> + 포인트 <strong>{POINTSHOP_MIN_POINTS.toLocaleString()}점 이상</strong>
              </p>
            </div>
          </div>
        )}

        {/* Category quick nav */}
        <section className="mb-6">
          <div className="grid grid-cols-6 gap-2 md:gap-3">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`group flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-2xl border transition-all ${category === c.key ? "border-accent bg-accent/5" : "border-transparent hover:border-border-custom bg-white"}`}>
                <span className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center ${c.color}`}>{CATEGORY_ICONS[c.key]}</span>
                <span className={`text-[11px] md:text-[13px] font-bold ${category === c.key ? "text-accent" : "text-sub"}`}>{c.key}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Best sellers */}
        {bestSellers.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>
                  BEST
                </span>
                <h2 className="text-surface text-[16px] md:text-[18px] font-black">인기 상품 TOP 4</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {bestSellers.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Middle promo strip */}
        <section className="mb-8 rounded-2xl bg-linear-to-r from-emerald-50 via-white to-yellow-50 border border-border-custom p-5 md:p-6 flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface font-black text-[14px] md:text-[16px] mb-0.5">포인트는 이렇게 모으세요</p>
            <p className="text-muted text-[12px] md:text-[13px]">구인구직 등록 <strong className="text-accent">+5,000pt</strong> · 게시글 <strong className="text-accent">+10pt</strong> · 댓글 <strong className="text-accent">+3pt</strong> · 추천 <strong className="text-accent">+1pt</strong></p>
          </div>
          <Link href="/board/write" className="hidden sm:inline-flex bg-accent text-white text-[12px] font-bold px-4 py-2 rounded-lg hover:bg-accent-hover shrink-0">글쓰러 가기</Link>
        </section>

        {/* New arrivals */}
        {newArrivals.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full">
                  NEW
                </span>
                <h2 className="text-surface text-[16px] md:text-[18px] font-black">신상품</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {newArrivals.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* All products header + filter/sort */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-surface text-[18px] md:text-xl font-black">
              {category === "전체" ? "전체 상품" : `${category}`} <span className="text-muted text-[13px] font-semibold ml-1">({filtered.length})</span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 md:min-w-60">
                <svg className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품 검색"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-custom bg-white text-[13px] focus:outline-none focus:border-accent" />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 rounded-lg border border-border-custom bg-white text-[13px] focus:outline-none focus:border-accent">
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-custom py-20 text-center">
              <p className="text-muted text-[15px]">조건에 맞는 상품이 없습니다</p>
              <p className="text-muted text-[12px] mt-1">다른 카테고리나 검색어를 시도해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Bottom info */}
        <section className="bg-white border border-border-custom rounded-2xl p-6 md:p-8">
          <h2 className="text-surface font-black text-lg mb-4">포인트샵 이용 안내</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <p className="text-surface font-bold text-[14px] mb-1">이용 조건</p>
              <p className="text-muted text-[13px]">회원가입 후 <strong className="text-surface">{POINTSHOP_MIN_DAYS}일 경과</strong> + 보유 포인트 <strong className="text-surface">{POINTSHOP_MIN_POINTS.toLocaleString()}점 이상</strong></p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8a4 4 0 01-8 0V8a4 4 0 118 0z"/></svg>
              </div>
              <p className="text-surface font-bold text-[14px] mb-1">포인트 적립</p>
              <p className="text-muted text-[13px]">딜러 <strong className="text-accent">구인구직 등록 시 +5,000pt</strong> (하루 1회) · 게시글 · 댓글 · 추천으로 매일 적립</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              </div>
              <p className="text-surface font-bold text-[14px] mb-1">배송 · 환불</p>
              <p className="text-muted text-[13px]">주문 후 관리자 승인 → 순차 발송 (평균 3~7영업일). 승인 전 취소 시 포인트 자동 환불.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
