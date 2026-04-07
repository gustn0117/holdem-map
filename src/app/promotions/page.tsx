"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Promotion {
  id: string; title: string; content: string; image: string;
  link: string; badge: string; active: boolean; sort_order: number;
  start_date: string; end_date: string; created_at: string;
}

const BADGE_COLORS: Record<string, string> = {
  "HOT": "bg-red-500 text-white",
  "NEW": "bg-accent text-white",
  "EVENT": "bg-blue-500 text-white",
  "SALE": "bg-amber-500 text-white",
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("promotions").select("*").eq("active", true).order("sort_order", { ascending: true })
      .then(({ data }) => { setPromotions(data || []); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-black text-surface">이벤트</h1>
          <p className="text-muted text-sm mt-1">홀덤맵KOREA의 특별한 혜택을 확인하세요</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <svg className="w-16 h-16 text-[#eee] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <p className="text-muted text-lg">진행중인 이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
                {promo.image && (
                  <div className="h-48 bg-[#f5f6f8] overflow-hidden">
                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {promo.badge && (
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${BADGE_COLORS[promo.badge] || "bg-gray-500 text-white"}`}>{promo.badge}</span>
                    )}
                    {promo.end_date && (
                      <span className="text-[11px] text-muted">~ {promo.end_date}</span>
                    )}
                  </div>
                  <h2 className="text-surface text-[18px] font-black mb-2">{promo.title}</h2>
                  <p className="text-sub text-[14px] leading-relaxed whitespace-pre-wrap">{promo.content}</p>
                  {promo.link && (
                    <a href={promo.link} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-4 bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all">
                      자세히 보기
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
