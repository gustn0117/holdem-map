"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LinkifyText from "@/components/LinkifyText";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface TradeItem {
  id: string; user_id: string | null; nickname: string; title: string; category: string;
  price: string; condition: string; description: string; images: string[];
  region: string; status: string; views: number; contact: string; created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  "판매중": "bg-emerald-100 text-emerald-700",
  "예약중": "bg-yellow-100 text-yellow-700",
  "판매완료": "bg-gray-200 text-gray-500",
};

export default function TradeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState<TradeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("trade_items").select("*").eq("id", id).single();
      setItem(data); setLoading(false);
      if (data) {
        // 조회수 +1
        await supabase.from("trade_items").update({ views: (data.views || 0) + 1 }).eq("id", id);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lightbox]);

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!item) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center text-center"><div>
        <h1 className="text-2xl font-bold text-surface mb-3">상품을 찾을 수 없습니다</h1>
        <Link href="/trade" className="text-accent font-semibold">목록으로</Link>
      </div></div>
      <Footer />
    </div>
  );

  const phoneMatch = item.contact?.match(/01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/);
  const isOwner = user?.id === item.user_id;

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/trade" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              중고거래 목록
            </Link>
            {isOwner && (
              <Link href={`/trade/${item.id}/edit`}
                className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold px-4 py-2 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                수정
              </Link>
            )}
          </div>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-6">
            {/* Images */}
            {item.images && item.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 bg-[#f5f6f8]">
                {item.images.map((img, i) => (
                  <button key={i} onClick={() => setLightbox(img)}
                    className={`aspect-square overflow-hidden ${i === 0 ? "col-span-2 md:col-span-2 md:row-span-2 aspect-auto" : ""} cursor-zoom-in`}>
                    <img src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-500"}`}>{item.status}</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-bg text-sub">{item.category}</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-bg text-sub">{item.condition}</span>
                <span className="text-muted text-[12px] ml-auto">조회 {item.views || 0} · {item.created_at?.slice(0, 10)}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-surface mb-3 leading-tight">{item.title}</h1>
              <p className="text-accent text-2xl font-black mb-5">{item.price}</p>

              <div className="flex items-center gap-3 text-sub text-[14px] mb-6">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center">
                  {item.nickname?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-surface text-[13px] font-semibold">{item.nickname}</p>
                  {item.region && <p className="text-muted text-[12px] inline-flex items-center gap-1"><svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{item.region}</p>}
                </div>
              </div>

              {item.description && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2 font-semibold">상품 설명</p>
                  <div className="bg-[#f9f9f9] rounded-xl p-5">
                    <LinkifyText text={item.description} className="text-sub text-[15px] leading-relaxed block" />
                  </div>
                </div>
              )}

              {item.contact && (
                <button onClick={() => setContactOpen(true)}
                  className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-[15px]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  판매자에게 문의하기
                </button>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-[13px] text-yellow-800 flex gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
            <span>중고거래 유의사항: 홀덤맵KOREA는 상품 중개·정산에 관여하지 않습니다. 직거래 시 안전한 장소에서 물품을 확인한 후 거래하세요. 사기 의심 시 즉시 관리자에게 신고해주세요.</span>
          </div>
        </div>
      </main>
      <Footer />

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {contactOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center" onClick={() => setContactOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="md:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-border-custom" />
            </div>
            <div className="px-6 pt-4 md:pt-6 pb-5">
              <h3 className="text-surface text-lg font-black mb-2">판매자 연락처</h3>
              <p className="text-muted text-[13px] mb-4">직거래 시 반드시 안전한 장소에서 물품을 확인 후 결제하세요.</p>
              <div className="bg-[#f9f9f9] rounded-xl p-4 mb-4">
                <LinkifyText text={item.contact} className="text-surface text-[15px] font-semibold break-all block" />
              </div>
              <div className="flex gap-2">
                {phoneMatch && (
                  <a href={`tel:${phoneMatch[0].replace(/[\s.]/g, "")}`}
                    className="flex-1 bg-accent hover:bg-accent-hover text-white text-center font-bold py-3 rounded-xl transition-all inline-flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    전화걸기
                  </a>
                )}
                <button onClick={async () => {
                  try { await navigator.clipboard.writeText(item.contact); alert("연락처가 복사되었습니다."); } catch {}
                  setContactOpen(false);
                }}
                  className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all">
                  복사하기
                </button>
              </div>
              <button onClick={() => setContactOpen(false)} className="w-full text-muted text-[13px] mt-3 py-2">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
