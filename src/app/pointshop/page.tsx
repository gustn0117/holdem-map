"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PointshopProductCard from "@/components/PointshopProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { listProducts, checkEligibility, POINTSHOP_MIN_POINTS, POINTSHOP_MIN_DAYS } from "@/lib/pointshop";
import type { PointshopProduct } from "@/types";
import { getRank } from "@/lib/rank";

const CATEGORIES = ["전체", "굿즈", "기프티콘", "제휴", "이벤트", "기타"];

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
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      {/* Hero */}
      <section className="relative min-h-64 overflow-hidden bg-[#101426] md:aspect-3/1 md:min-h-56 md:max-h-96">
        <Image
          src="/images/pointshop/pointshop-hero.png"
          alt="에메랄드 포커칩과 골드 리워드 코인"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#080b16]/95 via-[#080b16]/55 to-transparent md:via-[#080b16]/15" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-350 mx-auto px-5 md:px-10 w-full text-white">
            <p className="text-yellow-300 text-[11px] font-black uppercase tracking-widest mb-2">POINT SHOP</p>
            <h1 className="text-4xl md:text-5xl font-black leading-none mb-3">
              모아서 <span className="text-yellow-300">교환</span>
            </h1>
            <p className="text-white/80 text-[14px] md:text-[15px] max-w-md">활동으로 쌓은 포인트를 굿즈·기프티콘·제휴 상품으로 바꿔가세요.</p>
          </div>
        </div>
      </section>

      {/* Status bar — 로그인 사용자만 */}
      {user && (
        <section className="border-b border-border-custom bg-white">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-4 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-6 flex-1 min-w-0 flex-wrap">
              <div>
                <p className="text-muted text-[11px] font-semibold uppercase tracking-wider">보유 포인트</p>
                <p className="text-surface text-2xl md:text-3xl font-black leading-tight">{points.toLocaleString()}<span className="text-muted text-[12px] font-semibold ml-1">pt</span></p>
              </div>
              <div className="w-px h-8 bg-border-custom" />
              <div>
                <p className="text-muted text-[11px] font-semibold uppercase tracking-wider">계급</p>
                <p className="text-surface text-lg font-black">{rank.name}</p>
              </div>
              <div className="w-px h-8 bg-border-custom" />
              <div>
                <p className="text-muted text-[11px] font-semibold uppercase tracking-wider">이용 가능 여부</p>
                <p className={`text-lg font-black ${eligibility.eligible ? "text-accent" : "text-red-500"}`}>
                  {eligibility.eligible ? "이용 가능" : "제한"}
                </p>
              </div>
            </div>
            <Link href="/pointshop/orders" className="text-sub hover:text-accent text-[13px] font-bold inline-flex items-center gap-1">
              내 주문
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>
      )}

      {!user && (
        <section className="border-b border-border-custom bg-white">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sub text-[13px]">로그인하면 포인트샵을 이용할 수 있어요.</p>
            <div className="flex gap-2">
              <Link href="/login" className="text-sub border border-border-custom hover:border-accent hover:text-accent font-bold text-[12px] px-4 py-2 transition-colors">로그인</Link>
              <Link href="/register" className="bg-surface hover:bg-black text-white font-black text-[12px] px-4 py-2">회원가입</Link>
            </div>
          </div>
        </section>
      )}

      <main className="w-full mx-auto px-5 md:px-10 py-8 md:py-12 flex-1 max-w-350">
        {/* Eligibility warning */}
        {user && !eligibility.eligible && (
          <div className="border-l-4 border-amber-400 bg-amber-50/50 px-5 py-4 mb-10">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
              <div className="flex-1 text-[13px]">
                <p className="text-amber-800 font-bold mb-1">아직 상품 교환은 불가합니다</p>
                <ul className="text-amber-700 space-y-0.5">
                  {eligibility.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Category tabs — 라인 밑줄 */}
        <div className="flex gap-6 md:gap-8 border-b border-border-custom mb-10 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 pb-3 -mb-px text-[14px] md:text-[15px] font-bold transition-colors relative ${category === c ? "text-surface" : "text-muted hover:text-sub"}`}>
              {c}
              {category === c && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-surface" />}
            </button>
          ))}
        </div>

        {/* Best sellers */}
        {bestSellers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-red-500 text-[11px] font-black tracking-widest uppercase mb-1">Best Sellers</p>
                <h2 className="text-surface text-2xl md:text-3xl font-black">인기 상품</h2>
              </div>
              <span className="text-muted text-[12px]">TOP 4</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {bestSellers.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Editorial split */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
          <div className="relative aspect-4/3 overflow-hidden bg-accent-light">
            <Image
              src="/images/pointshop/earn-points.png"
              alt="선물 상자에 쌓이는 포인트 코인과 포커칩"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
          <div>
            <p className="text-accent text-[11px] font-black tracking-widest uppercase mb-2">Earn More</p>
            <h2 className="text-surface text-2xl md:text-3xl font-black leading-tight mb-4">
              구인구직 등록만 해도<br/><span className="text-accent">+5,000 포인트</span>
            </h2>
            <p className="text-sub text-[14px] leading-relaxed mb-6">
              딜러 · 서빙 등 구인구직 글을 올리면 하루 1회 자동으로 5,000pt 적립됩니다.
              게시글, 댓글, 추천도 매일 포인트가 쌓여요.
            </p>
            <div className="flex gap-6 mb-6">
              <div>
                <p className="text-surface font-black text-2xl">+5,000</p>
                <p className="text-muted text-[11px] mt-0.5">구인구직 등록 (일 1회)</p>
              </div>
              <div className="w-px bg-border-custom" />
              <div>
                <p className="text-surface font-black text-2xl">+10</p>
                <p className="text-muted text-[11px] mt-0.5">게시글 작성</p>
              </div>
              <div className="w-px bg-border-custom" />
              <div>
                <p className="text-surface font-black text-2xl">+3</p>
                <p className="text-muted text-[11px] mt-0.5">댓글</p>
              </div>
            </div>
            <Link href="/jobs/write" className="inline-flex items-center gap-2 text-surface font-black text-[13px] border-b-2 border-surface pb-0.5 hover:text-accent hover:border-accent transition-colors">
              지금 등록하러 가기
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>

        {/* New arrivals */}
        {newArrivals.length > 0 && (
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-emerald-600 text-[11px] font-black tracking-widest uppercase mb-1">New Arrivals</p>
                <h2 className="text-surface text-2xl md:text-3xl font-black">신상품</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {newArrivals.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* All products */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-muted text-[11px] font-black tracking-widest uppercase mb-1">All Products</p>
              <h2 className="text-surface text-2xl md:text-3xl font-black">
                {category === "전체" ? "전체 상품" : category} <span className="text-muted text-[14px] font-semibold ml-1">({filtered.length})</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="w-4 h-4 text-muted absolute left-0 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="검색"
                  className="pl-6 pr-3 py-2 border-b border-border-custom bg-transparent text-[13px] focus:outline-none focus:border-surface min-w-40" />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} className="text-[13px] font-semibold bg-transparent border-none cursor-pointer focus:outline-none">
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-muted text-[15px]">조건에 맞는 상품이 없습니다</p>
              <p className="text-muted text-[12px] mt-1">다른 카테고리나 검색어를 시도해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filtered.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Footer info — 최소한의 구분선 */}
        <section className="border-t border-border-custom pt-10 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <p className="text-muted text-[11px] font-black tracking-widest uppercase mb-3">이용 조건</p>
              <p className="text-sub text-[14px] leading-relaxed">
                회원가입 후 <strong className="text-surface">{POINTSHOP_MIN_DAYS}일 이상 경과</strong> · 보유 포인트 <strong className="text-surface">{POINTSHOP_MIN_POINTS.toLocaleString()}점 이상</strong>
              </p>
            </div>
            <div>
              <p className="text-muted text-[11px] font-black tracking-widest uppercase mb-3">포인트 적립</p>
              <p className="text-sub text-[14px] leading-relaxed">
                구인구직 등록 <strong className="text-accent">+5,000</strong> · 게시글 <strong className="text-accent">+10</strong> · 댓글 <strong className="text-accent">+3</strong> · 추천 <strong className="text-accent">+1</strong>
              </p>
            </div>
            <div>
              <p className="text-muted text-[11px] font-black tracking-widest uppercase mb-3">배송 · 환불</p>
              <p className="text-sub text-[14px] leading-relaxed">
                주문 후 관리자 승인 → 순차 발송 (평균 3~7영업일). 승인 전 취소 시 포인트 자동 환불.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
