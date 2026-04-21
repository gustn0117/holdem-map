"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LinkifyText from "@/components/LinkifyText";
import { supabase } from "@/lib/supabase";

interface BannerLink { label: string; url: string; }
interface Banner {
  id: string; position: string; image: string; link: string;
  title: string; description: string; contact: string; active: boolean;
  detail_images: string[];
  links: BannerLink[];
}

export default function BannerDetailPage() {
  const { id } = useParams();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("banners").select("*").eq("id", id).single()
      .then(({ data }) => { setBanner(data); setLoading(false); });
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
            {/* 이미지 영역 (상단) */}
            {banner.image && (
              <div className="cursor-zoom-in" onClick={() => setLightbox(banner.image)}>
                <img src={banner.image} alt={banner.title || ""} className="w-full h-auto block" />
              </div>
            )}
            {banner.detail_images && banner.detail_images.length > 0 && (
              <div className="p-4 md:p-6 border-b border-border-custom">
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {banner.detail_images.map((img, i) => (
                    <img key={i} src={img} alt="" onClick={() => setLightbox(img)}
                      className="w-full aspect-square object-cover rounded-xl cursor-zoom-in hover:opacity-90 transition-opacity" />
                  ))}
                </div>
              </div>
            )}

            {/* 텍스트 영역 (하단) */}
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-black text-surface mb-4">{banner.title || "제목 없음"}</h1>

              {banner.description && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2">상세 안내</p>
                  <div className="bg-[#f9f9f9] rounded-xl p-5">
                    <LinkifyText text={banner.description} className="text-sub text-[15px] leading-relaxed block" />
                  </div>
                </div>
              )}

              {banner.contact && (
                <div className="mb-6">
                  <p className="text-[13px] text-muted mb-2">연락처</p>
                  <p className="text-surface text-[15px] font-semibold bg-[#f9f9f9] rounded-xl p-4">{banner.contact}</p>
                </div>
              )}

              {banner.links && banner.links.length > 0 && (
                <div className="space-y-2 mb-3">
                  {banner.links.filter(l => l.url && l.label).map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-white border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold py-3 rounded-xl text-center transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      {l.label}
                    </a>
                  ))}
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
