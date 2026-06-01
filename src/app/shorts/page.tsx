"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getShorts } from "@/lib/api";
import { Short } from "@/types";

export default function ShortsPage() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    getShorts().then(data => { setShorts(data); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-surface">숏츠</h1>
            <p className="text-muted text-sm mt-1">홀덤맵의 짧은 영상을 확인하세요</p>
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
            <p className="text-[#bbb] text-center text-[12px] mt-1">업로드 시 좌·우 2개씩 노출됩니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
            {shorts.map((short) => (
              <ShortCard key={short.id} short={short} playing={playing === short.id} onPlay={() => setPlaying(playing === short.id ? null : short.id)} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ShortCard({ short, playing, onPlay }: { short: Short; playing: boolean; onPlay: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [muted, setMuted] = useState(false); // 사용자가 클릭해서 재생할 때는 소리 ON 기본

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.muted = muted;
      v.play().catch(() => { v.muted = true; setMuted(true); v.play(); });
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [playing, muted]);

  return (
    <div className="group cursor-pointer" onClick={onPlay}>
      <div className="aspect-9/16 rounded-xl overflow-hidden border border-border-custom bg-bg relative">
        <video
          ref={videoRef}
          src={short.video_url}
          poster={short.thumbnail || undefined}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
        />

        {/* Mute toggle (재생 중일 때만 노출) */}
        {playing && (
          <button onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
            className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
            aria-label={muted ? "소리 켜기" : "소리 끄기"}>
            {muted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l5-5m0 5l-5-5" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>
        )}

        {/* Play overlay */}
        {!playing && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-surface ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Playing indicator */}
        {playing && (
          <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full pulse-dot" />
            재생 중
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <h3 className="text-surface font-bold text-sm truncate">{short.title}</h3>
        {short.description && <p className="text-muted text-xs mt-0.5 truncate">{short.description}</p>}
      </div>
    </div>
  );
}
