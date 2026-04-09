import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import TopBanner from "@/components/TopBanner";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "홀덤맵KOREA - 전국 홀덤 매장 지도·정보 플랫폼",
  description:
    "전국 홀덤 매장을 지도에서 한눈에! 위치, 영업시간, 대회 정보까지 홀덤맵KOREA에서 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#03c75a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="홀덤맵KOREA" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full">
        <Script
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=b8559dd3c40c3c2697fbc3889bfb9dcb&autoload=false"
          strategy="beforeInteractive"
        />
        <Providers>
          <TopBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
