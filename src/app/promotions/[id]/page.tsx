"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Promotion {
  id: string; title: string; content: string; image: string;
  link: string; badge: string; active: boolean;
  start_date: string; end_date: string;
}

const BADGE_COLORS: Record<string, string> = {
  "HOT": "bg-red-500 text-white",
  "NEW": "bg-accent text-white",
  "EVENT": "bg-blue-500 text-white",
  "SALE": "bg-amber-500 text-white",
};

export default function PromotionDetailPage() {
  const { id } = useParams();
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("promotions").select("*").eq("id", id).single()
      .then(({ data }) => { setPromo(data); setLoading(false); });
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

  if (!promo) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center text-center"><div>
        <h1 className="text-2xl font-bold text-surface mb-3">이벤트를 찾을 수 없습니다</h1>
        <Link href="/promotions" className="text-accent font-semibold">목록으로</Link>
      </div></div>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/promotions" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            이벤트 목록
          </Link>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {promo.image && (
              <div className="cursor-zoom-in" onClick={() => setLightbox(promo.image)}>
                <img src={promo.image} alt={promo.title || ""} className="w-full h-auto block" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                {promo.badge && (
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${BADGE_COLORS[promo.badge] || "bg-gray-500 text-white"}`}>{promo.badge}</span>
                )}
                {promo.start_date && promo.end_date && (
                  <span className="text-[12px] text-muted">{promo.start_date} ~ {promo.end_date}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-surface mb-4">{promo.title || "제목 없음"}</h1>

              {promo.content && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2">상세 안내</p>
                  <p className="text-sub text-[15px] leading-relaxed whitespace-pre-wrap bg-[#f9f9f9] rounded-xl p-5">{promo.content}</p>
                </div>
              )}

              {promo.link && (
                <a href={promo.link} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl text-center transition-all">
                  바로가기
                </a>
              )}
            </div>
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
    </div>
  );
}
