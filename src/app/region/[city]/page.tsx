import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLd";
import { breadcrumbSchema, localBusinessSchema, eventSchema, jobPostingSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import { getStores } from "@/lib/api";
import { isValidCity, getDistrictList, detectStoreCity } from "@/lib/regionLookup";
import type { Event, Job } from "@/types";

export const revalidate = 1800;

type Params = Promise<{ city: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: raw } = await params;
  const city = decodeURIComponent(raw);
  if (!isValidCity(city)) return { title: "지역을 찾을 수 없습니다" };
  return {
    title: `${city} 홀덤펍 · 토너먼트 · 딜러 구인구직 — ${city} 홀덤 매장 모음`,
    description: `${city} 지역의 홀덤펍, 텍사스 홀덤 매장 위치와 영업시간, 토너먼트 일정, 딜러 구인구직 공고를 한눈에 확인하세요.`,
    alternates: { canonical: `/region/${encodeURIComponent(city)}` },
    openGraph: {
      title: `${city} 홀덤펍 · 토너먼트 · 딜러 구인구직`,
      description: `${city} 지역 홀덤 매장과 토너 일정, 딜러 구인구직 정보를 한 곳에서.`,
      url: `/region/${encodeURIComponent(city)}`,
    },
  };
}

export async function generateStaticParams() {
  const { getCityList } = await import("@/lib/regionLookup");
  return getCityList().map(c => ({ city: encodeURIComponent(c) }));
}

async function fetchCityData(city: string) {
  const [allStores, eventsRes, jobsRes] = await Promise.all([
    getStores(),
    supabase.from("events").select("*").limit(1000),
    supabase.from("jobs").select("*").eq("type", "구인").limit(1000),
  ]);
  const allEvents = (eventsRes.data || []) as Event[];
  const allJobs = (jobsRes.data || []) as Job[];

  const stores = allStores.filter(s => detectStoreCity(s) === city);
  const storeIds = new Set(stores.map(s => s.id));
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const events = allEvents
    .filter(e => storeIds.has(e.store_id || ""))
    .filter(e => new Date(e.end_date || e.date).getTime() >= todayMs)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const jobs = allJobs.filter(j => (j.areas || []).some(a => a.includes(city)));
  return { stores, events, jobs };
}

export default async function CityPage({ params }: { params: Params }) {
  const { city: raw } = await params;
  const city = decodeURIComponent(raw);
  if (!isValidCity(city)) notFound();
  const { stores, events, jobs } = await fetchCityData(city);
  const districts = getDistrictList(city);

  const schemas = [
    breadcrumbSchema([
      { name: "홈", path: "/" },
      { name: "지역별 홀덤펍", path: "/region" },
      { name: city, path: `/region/${encodeURIComponent(city)}` },
    ]),
    ...stores.slice(0, 30).map(s => localBusinessSchema({
      id: s.id, name: s.name, address: s.address, region: s.region,
      phone: s.phone, hours: s.hours, image: s.images?.[0], description: s.description,
      lat: s.lat, lng: s.lng,
    })),
    ...events.slice(0, 20).map(e => eventSchema({
      id: e.id, title: e.title, store_name: e.store_name, date: e.date,
      time: e.time, end_date: e.end_date, prize: e.prize, image: e.image, description: e.description,
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
          <span className="text-surface font-semibold">{city}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-surface mb-3">{city} 홀덤펍 · 토너먼트 · 딜러 구인구직</h1>
          <p className="text-sub text-[15px] leading-relaxed max-w-3xl">
            {city} 지역의 텍사스 홀덤 매장 <strong className="text-surface">{stores.length}곳</strong>,
            진행 예정 토너먼트 <strong className="text-surface">{events.length}건</strong>,
            딜러 구인 공고 <strong className="text-surface">{jobs.length}건</strong>을 한 페이지에서 확인할 수 있습니다.
            {city}에서 가까운 홀덤펍을 찾거나, {city} 지역의 토너먼트 일정·딜러 채용 정보를 빠르게 확인해 보세요.
          </p>
        </header>

        {districts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-surface text-lg md:text-xl font-bold mb-3">{city} 시·군·구별 홀덤펍</h2>
            <div className="flex flex-wrap gap-2">
              {districts.map(d => (
                <Link key={d} href={`/region/${encodeURIComponent(city)}/${encodeURIComponent(d)}`}
                  className="inline-flex items-center bg-bg hover:bg-accent/10 hover:text-accent text-sub text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors">
                  {city} {d}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-surface text-lg md:text-xl font-bold">{city} 홀덤펍 매장 ({stores.length})</h2>
            <Link href="/map" className="text-accent text-[13px] font-semibold hover:underline">지도에서 보기 →</Link>
          </div>
          {stores.length === 0 ? (
            <p className="bg-white border border-border-custom rounded-2xl py-10 text-center text-muted text-[14px]">등록된 매장이 없습니다</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stores.slice(0, 40).map(s => (
                <Link key={s.id} href={`/store/${s.id}`}
                  className="bg-white border border-border-custom rounded-2xl p-4 hover:border-accent transition-all block">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-surface font-bold text-[15px]">{s.name}</h3>
                    <span className="shrink-0 text-[11px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">{s.region}</span>
                  </div>
                  <p className="text-muted text-[13px] truncate">{s.address}</p>
                  {s.hours && (
                    <p className="text-sub text-[12px] mt-1 inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 2"/></svg>
                      {s.hours}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {events.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-surface text-lg md:text-xl font-bold">{city} 진행 예정 토너먼트 ({events.length})</h2>
              <Link href="/tournament" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events.slice(0, 20).map(e => {
                const d = new Date(e.date);
                return (
                  <div key={e.id} className="bg-white border border-border-custom rounded-2xl p-4">
                    <h3 className="text-surface font-bold text-[15px] mb-1">{e.title}</h3>
                    <p className="text-muted text-[13px]">{e.store_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-[12px] text-sub">
                      <span>{d.getFullYear()}.{d.getMonth()+1}.{d.getDate()}</span>
                      {e.time && <span>{e.time}</span>}
                      {e.prize && <span className="ml-auto bg-[#00874a] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{e.prize}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-surface text-lg md:text-xl font-bold">{city} 홀덤 딜러 구인 ({jobs.length})</h2>
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

        <section className="bg-[#fafbfc] border border-border-custom rounded-2xl p-5 md:p-6 mb-10">
          <h2 className="text-surface text-lg md:text-xl font-bold mb-3">{city} 홀덤펍 이용 안내</h2>
          <div className="space-y-3 text-sub text-[14px] leading-relaxed">
            <p>
              {city} 지역의 홀덤펍은 텍사스 홀덤을 중심으로 한 스포츠·여가형 매장으로 운영됩니다.
              매장별로 캐시 게임, 데일리 토너먼트, 새틀라이트, 메인 이벤트 등 다양한 형태의
              게임이 진행되며, 초보자 환영 매장도 다수 있습니다.
            </p>
            <p>
              {city}에서 홀덤펍을 처음 방문하는 경우, 신분증을 지참하고 매장 영업시간을
              미리 확인해 주세요. 만 19세 이상 성인만 입장 가능하며 매장에 따라 회원제·
              드레스코드가 다를 수 있습니다.
            </p>
            <p>
              홀덤맵코리아는 {city} 외에도 전국 17개 시·도의 홀덤펍 정보를 무료로 제공합니다.
              <Link href="/region" className="text-accent underline ml-1">다른 지역 홀덤펍 보기</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
