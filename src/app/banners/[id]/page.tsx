"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Banner {
  id: string; position: string; image: string; link: string;
  title: string; description: string; contact: string; active: boolean;
  detail_images: string[];
}

export default function BannerDetailPage() {
  const { id } = useParams();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("banners").select("*").eq("id", id).single()
      .then(({ data }) => { setBanner(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!banner) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center text-center"><div>
        <h1 className="text-2xl font-bold text-surface mb-3">배너를 찾을 수 없습니다</h1>
        <Link href="/banners" className="text-accent font-semibold">목록으로</Link>
      </div></div>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/banners" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            배너 목록
          </Link>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {banner.image && (
              <div className="bg-[#f5f6f8]">
                <img src={banner.image} alt={banner.title || ""} className="w-full h-auto object-contain max-h-96" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-black text-surface mb-4">{banner.title || "제목 없음"}</h1>

              {banner.description && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2">상세 안내</p>
                  <p className="text-sub text-[15px] leading-relaxed whitespace-pre-wrap bg-[#f9f9f9] rounded-xl p-5">{banner.description}</p>
                </div>
              )}

              {/* Detail images gallery */}
              {banner.detail_images && banner.detail_images.length > 0 && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2">상세 이미지</p>
                  <div className="space-y-3">
                    {banner.detail_images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              )}

              {banner.contact && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2">연락처</p>
                  <p className="text-surface text-[15px] font-semibold bg-[#f9f9f9] rounded-xl p-4">{banner.contact}</p>
                </div>
              )}

              {banner.link && (
                <a href={banner.link} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl text-center transition-all">
                  바로가기
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
