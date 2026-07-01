"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Short } from "@/types";

type Props = {
  shorts: Short[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export default function ShortsLightbox({ shorts, index, onClose, onIndexChange }: Props) {
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const current = shorts[index];

  const prev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const next = useCallback(() => {
    if (index < shorts.length - 1) onIndexChange(index + 1);
  }, [index, shorts.length, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      else if (e.key === "ArrowUp") prev();
      else if (e.key === " ") {
        e.preventDefault();
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) v.play().catch(() => undefined); else v.pause();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => undefined);
  }, [index]);

  if (!current) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) next(); else prev();
    } else if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
    >
      {/* Close */}
      <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="닫기"
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 bg-white/10 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
        {index + 1} / {shorts.length}
      </div>

      {/* Prev / Next (PC) */}
      {index > 0 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="이전"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      {index < shorts.length - 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="다음"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}

      {/* Video stage */}
      <div
        className="relative h-[90vh] max-h-[900px] aspect-9/16 max-w-[95vw] mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          key={current.id}
          src={current.video_url}
          poster={current.thumbnail || undefined}
          className="w-full h-full object-cover"
          autoPlay
          loop
          playsInline
          muted={muted}
          controls={false}
        />

        {/* Bottom overlay: title/description + sound toggle */}
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-linear-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-end gap-3">
            <div className="flex-1 min-w-0 text-white">
              <p className="font-bold text-[15px] md:text-[16px] line-clamp-2">{current.title}</p>
              {current.description && (
                <p className="text-white/80 text-[12px] md:text-[13px] mt-1 line-clamp-2">{current.description}</p>
              )}
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
              aria-label={muted ? "소리 켜기" : "음소거"}
              className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors">
              {muted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile hint */}
      <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60 text-[11px]">← 스와이프로 이동 →</div>
    </div>
  );
}
