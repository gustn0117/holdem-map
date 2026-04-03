"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getBanners } from "@/lib/api";
import { Banner } from "@/types";

export default function TopBanner() {
  const pathname = usePathname();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getBanners().then(data => {
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

  return (
    <div className="sticky top-0 z-60 bg-white border-b border-border-custom">
      <div className="w-full mx-auto px-3 md:px-10 py-1.5" style={{ maxWidth: "1400px" }}>
        <div className="flex gap-2 items-stretch">
          {/* Banner area - 2/3 */}
          <div className="flex-[2] min-w-0">
            {current?.image ? (
              <div className="relative overflow-hidden rounded-lg h-full">
                {current.link ? (
                  <a href={current.link} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <img src={current.image} alt="" className="w-full h-10 md:h-14 object-cover" />
                  </a>
                ) : (
                  <img src={current.image} alt="" className="w-full h-10 md:h-14 object-cover" />
                )}
                {banners.length > 1 && (
                  <div className="absolute bottom-1 right-1.5 bg-black/40 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full">
                    {currentIdx + 1}/{banners.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="ad-pattern h-10 md:h-14 flex items-center justify-center rounded-lg">
                <p className="text-muted text-[11px]">AD</p>
              </div>
            )}
          </div>

          {/* Free tournament CTA - 1/3 */}
          <Link href="/tournament" className="flex-1 bg-[#00874a] hover:bg-[#006b3a] rounded-lg flex items-center justify-center gap-1.5 px-3 transition-all group">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="text-center">
              <p className="text-white text-[11px] md:text-[13px] font-black leading-tight">무료 토너</p>
              <p className="text-white/70 text-[8px] md:text-[10px] leading-tight">참가 신청</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
