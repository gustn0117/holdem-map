"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { Store } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const regions = ["전체", "서울", "경기", "인천"];

const quickCategories = [
  { label: "토너먼트", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", tag: "토너먼트", color: "from-accent/20 to-accent/5 text-accent" },
  { label: "초보환영", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", tag: "초보환영", color: "from-green/20 to-green/5 text-green" },
  { label: "프리미엄", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", tag: "프리미엄", color: "from-gold/20 to-gold/5 text-gold" },
  { label: "주차가능", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", tag: "주차가능", color: "from-blue-400/20 to-blue-400/5 text-blue-400" },
  { label: "야간운영", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z", tag: "야간운영", color: "from-purple-400/20 to-purple-400/5 text-purple-400" },
];

const howItWorks = [
  { step: "01", title: "지역 검색", desc: "원하는 지역이나 매장명을 검색하세요", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { step: "02", title: "매장 비교", desc: "영업시간, 위치, 태그를 비교하세요", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { step: "03", title: "방문하기", desc: "지도에서 위치를 확인하고 방문하세요", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { stores } = useStores();
  const { events } = useEvents();
  const { notices } = useNotices();

  const filteredStores =
    selectedRegion === "전체"
      ? stores
      : stores.filter((s) => s.region === selectedRegion);

  const recommendedStores = stores.filter((s) => s.is_recommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-accent/[0.06] rounded-full blur-[120px]" />
          <div className="absolute top-32 left-1/4 w-40 h-40 bg-accent-light/[0.03] rounded-full blur-[80px]" />
          <div className="absolute top-20 right-1/4 w-32 h-32 bg-gold/[0.02] rounded-full blur-[60px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-dark)_70%)]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 pt-16 md:pt-24 pb-14 text-center">
          <div className="inline-flex items-center gap-2.5 glass border border-white/[0.06] rounded-full px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
            <span className="text-white/50 text-xs">서울 · 경기 · 인천</span>
            <span className="w-px h-3 bg-white/10" />
            <span className="text-accent-light/80 text-xs font-semibold">12곳 서비스 중</span>
          </div>

          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
            홀덤 매장,<br />
            <span className="bg-linear-to-r from-accent-light via-accent to-accent-light bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">지도에서 한눈에</span>
          </h1>
          <p className="text-muted/70 text-sm md:text-base mb-10 max-w-sm mx-auto leading-relaxed">
            매장 위치, 영업시간, 대회 일정까지<br />필요한 정보를 한 곳에서
          </p>

          <div className="max-w-lg mx-auto mb-6">
            <SearchBar large />
          </div>

          <div className="flex justify-center items-center gap-1.5 flex-wrap">
            <span className="text-muted/30 text-[11px] mr-1">인기</span>
            {["강남", "홍대", "수원", "일산", "잠실"].map((k) => (
              <Link key={k} href={`/map?q=${k}`} className="text-muted/40 hover:text-white text-xs glass border border-white/[0.04] hover:border-accent/25 rounded-full px-3.5 py-1.5 transition-all">
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="max-w-5xl mx-auto px-4 mb-14 w-full">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {quickCategories.map((cat) => (
            <Link
              key={cat.label}
              href={`/map?q=${cat.tag}`}
              className="flex flex-col items-center gap-2 min-w-[90px] group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${cat.color} flex items-center justify-center border border-white/[0.04] group-hover:scale-105 transition-transform`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                </svg>
              </div>
              <span className="text-muted/60 text-[11px] font-medium group-hover:text-surface transition-colors">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}

      {/* How it Works */}
      <section className="max-w-5xl mx-auto px-4 mb-16 w-full">
        <div className="text-center mb-8">
          <p className="text-accent/60 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">HOW IT WORKS</p>
          <h2 className="text-xl font-bold text-white">이렇게 이용하세요</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {howItWorks.map((item, i) => (
            <div key={item.step} className="relative bg-card rounded-2xl p-6 border border-white/[0.04] text-center group hover:border-accent/20 transition-all glow-border">
              <div className="absolute top-4 left-4 text-accent/10 text-5xl font-black">{item.step}</div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{item.title}</h3>
                <p className="text-muted/50 text-xs leading-relaxed">{item.desc}</p>
              </div>
              {i < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 text-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-accent/50 text-[11px] font-semibold uppercase tracking-[0.2em] mb-1">EXPLORE MAP</p>
            <h2 className="text-xl font-bold text-white">매장 지도</h2>
          </div>
          <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRegion === r
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "text-muted/50 hover:text-surface"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-100 lg:h-130">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2 lg:h-130 lg:overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-muted/40 text-xs">
                <span className="text-accent-light font-bold text-base mr-1">{filteredStores.length}</span>곳
              </p>
              <Link href="/map" className="text-[11px] text-muted/30 hover:text-accent flex items-center gap-0.5 transition-colors">
                전체보기
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`rounded-2xl transition-all cursor-pointer ${
                  selectedStore?.id === store.id ? "ring-1 ring-accent/40 ring-offset-1 ring-offset-dark" : ""
                }`}
              >
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings + Events + Info 3-column */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Ranking */}
          <div className="bg-card rounded-2xl border border-white/[0.04] overflow-hidden glow-border">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">추천 매장 TOP 3</h3>
                  <p className="text-muted/30 text-[10px]">에디터 추천</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {recommendedStores.map((store, i) => (
                <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    i === 0 ? "bg-gold/15 text-gold" : i === 1 ? "bg-white/5 text-white/40" : "bg-white/3 text-white/25"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-sm font-semibold truncate group-hover:text-white transition-colors">{store.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-muted/30 text-[11px]">{store.region}</span>
                      <span className="w-px h-2.5 bg-white/[0.04]" />
                      <span className="text-muted/30 text-[11px]">{store.hours}</span>
                    </div>
                  </div>
                  <svg className="w-3.5 h-3.5 text-white/[0.06] group-hover:text-gold shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-card rounded-2xl border border-white/[0.04] overflow-hidden glow-border">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">다가오는 대회</h3>
                  <p className="text-muted/30 text-[10px]">이번 주 토너먼트</p>
                </div>
              </div>
              <Link href="/events" className="text-[10px] text-accent/50 hover:text-accent transition-colors font-medium">전체보기</Link>
            </div>
            <div className="p-4 space-y-2">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <div key={event.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                    <div className="w-12 shrink-0 text-center">
                      <p className="text-accent-light text-lg font-bold leading-none">{d.getDate()}</p>
                      <p className="text-muted/25 text-[10px] mt-0.5">{d.getMonth() + 1}월</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface text-sm font-semibold truncate">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted/35">
                        <span>{event.store_name}</span>
                        <span>·</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                    {event.prize && (
                      <span className="bg-gold/8 text-gold text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 self-start border border-gold/8">{event.prize}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notices + CTA */}
          <div className="flex flex-col gap-5">
            <div className="bg-card rounded-2xl border border-white/[0.04] overflow-hidden glow-border">
              <div className="flex items-center gap-2.5 p-5 border-b border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-sm">공지사항</h3>
              </div>
              <div className="p-4">
                {notices.map((notice) => (
                  <div key={notice.id} className="flex items-center gap-3 py-2.5 px-1 group cursor-pointer">
                    <span className="w-1 h-1 rounded-full bg-accent/30 shrink-0" />
                    <p className="text-muted/60 text-sm truncate flex-1 group-hover:text-surface transition-colors">{notice.title}</p>
                    <span className="text-muted/20 text-[10px] shrink-0">{notice.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="relative bg-card rounded-2xl p-6 border border-white/[0.04] overflow-hidden flex-1">
              <div className="absolute inset-0 bg-linear-to-br from-accent/[0.04] via-transparent to-gold/[0.02]" />
              <div className="absolute top-0 right-0 w-28 h-28 bg-accent/[0.06] rounded-full blur-[50px] translate-x-6 -translate-y-6" />
              <div className="relative flex flex-col h-full justify-between">
                <div>
                  <p className="text-accent/50 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">FOR OWNERS</p>
                  <h3 className="text-white font-bold text-base mb-1">매장을 등록하세요</h3>
                  <p className="text-muted/40 text-xs leading-relaxed">전국 홀덤 유저에게<br />매장을 홍보할 수 있습니다</p>
                </div>
                <button className="bg-linear-to-r from-accent to-accent-light text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all mt-5 self-start">
                  등록 문의
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Quick Access */}
      <section className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <div className="text-center mb-8">
          <p className="text-accent/50 text-[11px] font-semibold uppercase tracking-[0.2em] mb-2">REGIONS</p>
          <h2 className="text-xl font-bold text-white">지역별 매장</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { region: "서울", count: stores.filter(s => s.region === "서울").length, desc: "강남, 홍대, 잠실 등", color: "from-accent/15 to-accent/5" },
            { region: "경기", count: stores.filter(s => s.region === "경기").length, desc: "판교, 수원, 일산 등", color: "from-green/15 to-green/5" },
            { region: "인천", count: stores.filter(s => s.region === "인천").length, desc: "부평, 송도 등", color: "from-gold/15 to-gold/5" },
          ].map((r) => (
            <Link key={r.region} href={`/map?q=${r.region}`} className="group">
              <div className={`bg-linear-to-br ${r.color} rounded-2xl p-6 border border-white/[0.04] hover:border-white/10 transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg">{r.region}</h3>
                  <span className="text-white/20 text-2xl font-bold">{r.count}</span>
                </div>
                <p className="text-muted/50 text-xs mb-4">{r.desc}</p>
                <span className="text-accent-light/60 text-xs font-medium group-hover:text-accent-light transition-colors flex items-center gap-1">
                  매장 보기
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
