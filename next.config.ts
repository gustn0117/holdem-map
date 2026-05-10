import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // HTML 페이지는 CDN/브라우저 캐시 비활성화 — 배포 즉시 반영되도록
        // _next 정적 자산과 이미지/미디어는 별도 매칭으로 제외 (그쪽은 hash 기반이라 안전하게 캐시 가능)
        source: "/:path((?!_next/|favicon|icon|logo|posters/|avatars/|banners/|tournament-banner|event-banner).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
