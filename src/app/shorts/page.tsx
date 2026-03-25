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
          <div className="text-center py-20 bg-white rounded-xl border border-border-custom">
            <p className="text-muted text-lg">아직 등록된 숏츠가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

  useEffect(() => {
    if (videoRef.current) {
      if (playing) videoRef.current.play();
      else { videoRef.current.pause(); videoRef.current.currentTime = 0; }
    }
  }, [playing]);

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
