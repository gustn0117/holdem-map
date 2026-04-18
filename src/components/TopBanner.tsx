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
    <div className="sticky top-0 z-60 bg-white border-b border-border-custom px-3 md:px-6 py-1.5">
      <div className="mx-auto" style={{ maxWidth: "1400px" }}>
        {current?.image ? (
          <div className="relative overflow-hidden rounded-xl">
            {/* Mobile: always /banners, PC: link or detail */}
            <Link href="/banners" className="block md:hidden">
              <img src={current.image} alt="" className="w-full h-24 object-cover rounded-xl" />
            </Link>
            {current.link ? (
              <a href={current.link} target="_blank" rel="noopener noreferrer" className="hidden md:block">
                <img src={current.image} alt="" className="w-full h-64 object-cover rounded-xl" />
              </a>
            ) : (
              <Link href={`/banners/${current.id}`} className="hidden md:block">
                <img src={current.image} alt="" className="w-full h-64 object-cover rounded-xl" />
              </Link>
            )}
            {banners.length > 1 && (
              <div className="absolute bottom-1.5 right-2 bg-black/40 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                {currentIdx + 1}/{banners.length}
              </div>
            )}
          </div>
        ) : (
          <Link href="/banners" className="ad-pattern h-24 md:h-64 flex items-center justify-center rounded-xl">
            <p className="text-muted text-[12px]">광고 영역</p>
          </Link>
        )}
      </div>
    </div>
  );
}
