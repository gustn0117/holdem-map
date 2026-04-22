"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Promotion {
  id: string; title: string; content: string; image: string;
  link: string; badge: string; active: boolean; sort_order: number;
  start_date: string; end_date: string; created_at: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("promotions").select("*").eq("active", true).order("pinned_rank", { ascending: false }).order("sort_order", { ascending: true })
      .then(({ data }) => { setPromotions((data || []).filter(p => p.image)); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-black text-surface">진행중인 이벤트</h1>
          <p className="text-muted text-sm mt-1">홀덤맵KOREA의 특별한 혜택과 프로모션</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <p className="text-muted text-lg">등록된 이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {promotions.map(p => (
              <Link key={p.id} href={`/promotions/${p.id}`} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all group">
                <div className="aspect-[4/1] bg-[#f5f6f8] overflow-hidden">
                  <img src={p.image} alt={p.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-5">
                  <h2 className="text-surface text-[17px] font-bold mb-1">{p.title || "제목 없음"}</h2>
                  {p.content && <p className="text-muted text-[13px] line-clamp-2">{p.content}</p>}
                  <span className="text-accent text-[12px] font-semibold mt-3 inline-block">자세히 보기 →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
