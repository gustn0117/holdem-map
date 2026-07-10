"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PointshopProductCard from "@/components/PointshopProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct, listProducts, checkEligibility, purchaseProduct, POINTSHOP_MIN_POINTS, POINTSHOP_MIN_DAYS } from "@/lib/pointshop";
import { sanitizeHtml, isHtml, plainTextToHtml } from "@/lib/sanitize";
import type { PointshopProduct } from "@/types";

type Tab = "detail" | "shipping" | "notice";

export default function PointshopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [product, setProduct] = useState<PointshopProduct | null>(null);
  const [related, setRelated] = useState<PointshopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("detail");
  const [form, setForm] = useState({ name: "", phone: "", address: "", memo: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof id !== "string") return;
    (async () => {
      const p = await getProduct(id);
      setProduct(p);
      if (p) {
        const all = await listProducts();
        setRelated(all.filter(x => x.id !== p.id && (p.category ? x.category === p.category : true)).slice(0, 4));
      }
      setLoading(false);
    })();
  }, [id]);

  const eligibility = useMemo(() => checkEligibility(profile as any), [profile]);
  const points = (profile as { points?: number } | null)?.points || 0;
  const gallery = useMemo(() => product ? [product.image, ...(product.images || [])].filter(Boolean) as string[] : [], [product]);
  const activeImg = gallery[imgIdx];

  const handleBuyClick = () => {
    if (!user) { alert("로그인이 필요합니다."); router.push("/login"); return; }
    if (!eligibility.eligible) { alert("이용 조건 미달:\n" + eligibility.reasons.join("\n")); return; }
    if (!product) return;
    const total = product.price * qty;
    if (points < total) { alert(`포인트가 부족합니다.\n필요 ${total.toLocaleString()}pt · 보유 ${points.toLocaleString()}pt`); return; }
    setBuyOpen(true);
  };

  const handleSubmit = async () => {
    if (!user || !product) return;
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("받는 분 · 연락처 · 주소를 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await purchaseProduct({
        productId: product.id, quantity: qty, userId: user.id,
        userNickname: (profile as { nickname?: string } | null)?.nickname || null,
        recipientName: form.name.trim(), recipientPhone: form.phone.trim(), recipientAddress: form.address.trim(),
        memo: form.memo.trim() || undefined,
      });
      if (refreshProfile) await refreshProfile();
      alert("신청 완료! 주문 내역에서 진행 상태를 확인할 수 있습니다.");
      router.push("/pointshop/orders");
    } catch (e) {
      alert("신청 실패: " + (e instanceof Error ? e.message : String(e)));
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-secondary">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-secondary">
      <Header />
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-surface mb-3">상품을 찾을 수 없습니다</h1>
          <Link href="/pointshop" className="text-accent font-semibold">← 포인트샵으로</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const total = product.price * qty;
  const insufficient = user && points < total;
  const isNew = product.created_at ? (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 : false;
  const isHot = (product.sort_order || 0) >= 100;
  const soldOut = product.stock === 0;

  return (
    <div className="flex flex-col min-h-screen pb-32 md:pb-0 bg-secondary">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-6 md:py-8 flex-1 max-w-350">
        <nav className="flex items-center gap-2 text-[12px] mb-5">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/pointshop" className="text-muted hover:text-accent">포인트샵</Link>
          {product.category && <>
            <span className="text-border-custom">/</span>
            <Link href={`/pointshop?category=${encodeURIComponent(product.category)}`} className="text-muted hover:text-accent">{product.category}</Link>
          </>}
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold truncate max-w-55">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-border-custom relative">
              {activeImg ? (
                <img src={activeImg} alt={product.name} className={`w-full h-full object-cover ${soldOut ? "grayscale opacity-60" : ""}`} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">이미지 없음</div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {isHot && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-red-500 px-2.5 py-1 rounded-md shadow-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>
                    HOT
                  </span>
                )}
                {isNew && <span className="text-[11px] font-black text-white bg-emerald-500 px-2.5 py-1 rounded-md shadow-md">NEW</span>}
              </div>
              {soldOut && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-widest">SOLD OUT</span>
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-accent" : "border-border-custom hover:border-muted"}`}>
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {product.category && <span className="text-[11px] font-bold text-accent bg-accent-light px-2.5 py-1 rounded-full">{product.category}</span>}
              {isNew && <span className="text-[11px] font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full">NEW</span>}
              {isHot && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>
                  HOT
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-surface leading-tight mb-4">{product.name}</h1>

            <div className="bg-white border border-border-custom rounded-2xl p-5 mb-4">
              <div className="flex items-baseline gap-2 pb-4 border-b border-border-custom">
                <span className="text-accent font-black text-3xl md:text-4xl">{product.price.toLocaleString()}</span>
                <span className="text-muted text-[14px] font-semibold">pt</span>
                <span className="text-muted text-[12px] ml-auto">개당</span>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <span className="text-sub text-[13px] font-semibold w-14 shrink-0">수량</span>
                <div className="flex items-center gap-0 border border-border-custom rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 hover:bg-bg text-lg font-bold text-sub">−</button>
                  <input type="number" min={1} max={product.stock === -1 ? 999 : product.stock} value={qty}
                    onChange={e => setQty(Math.max(1, Math.min(product.stock === -1 ? 999 : product.stock, Number(e.target.value) || 1)))}
                    className="w-14 h-9 text-center focus:outline-none font-bold" />
                  <button type="button" onClick={() => setQty(Math.min(product.stock === -1 ? 999 : product.stock, qty + 1))} className="w-9 h-9 hover:bg-bg text-lg font-bold text-sub">+</button>
                </div>
                {product.stock !== -1 && (
                  <span className={`text-[12px] ml-auto ${product.stock <= 3 ? "text-red-500 font-bold" : "text-muted"}`}>
                    재고 {product.stock}개
                  </span>
                )}
              </div>
            </div>

            {/* Total summary */}
            <div className="bg-linear-to-br from-[#0d1428] to-[#00874a] rounded-2xl p-5 mb-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-[13px]">결제 포인트</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-yellow-300 font-black text-2xl md:text-3xl">{total.toLocaleString()}</span>
                  <span className="text-white/70 text-[12px]">pt</span>
                </div>
              </div>
              {user && (
                <div className="flex items-center justify-between text-[12px] pt-2 border-t border-white/10">
                  <span className="text-white/70">보유 포인트</span>
                  <span className={insufficient ? "text-red-300 font-bold" : "text-white font-semibold"}>{points.toLocaleString()} pt</span>
                </div>
              )}
            </div>

            <button onClick={handleBuyClick} disabled={soldOut || !product.active}
              className="hidden md:block w-full bg-accent hover:bg-accent-hover text-white font-black py-4 rounded-xl text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {soldOut ? "품절" : !product.active ? "판매 중지" : `${total.toLocaleString()} pt로 신청하기`}
            </button>

            {user && !eligibility.eligible && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12px] text-amber-800">
                <p className="font-bold mb-1 inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
                  이용 조건 미달
                </p>
                <ul className="space-y-0.5">
                  {eligibility.reasons.map((r, i) => <li key={i}>• {r}</li>)}
                </ul>
              </div>
            )}
            {!user && (
              <p className="text-muted text-[12px] text-center mt-3">
                <Link href="/login" className="text-accent underline">로그인</Link> 후 신청할 수 있습니다.
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 bg-white border border-border-custom rounded-2xl overflow-hidden">
          <div className="flex border-b border-border-custom">
            {[
              { key: "detail" as Tab, label: "상품 상세" },
              { key: "shipping" as Tab, label: "배송 정보" },
              { key: "notice" as Tab, label: "이용 안내" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-4 text-[14px] font-bold transition-colors ${tab === t.key ? "text-accent border-b-2 border-accent" : "text-muted hover:text-sub"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-6 md:p-8">
            {tab === "detail" && (
              product.description ? (
                <div className="rich-html text-sub text-[14px] md:text-[15px]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(isHtml(product.description) ? product.description : plainTextToHtml(product.description)) }} />
              ) : <p className="text-muted text-[14px] text-center py-10">등록된 상세 설명이 없습니다.</p>
            )}
            {tab === "shipping" && (
              <div className="space-y-4 text-sub text-[14px] leading-relaxed">
                <div className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <p className="text-surface font-bold mb-1">신청 접수</p>
                    <p className="text-muted text-[13px]">받는 분 · 연락처 · 주소 입력 후 신청하시면 포인트가 즉시 차감되고 주문이 접수됩니다.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <p className="text-surface font-bold mb-1">관리자 확인 (1~2 영업일)</p>
                    <p className="text-muted text-[13px]">관리자가 주문을 확인하고 준비 상태를 업데이트합니다.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <p className="text-surface font-bold mb-1">발송 (평균 3~7 영업일)</p>
                    <p className="text-muted text-[13px]">택배 · 기프티콘 · 코드 등 상품별 방식에 따라 발송됩니다. 발송 완료 시 송장 번호가 주문 내역에 표시됩니다.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <p className="text-surface font-bold mb-1">수령 완료</p>
                    <p className="text-muted text-[13px]">상품을 수령하시면 주문 상태가 <strong className="text-emerald-600">수령 완료</strong> 로 변경됩니다.</p>
                  </div>
                </div>
              </div>
            )}
            {tab === "notice" && (
              <ul className="space-y-2.5 text-sub text-[14px] leading-relaxed">
                <li>• 이용 조건: 회원가입 후 <strong className="text-surface">{POINTSHOP_MIN_DAYS}일 경과</strong> + 보유 포인트 <strong className="text-surface">{POINTSHOP_MIN_POINTS.toLocaleString()}점 이상</strong></li>
                <li>• 관리자 승인 <strong className="text-surface">전</strong>에는 <Link href="/pointshop/orders" className="text-accent underline">주문 내역</Link>에서 자동 취소가 가능합니다.</li>
                <li>• 승인 이후 취소는 관리자에게 문의해 주세요. 관리자 판단하에 포인트가 환불됩니다.</li>
                <li>• 오배송·파손 등은 수령 후 3일 이내 문의 시 재발송 처리해 드립니다.</li>
                <li>• 부정 활동(다중 계정, 포인트 어뷰징 등)이 확인되면 포인트 회수 및 서비스 이용 제한 조치가 이루어질 수 있습니다.</li>
              </ul>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-surface text-[18px] md:text-xl font-black mb-4">함께 보면 좋은 상품</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {related.map(p => <PointshopProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-border-custom p-3">
        <button onClick={handleBuyClick} disabled={soldOut || !product.active}
          className="w-full bg-accent hover:bg-accent-hover text-white font-black py-3.5 rounded-xl text-[14px] transition-all disabled:opacity-40">
          {soldOut ? "품절" : !product.active ? "판매 중지" : `${total.toLocaleString()} pt · 신청하기`}
        </button>
      </div>

      {/* Purchase modal */}
      {buyOpen && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !submitting && setBuyOpen(false)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-5 pb-5 border-b border-border-custom">
              {(product.image || product.images?.[0]) && (
                <img src={product.image || product.images?.[0]} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-surface font-black text-[15px] line-clamp-2">{product.name}</h2>
                <p className="text-muted text-[12px] mt-0.5">{product.price.toLocaleString()}pt × {qty}개</p>
                <p className="text-accent font-black text-[16px] mt-1">= {total.toLocaleString()} pt</p>
              </div>
            </div>
            <h3 className="text-surface font-bold text-[14px] mb-3">배송 정보 입력</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">받는 분 <span className="text-red-500">*</span></label>
                <input className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="홍길동" />
              </div>
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">연락처 <span className="text-red-500">*</span></label>
                <input className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent" placeholder="010-0000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">주소 <span className="text-red-500">*</span></label>
                <input className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent" placeholder="도로명 주소 + 상세 주소" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">요청사항 <span className="text-muted font-normal">(선택)</span></label>
                <textarea rows={2} className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent resize-none" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} placeholder="배송 시 요청사항을 입력해 주세요" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBuyOpen(false)} disabled={submitting} className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-bg">취소</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">
                {submitting ? "신청 중..." : `${total.toLocaleString()}pt 결제`}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
