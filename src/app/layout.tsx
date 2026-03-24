import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "홀덤맵 - 전국 홀덤 매장 지도·정보 플랫폼",
  description:
    "전국 홀덤 매장을 지도에서 한눈에! 위치, 영업시간, 대회 정보까지 홀덤맵에서 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
