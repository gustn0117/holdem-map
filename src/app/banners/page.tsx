"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Banner {
  id: string; position: string; image: string; image_mobile?: string; link: string;
  title: string; description: string; contact: string; active: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("banners").select("*").eq("active", true).order("position", { ascending: true })
      .then(({ data }) => { setBanners((data || []).filter(b => b.image)); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="mb-8">
          <h1 className="text-2xl font-black text-surface">전체 배너</h1>
          <p className="text-muted text-sm mt-1">현재 진행중인 모든 광고·파트너 배너</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <p className="text-muted text-lg">등록된 배너가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {banners.map(b => (
              <Link key={b.id} href={`/banners/${b.id}`} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all group">
                {/* Mobile: 300x96 비율, Mobile 전용 이미지 우선 사용 */}
                <div className="md:hidden bg-bg overflow-hidden">
                  <img src={b.image_mobile || b.image} alt={b.title || ""} className="w-full aspect-300/96 object-contain group-hover:scale-105 transition-transform" />
                </div>
                {/* PC: 2800x260 비율, PC 이미지 사용 */}
                <div className="hidden md:block bg-bg overflow-hidden">
                  <img src={b.image} alt={b.title || ""} className="w-full aspect-2800/260 object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-5">
                  <h2 className="text-surface text-[17px] font-bold mb-1">{b.title || "제목 없음"}</h2>
                  {b.description && <p className="text-muted text-[13px] line-clamp-2">{b.description}</p>}
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
