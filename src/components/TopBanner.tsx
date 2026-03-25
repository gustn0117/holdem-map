"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getBanners } from "@/lib/api";
import { Banner } from "@/types";

export default function TopBanner() {
  const pathname = usePathname();
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    getBanners().then(banners => {
      const main = banners.find(b => b.position === "main");
      if (main) setBanner(main);
    });
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="bg-white border-b border-border-custom">
      <div className="container-main py-2">
        {banner?.image ? (
          banner.link ? (
            <a href={banner.link} target="_blank" rel="noopener noreferrer">
              <img src={banner.image} alt="" className="w-full h-14 md:h-18 object-cover rounded-xl" />
            </a>
          ) : (
            <img src={banner.image} alt="" className="w-full h-14 md:h-18 object-cover rounded-xl" />
          )
        ) : (
          <div className="ad-pattern h-14 md:h-18 flex items-center justify-center rounded-xl">
            <p className="text-muted text-[13px]">광고 영역</p>
          </div>
        )}
      </div>
    </div>
  );
}
