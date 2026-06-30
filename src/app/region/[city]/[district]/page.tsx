import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLd";
import { breadcrumbSchema, localBusinessSchema, jobPostingSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import { isValidDistrict, detectStoreCity, detectStoreDistrict } from "@/lib/regionLookup";
import type { Store, Job } from "@/types";

export const revalidate = 1800;

type Params = Promise<{ city: string; district: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: rawC, district: rawD } = await params;
  const city = decodeURIComponent(rawC);
  const district = decodeURIComponent(rawD);
  if (!isValidDistrict(city, district)) return { title: "지역을 찾을 수 없습니다" };
  return {
    title: `${city} ${district} 홀덤펍 · 텍사스 홀덤 매장 · 딜러 구인`,
    description: `${city} ${district} 지역의 홀덤펍과 텍사스 홀덤 매장 위치, 영업시간, 토너먼트, 딜러 구인구직 공고를 확인하세요.`,
    alternates: { canonical: `/region/${encodeURIComponent(city)}/${encodeURIComponent(district)}` },
  };
}

async function fetchDistrictData(city: string, district: string) {
  const [storesRes, jobsRes] = await Promise.all([
    supabase.from("stores").select("*").limit(500),
    supabase.from("jobs").select("*").eq("type", "구인").limit(200),
  ]);
  const allStores = (storesRes.data || []) as Store[];
  const allJobs = (jobsRes.data || []) as Job[];
  const stores = allStores.filter(s => detectStoreCity(s) === city && detectStoreDistrict(s, city) === district);
  const jobs = allJobs.filter(j => (j.areas || []).some(a => a.includes(district)));
  return { stores, jobs };
}

export default async function DistrictPage({ params }: { params: Params }) {
  const { city: rawC, district: rawD } = await params;
  const city = decodeURIComponent(rawC);
  const district = decodeURIComponent(rawD);
  if (!isValidDistrict(city, district)) notFound();
  const { stores, jobs } = await fetchDistrictData(city, district);

  const schemas = [
    breadcrumbSchema([
      { name: "홈", path: "/" },
      { name: "지역별 홀덤펍", path: "/region" },
      { name: city, path: `/region/${encodeURIComponent(city)}` },
      { name: district, path: `/region/${encodeURIComponent(city)}/${encodeURIComponent(district)}` },
    ]),
    ...stores.slice(0, 30).map(s => localBusinessSchema({
      id: s.id, name: s.name, address: s.address, region: s.region,
      phone: s.phone, hours: s.hours, image: s.images?.[0], description: s.description,
      lat: s.lat, lng: s.lng,
    })),
    ...jobs.slice(0, 20).map(j => jobPostingSchema({
      id: j.id, type: j.type, role: j.role, store_name: j.store_name,
      areas: j.areas, message: j.message, experience: j.experience, gender: j.gender,
      salary: j.salary, work_hours: j.work_hours, headcount: j.headcount,
      created_at: j.created_at, photo: j.photo,
    })),
  ].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <JsonLdScript data={schemas as Parameters<typeof JsonLdScript>[0]["data"]} />
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1200px" }}>
        <nav className="flex items-center gap-2 text-[13px] mb-6">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/region" className="text-muted hover:text-accent">지역</Link>
          <span className="text-border-custom">/</span>
          <Link href={`/region/${encodeURIComponent(city)}`} className="text-muted hover:text-accent">{city}</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold">{district}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-surface mb-3">{city} {district} 홀덤펍 · 홀덤 매장</h1>
          <p className="text-sub text-[15px] leading-relaxed max-w-3xl">
            {city} {district} 지역의 텍사스 홀덤 매장 <strong className="text-surface">{stores.length}곳</strong>과
            딜러 구인 공고 <strong className="text-surface">{jobs.length}건</strong>을 한 페이지에서 확인할 수 있습니다.
            {district}에서 가까운 홀덤펍을 찾고 영업시간, 매장 정보, 연락처를 한눈에 비교해 보세요.
          </p>
        </header>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-surface text-lg md:text-xl font-bold">{district} 홀덤펍 매장 ({stores.length})</h2>
            <Link href="/map" className="text-accent text-[13px] font-semibold hover:underline">지도에서 보기 →</Link>
          </div>
          {stores.length === 0 ? (
            <p className="bg-white border border-border-custom rounded-2xl py-10 text-center text-muted text-[14px]">{district}에 등록된 매장이 없습니다</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stores.map(s => (
                <Link key={s.id} href={`/store/${s.id}`}
                  className="bg-white border border-border-custom rounded-2xl p-4 hover:border-accent transition-all block">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-surface font-bold text-[15px]">{s.name}</h3>
                    <span className="shrink-0 text-[11px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">{s.region}</span>
                  </div>
                  <p className="text-muted text-[13px] truncate">{s.address}</p>
                  {s.hours && <p className="text-sub text-[12px] mt-1">⏰ {s.hours}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>

        {jobs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-surface text-lg md:text-xl font-bold">{district} 홀덤 딜러 구인 ({jobs.length})</h2>
              <Link href="/jobs" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {jobs.slice(0, 20).map(j => (
                <Link key={j.id} href={`/jobs/${j.id}`}
                  className="bg-white border border-border-custom rounded-2xl p-4 block hover:border-accent transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{j.type}</span>
                    <span className="text-[11px] text-sub">{j.role}</span>
                  </div>
                  <h3 className="text-surface font-bold text-[15px]">{j.store_name || j.role}</h3>
                  <p className="text-muted text-[12px] mt-1">{(j.areas || []).join(", ")}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-[#fafbfc] border border-border-custom rounded-2xl p-5 md:p-6">
          <h2 className="text-surface text-lg md:text-xl font-bold mb-3">{district} 홀덤펍 안내</h2>
          <p className="text-sub text-[14px] leading-relaxed mb-3">
            {city} {district} 지역의 홀덤펍은 텍사스 홀덤을 즐길 수 있는 매장들로 구성되어 있습니다.
            매장별로 영업시간, 운영 게임, 토너먼트 일정이 다를 수 있으니 방문 전 확인해 주세요.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href={`/region/${encodeURIComponent(city)}`} className="inline-flex items-center bg-bg hover:bg-accent/10 hover:text-accent text-sub text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors">
              ← {city} 전체보기
            </Link>
            <Link href="/region" className="inline-flex items-center bg-bg hover:bg-accent/10 hover:text-accent text-sub text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors">
              다른 지역 보기
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
