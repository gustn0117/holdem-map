"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct, checkEligibility, purchaseProduct, POINTSHOP_MIN_POINTS, POINTSHOP_MIN_DAYS } from "@/lib/pointshop";
import { sanitizeHtml, isHtml, plainTextToHtml } from "@/lib/sanitize";
import type { PointshopProduct } from "@/types";

export default function PointshopDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [product, setProduct] = useState<PointshopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", memo: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof id !== "string") return;
    getProduct(id).then(p => { setProduct(p); setLoading(false); });
  }, [id]);

  const eligibility = checkEligibility(profile as any);
  const points = (profile as { points?: number } | null)?.points || 0;
  const gallery = product ? [product.image, ...(product.images || [])].filter(Boolean) as string[] : [];
  const activeImg = gallery[imgIdx];

  const handleBuyClick = () => {
    if (!user) { alert("로그인이 필요합니다."); router.push("/login"); return; }
    if (!eligibility.eligible) { alert("이용 조건 미달:\n" + eligibility.reasons.join("\n")); return; }
    if (!product) return;
    const total = product.price * qty;
    if (points < total) { alert(`포인트가 부족합니다. (필요 ${total.toLocaleString()}pt · 보유 ${points.toLocaleString()}pt)`); return; }
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
        productId: product.id,
        quantity: qty,
        userId: user.id,
        userNickname: (profile as { nickname?: string } | null)?.nickname || null,
        recipientName: form.name.trim(),
        recipientPhone: form.phone.trim(),
        recipientAddress: form.address.trim(),
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
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
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

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1200px" }}>
        <nav className="flex items-center gap-2 text-[13px] mb-6">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/pointshop" className="text-muted hover:text-accent">포인트샵</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold truncate max-w-[240px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-bg rounded-2xl overflow-hidden border border-border-custom">
              {activeImg ? (
                <img src={activeImg} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">이미지 없음</div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? "border-accent" : "border-border-custom"}`}>
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <span className="inline-block text-[11px] font-bold text-accent bg-accent-light px-2.5 py-1 rounded-full mb-3">{product.category}</span>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-surface mb-3">{product.name}</h1>
            <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-border-custom">
              <span className="text-accent font-black text-3xl">{product.price.toLocaleString()}</span>
              <span className="text-muted text-[14px]">pt / 개</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sub text-[14px] font-semibold">수량</span>
              <div className="flex items-center gap-1 border border-border-custom rounded-lg overflow-hidden">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 hover:bg-bg text-lg">−</button>
                <input type="number" min={1} max={product.stock === -1 ? 999 : product.stock} value={qty} onChange={e => setQty(Math.max(1, Math.min(product.stock === -1 ? 999 : product.stock, Number(e.target.value) || 1)))} className="w-14 h-9 text-center focus:outline-none" />
                <button type="button" onClick={() => setQty(Math.min(product.stock === -1 ? 999 : product.stock, qty + 1))} className="w-9 h-9 hover:bg-bg text-lg">+</button>
              </div>
              {product.stock !== -1 && <span className="text-muted text-[12px]">재고 {product.stock}개</span>}
            </div>

            {/* Total */}
            <div className="bg-bg rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sub text-[13px]">결제 포인트</span>
                <span className="text-accent font-black text-xl">{total.toLocaleString()} pt</span>
              </div>
              {user && (
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">보유 포인트</span>
                  <span className={insufficient ? "text-red-500 font-bold" : "text-sub font-semibold"}>{points.toLocaleString()} pt</span>
                </div>
              )}
            </div>

            <button onClick={handleBuyClick} disabled={product.stock === 0 || !product.active}
              className="w-full bg-accent hover:bg-accent-hover text-white font-black py-4 rounded-xl text-[15px] transition-all disabled:opacity-40">
              {product.stock === 0 ? "품절" : !product.active ? "판매 중지" : "포인트로 신청하기"}
            </button>

            {user && !eligibility.eligible && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12px] text-amber-800">
                <p className="font-bold mb-1">이용 조건 미달</p>
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

        {/* Description */}
        {product.description && (
          <section className="mt-10 bg-white border border-border-custom rounded-2xl p-6 md:p-8">
            <h2 className="text-surface font-bold text-lg mb-4">상품 상세</h2>
            <div className="rich-html text-sub text-[14px] md:text-[15px]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(isHtml(product.description) ? product.description : plainTextToHtml(product.description)) }} />
          </section>
        )}

        {/* Info */}
        <section className="mt-6 bg-white border border-border-custom rounded-2xl p-6 text-[13px] text-muted leading-relaxed">
          <p>• 상품 신청 후 취소는 관리자 승인 전에만 자동 처리됩니다. 승인 이후에는 관리자 문의 바랍니다.</p>
          <p>• 배송/기프티콘 발송은 관리자 확인 후 순차 진행됩니다 (평균 3~7영업일).</p>
          <p>• 최소 이용 조건: 회원가입 {POINTSHOP_MIN_DAYS}일 경과 + 보유 포인트 {POINTSHOP_MIN_POINTS.toLocaleString()}pt 이상</p>
        </section>
      </main>

      {/* Purchase modal */}
      {buyOpen && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !submitting && setBuyOpen(false)}>
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-surface font-black text-xl mb-1">배송 정보</h2>
            <p className="text-muted text-[13px] mb-5">{product.name} × {qty} · {total.toLocaleString()}pt</p>
            <div className="space-y-3">
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">받는 분 *</label>
                <input className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">연락처 *</label>
                <input className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent" placeholder="010-0000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">주소 *</label>
                <input className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent" placeholder="도로명 주소 + 상세 주소" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-sub text-[13px] font-semibold block mb-1">요청사항 (선택)</label>
                <textarea rows={2} className="w-full border border-border-custom rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-accent resize-none" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBuyOpen(false)} disabled={submitting} className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-bg">취소</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">
                {submitting ? "신청 중..." : `${total.toLocaleString()} pt 신청`}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
