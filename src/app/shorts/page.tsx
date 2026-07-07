"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShortsLightbox from "@/components/ShortsLightbox";
import { getShorts } from "@/lib/api";
import { Short } from "@/types";

export default function ShortsPage() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    getShorts().then(data => { setShorts(data); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="max-w-350 mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-surface">숏츠</h1>
            <p className="text-muted text-sm mt-1">영상을 클릭하면 큰 화면으로 재생됩니다</p>
          </div>
          <span className="text-muted text-sm">{shorts.length}개</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : shorts.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map(i => (
                <div key={i} className="aspect-9/16 rounded-xl border-2 border-dashed border-border-custom bg-bg flex items-center justify-center">
                  <div className="text-center px-3">
                    <svg className="w-10 h-10 text-[#ddd] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                    <p className="text-muted text-[13px] font-medium">숏츠 업로드 예정</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted text-center text-[14px] mt-6">아직 등록된 숏츠가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {shorts.map((short, i) => (
              <button
                key={short.id}
                type="button"
                onClick={() => setLightboxIdx(i)}
                className="group text-left focus:outline-none focus:ring-2 focus:ring-accent rounded-2xl"
                aria-label={`숏츠 재생: ${short.title}`}
              >
                <div className="aspect-9/16 rounded-2xl overflow-hidden border border-border-custom bg-bg relative card-shadow group-hover:card-shadow-hover transition-shadow">
                  <video
                    src={short.video_url}
                    poster={short.thumbnail || undefined}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay={i < 3}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
                    <span className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 md:w-7 md:h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 px-0.5">
                  <h3 className="text-surface font-bold text-sm line-clamp-2">{short.title}</h3>
                  {short.description && <p className="text-muted text-xs mt-0.5 line-clamp-1">{short.description}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      {lightboxIdx !== null && (
        <ShortsLightbox
          shorts={shorts}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onIndexChange={setLightboxIdx}
        />
      )}
      <Footer />
    </div>
  );
}
