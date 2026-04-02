"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getBanners } from "@/lib/api";
import { Banner } from "@/types";

export default function TopBanner() {
  const pathname = usePathname();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getBanners().then(data => {
      // main first, then sides
      const main = data.find(b => b.position === "main");
      const sides = data.filter(b => b.position.startsWith("side") && b.image).sort((a, b) => a.position.localeCompare(b.position));
      const all: Banner[] = [];
      if (main) all.push(main);
      all.push(...sides);
      setBanners(all);
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const rotate = () => {
      setCurrentIdx(prev => {
        const next = (prev + 1) % banners.length;
        timerRef.current = setTimeout(rotate, 3000);
        return next;
      });
    };

    timerRef.current = setTimeout(rotate, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [banners]);

  if (pathname.startsWith("/admin")) return null;

  const current = banners[currentIdx];
  const hasAny = banners.some(b => b.image);

  return (
    <div className="sticky top-0 z-60 bg-white border-b border-border-custom">
      <div className="container-main py-2">
        {current?.image ? (
          <div className="relative overflow-hidden rounded-xl">
            {current.link ? (
              <a href={current.link} target="_blank" rel="noopener noreferrer">
                <img src={current.image} alt="" className="w-full h-14 md:h-18 object-cover transition-opacity duration-500" />
              </a>
            ) : (
              <img src={current.image} alt="" className="w-full h-14 md:h-18 object-cover transition-opacity duration-500" />
            )}
            {banners.length > 1 && (
              <div className="absolute bottom-1.5 right-2 bg-black/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {currentIdx + 1}/{banners.length}
              </div>
            )}
          </div>
        ) : (
          <div className="ad-pattern h-14 md:h-18 flex items-center justify-center rounded-xl">
            <p className="text-muted text-[13px]">광고 영역</p>
          </div>
        )}
      </div>
    </div>
  );
}
