"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { listProducts, checkEligibility, POINTSHOP_MIN_POINTS, POINTSHOP_MIN_DAYS } from "@/lib/pointshop";
import type { PointshopProduct } from "@/types";
import { getRank } from "@/lib/rank";

const CATEGORIES = ["전체", "굿즈", "기프티콘", "제휴", "이벤트", "기타"];

export default function PointshopPage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<PointshopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    listProducts().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const filtered = category === "전체" ? products : products.filter(p => p.category === category);
  const points = (profile as { points?: number } | null)?.points || 0;
  const eligibility = checkEligibility(profile as any);
  const rank = getRank(points);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1200px" }}>
        {/* Hero */}
        <div className="rounded-2xl overflow-hidden mb-6 relative">
          <div className="absolute inset-0 bg-linear-to-br from-[#00292b] via-[#004c40] to-[#00874a]" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative p-6 md:p-10 text-white">
            <span className="inline-block text-[10px] md:text-[11px] font-black text-yellow-300 bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/30 uppercase tracking-widest mb-3">POINT SHOP</span>
            <h1 className="text-2xl md:text-3xl font-black mb-2">홀덤맵 포인트샵</h1>
            <p className="text-white/85 text-[14px] md:text-[15px]">모은 포인트로 굿즈·기프티콘·제휴 상품을 교환하세요.</p>

            {user ? (
              <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3 max-w-lg">
                <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-5 py-2.5 md:py-3 border border-white/20">
                  <p className="text-white/70 text-[10px] md:text-[11px] mb-0.5">내 포인트</p>
                  <p className="text-yellow-300 text-[16px] md:text-lg font-black">{points.toLocaleString()}</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-5 py-2.5 md:py-3 border border-white/20">
                  <p className="text-white/70 text-[10px] md:text-[11px] mb-0.5">계급</p>
                  <p className="text-white text-[14px] md:text-lg font-black">{rank.name}</p>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-5 py-2.5 md:py-3 border border-white/20">
                  <p className="text-white/70 text-[10px] md:text-[11px] mb-0.5">이용 가능</p>
                  <p className={`text-[14px] md:text-lg font-black ${eligibility.eligible ? "text-emerald-300" : "text-red-300"}`}>
                    {eligibility.eligible ? "가능" : "제한"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex gap-2 flex-wrap">
                <Link href="/register" className="bg-white text-[#00292b] hover:bg-white/90 font-bold text-[13px] px-4 py-2 rounded-lg">회원가입</Link>
                <Link href="/login" className="border border-white/40 text-white hover:bg-white/10 font-bold text-[13px] px-4 py-2 rounded-lg">로그인</Link>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility banner */}
        {user && !eligibility.eligible && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
            <div className="flex-1">
              <p className="text-amber-800 font-bold text-[14px] mb-1">아직 포인트샵을 이용할 수 없습니다</p>
              <ul className="text-amber-700 text-[13px] space-y-0.5">
                {eligibility.reasons.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
              <p className="text-amber-600 text-[12px] mt-2">
                ⓘ 포인트샵 이용 조건: 회원가입 후 <strong>{POINTSHOP_MIN_DAYS}일 경과</strong> + 보유 포인트 <strong>{POINTSHOP_MIN_POINTS.toLocaleString()}점 이상</strong>
              </p>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar -mx-1 px-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${category === c ? "bg-accent text-white" : "bg-white border border-border-custom text-sub hover:border-accent hover:text-accent"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-custom py-16 text-center">
            <p className="text-muted text-[15px]">등록된 상품이 없습니다</p>
            <p className="text-muted text-[12px] mt-1">곧 새로운 상품이 준비됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => (
              <Link key={p.id} href={`/pointshop/${p.id}`}
                className="group bg-white border border-border-custom rounded-2xl overflow-hidden hover:border-accent hover:card-shadow-hover transition-all block">
                <div className="aspect-square bg-bg overflow-hidden relative">
                  {p.image || p.images?.[0] ? (
                    <img src={p.image || p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-black text-lg">품절</span>
                    </div>
                  )}
                  {p.category && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-accent bg-white/95 px-2 py-0.5 rounded-full">{p.category}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-surface font-bold text-[14px] line-clamp-2 mb-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-accent font-black text-[16px]">{p.price.toLocaleString()}</span>
                    <span className="text-muted text-[11px]">pt</span>
                  </div>
                  {p.stock !== -1 && p.stock > 0 && (
                    <p className="text-muted text-[11px] mt-1">재고 {p.stock}개</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-white border border-border-custom rounded-2xl p-6 mt-8">
          <h2 className="text-surface font-bold text-lg mb-3">포인트샵 이용 안내</h2>
          <ul className="text-sub text-[14px] space-y-2 leading-relaxed">
            <li>• 이용 조건: 회원가입 후 <strong>{POINTSHOP_MIN_DAYS}일 이상 경과</strong> + 보유 포인트 <strong>{POINTSHOP_MIN_POINTS.toLocaleString()}점 이상</strong></li>
            <li>• 게시판 글 작성 · 댓글 · 추천으로 매일 포인트를 적립할 수 있습니다.</li>
            <li>• 딜러 <strong>구인구직 등록 시 +5,000 포인트</strong> (하루 1회)</li>
            <li>• 상품 신청 후 배송 정보를 등록해 주세요. 관리자 확인 후 순차 발송됩니다.</li>
            <li>• 취소·환불 시 차감된 포인트는 자동 복원됩니다.</li>
          </ul>
          {user && (
            <Link href="/pointshop/orders" className="inline-block mt-4 text-accent font-semibold text-[13px] hover:underline">내 주문 내역 보기 →</Link>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
