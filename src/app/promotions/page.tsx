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
        {/* Hero */}
        <div className="bg-linear-to-r from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <span className="text-[11px] font-black text-yellow-300 bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/20 uppercase tracking-widest">EVENT</span>
            <h1 className="text-3xl md:text-4xl font-black text-white mt-3 mb-2">진행중인 이벤트</h1>
            <p className="text-white/60 text-[15px]">홀덤맵KOREA의 특별한 혜택을 확인하세요</p>
          </div>
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
          <div className="space-y-5">
            {promotions.map(promo => (
              <div key={promo.id} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  {promo.image ? (
                    <div className="md:w-80 h-48 md:h-auto bg-[#f5f6f8] overflow-hidden shrink-0">
                      <img src={promo.image} alt={promo.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="md:w-80 h-40 md:h-auto bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
                      <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {promo.badge && (
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${BADGE_COLORS[promo.badge] || "bg-gray-500 text-white"}`}>{promo.badge}</span>
                        )}
                        {promo.start_date && promo.end_date && (
                          <span className="text-[12px] text-muted">{promo.start_date} ~ {promo.end_date}</span>
                        )}
                      </div>
                      <h2 className="text-surface text-xl md:text-2xl font-black mb-3">{promo.title}</h2>
                      <p className="text-sub text-[15px] leading-relaxed whitespace-pre-wrap">{promo.content}</p>
                    </div>
                    {promo.link && (
                      <div className="mt-5">
                        <a href={promo.link} target="_blank" rel="noopener noreferrer"
                          className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-bold px-6 py-3 rounded-xl transition-all">
                          자세히 보기 →
                        </a>
                      </div>
                    )}
                  </div>
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
