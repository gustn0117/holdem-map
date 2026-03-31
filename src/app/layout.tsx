import type { Metadata } from "next";
import "./globals.css";
import TopBanner from "@/components/TopBanner";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "홀덤맵코리아 - 전국 홀덤 매장 지도·정보 플랫폼",
  description:
    "전국 홀덤 매장을 지도에서 한눈에! 위치, 영업시간, 대회 정보까지 홀덤맵코리아에서 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <TopBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
