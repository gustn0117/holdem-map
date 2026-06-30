import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { getCityList } from "@/lib/regionLookup";

export const metadata: Metadata = {
  title: "지역별 홀덤펍 찾기 — 전국 시·도별 텍사스 홀덤 매장 모음",
  description: "서울, 인천, 부산, 대구, 대전, 광주, 경기, 강원, 충청, 전라, 경상, 제주 등 전국 시·도별 홀덤펍 매장과 토너먼트, 딜러 구인구직 정보를 한눈에 확인하세요.",
  alternates: { canonical: "/region" },
};

export default function RegionIndexPage() {
  const cities = getCityList();
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <JsonLdScript data={breadcrumbSchema([
        { name: "홈", path: "/" },
        { name: "지역별 홀덤펍", path: "/region" },
      ])} />
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1200px" }}>
        <nav className="flex items-center gap-2 text-[13px] mb-6">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold">지역별 홀덤펍</span>
        </nav>
        <h1 className="text-2xl md:text-3xl font-black text-surface mb-3">지역별 홀덤펍 찾기</h1>
        <p className="text-sub text-[15px] leading-relaxed mb-8 max-w-2xl">
          전국 시·도별로 텍사스 홀덤 매장을 모아 볼 수 있습니다. 도시를 선택하면 해당 지역의
          홀덤펍 목록, 진행 중인 토너먼트, 딜러 구인구직 공고를 한 페이지에서 확인할 수 있습니다.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cities.map(city => (
            <Link key={city} href={`/region/${encodeURIComponent(city)}`}
              className="group bg-white border border-border-custom rounded-2xl p-5 hover:border-accent hover:bg-accent/5 transition-all">
              <p className="text-surface font-bold text-[16px] group-hover:text-accent">{city}</p>
              <p className="text-muted text-[12px] mt-1">{city} 홀덤펍 · 토너먼트 · 구인</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
