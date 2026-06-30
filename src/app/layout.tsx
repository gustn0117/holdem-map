import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopBanner from "@/components/TopBanner";
import Providers from "@/components/Providers";
import AgeGate from "@/components/AgeGate";

const SITE_URL = "https://holdemmapkorea.com";
const SITE_NAME = "홀덤맵코리아";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "전국 홀덤펍 검색 · 토너먼트 · 딜러 구인구직 | 홀덤맵코리아",
    template: "%s | 홀덤맵코리아",
  },
  description:
    "전국 홀덤펍 검색, 지역별 홀덤 매장, 토너먼트 일정, 딜러 구인구직, 매장 정보까지 홀덤맵코리아에서 한 번에 확인하세요. 서울·인천·부산·대구·대전 홀덤펍 정보를 무료로 제공합니다.",
  keywords: ["홀덤", "홀덤맵", "홀덤맵코리아", "홀덤펍", "홀덤매장", "홀덤 토너먼트", "홀덤 딜러", "딜러 구인구직", "텍사스 홀덤", "포커", "서울 홀덤", "인천 홀덤", "부산 홀덤", "대구 홀덤", "강남 홀덤"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "전국 홀덤펍 검색 · 토너먼트 · 딜러 구인구직 | 홀덤맵코리아",
    description: "전국 홀덤펍 정보·토너먼트 일정·딜러 구인구직을 한 번에. 지역별 홀덤 매장 검색 무료.",
    url: SITE_URL,
    locale: "ko_KR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "홀덤맵코리아" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "전국 홀덤펍 검색 · 토너먼트 · 딜러 구인구직 | 홀덤맵코리아",
    description: "전국 홀덤펍 정보·토너먼트 일정·딜러 구인구직을 한 번에.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    // Search Console 등록 시 메타태그 값으로 채워주세요
    // google: "xxxxxxxxxxxxxxxxx",
    other: {
      // "naver-site-verification": "xxxxxxxxxxxxxxxxx",
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#03c75a",
  width: "device-width",
  initialScale: 1,
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="홀덤맵코리아" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              alternateName: ["홀덤맵KOREA", "홀덤맵", "Holdem Map Korea"],
              url: SITE_URL,
              logo: `${SITE_URL}/favicon.png`,
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              inLanguage: "ko-KR",
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full">
        <Providers>
          <AgeGate />
          <TopBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
