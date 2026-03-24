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
        <div className="absolute inset-0 bg-linear-to-b from-primary to-dark" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-80 bg-accent/8 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 pt-24 md:pt-32 pb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            홀덤 매장을<br />
            <span className="gold-text-shine">한눈에 찾아보세요</span>
          </h1>
          <p className="text-sub text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
            매장 위치, 영업시간, 대회 일정까지 필요한 정보를 한 곳에서 확인하세요
          </p>

          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar large />
          </div>

          <div className="flex justify-center items-center gap-2.5 flex-wrap">
            <span className="text-muted text-sm">인기</span>
            {["강남", "홍대", "수원", "일산", "잠실"].map((k) => (
              <Link key={k} href={`/map?q=${k}`} className="text-sub hover:text-accent text-sm bg-white/5 hover:bg-accent/10 border border-white/8 hover:border-accent/30 rounded-full px-5 py-2 transition-all">
                {k}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px gold-shine" />
      </section>

      {/* Quick Categories */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="bg-card rounded-3xl border border-border-custom p-8 md:p-10 gold-glow gold-border">
          <div className="flex justify-around gap-4">
            {[
              { label: "토너먼트", tag: "토너먼트", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
              { label: "초보환영", tag: "초보환영", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "프리미엄", tag: "프리미엄", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
              { label: "주차가능", tag: "주차가능", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
              { label: "야간운영", tag: "야간운영", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" },
            ].map((cat) => (
              <Link key={cat.label} href={`/map?q=${cat.tag}`} className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/15">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-accent group-hover:text-accent-light transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                  </svg>
                </div>
                <span className="text-muted text-sm font-medium group-hover:text-white transition-colors">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 pb-20 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">매장 지도</h2>
            <p className="text-muted text-base mt-2">지도에서 가까운 매장을 찾아보세요</p>
          </div>
          <div className="flex gap-1 bg-card rounded-xl p-1.5 border border-border-custom">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedRegion === r ? "gold-btn text-dark shadow-md shadow-accent/20" : "text-muted hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-110 lg:h-150 rounded-2xl overflow-hidden border border-border-custom">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-3 lg:h-150 lg:overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-muted text-base"><span className="gold-text-shine font-bold text-2xl mr-1">{filteredStores.length}</span>곳</p>
              <Link href="/map" className="text-base text-accent hover:text-accent-light font-medium transition-colors">전체보기 →</Link>
            </div>
            {filteredStores.map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)} className={`rounded-2xl transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent/50" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold divider */}
      <div className="max-w-5xl mx-auto px-4 pb-16"><div className="h-px gold-shine opacity-30" /></div>

      {/* 3-Column */}
      <section className="max-w-7xl mx-auto px-4 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recommended */}
          <div className="bg-card rounded-3xl border border-border-custom overflow-hidden gold-border">
            <div className="p-6 border-b border-border-custom flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl gold-shine flex items-center justify-center shadow-md shadow-accent/20">
                <span className="text-dark text-lg font-bold">★</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">추천 매장</h3>
                <p className="text-muted text-sm">에디터 추천 매장</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {recommendedStores.map((store, i) => (
                <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 hover:bg-white/5 border border-border-custom hover:border-accent/30 transition-all group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${i === 0 ? "gold-shine text-dark" : "bg-white/5 text-muted"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-semibold truncate group-hover:text-accent transition-colors">{store.name}</p>
                    <p className="text-muted text-sm mt-1">{store.region} · {store.hours}</p>
                  </div>
                  <svg className="w-5 h-5 text-border-custom group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-card rounded-3xl border border-border-custom overflow-hidden">
            <div className="p-6 border-b border-border-custom flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">다가오는 대회</h3>
                  <p className="text-muted text-sm">이번 주 토너먼트</p>
                </div>
              </div>
              <Link href="/events" className="text-accent text-sm font-semibold hover:text-accent-light transition-colors">전체보기</Link>
            </div>
            <div className="p-5 space-y-3">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <div key={event.id} className="flex gap-4 p-4 rounded-xl bg-white/3 border border-border-custom hover:border-accent/20 transition-colors">
                    <div className="w-14 shrink-0 text-center">
                      <p className="gold-text-shine text-2xl font-bold leading-none">{d.getDate()}</p>
                      <p className="text-muted text-xs mt-1">{d.getMonth() + 1}월</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base font-semibold truncate">{event.title}</p>
                      <p className="text-muted text-sm mt-1">{event.store_name} · {event.time}</p>
                    </div>
                    {event.prize && <span className="gold-text-shine text-sm font-bold px-3 py-1.5 rounded-lg shrink-0 self-start bg-accent/8 border border-accent/15">{event.prize}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notices + CTA */}
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-3xl border border-border-custom overflow-hidden">
              <div className="p-6 border-b border-border-custom flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">공지사항</h3>
                <Link href="/notices" className="text-accent text-sm font-semibold hover:text-accent-light transition-colors">전체보기</Link>
              </div>
              <div className="p-5">
                {notices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="flex items-center gap-3 py-3.5 px-2 group border-b border-border-custom/50 last:border-0">
                    <span className="w-2 h-2 rounded-full gold-shine shrink-0" />
                    <p className="text-sub text-base truncate flex-1 group-hover:text-white transition-colors">{notice.title}</p>
                    <span className="text-muted text-sm shrink-0">{notice.date.slice(5)}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden flex-1 gold-border">
              <div className="absolute inset-0 bg-linear-to-br from-accent/8 via-transparent to-accent-light/5" />
              <div className="relative p-8 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">매장을 등록하세요</h3>
                  <p className="text-sub text-base leading-relaxed">전국 홀덤 유저에게<br />매장을 홍보할 수 있습니다</p>
                </div>
                <Link href="/contact" className="gold-btn text-dark text-base font-bold px-8 py-3.5 rounded-full shadow-lg shadow-accent/25 hover:shadow-accent/40 mt-6 self-start transition-all inline-block">
                  등록 문의
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <h2 className="text-3xl font-bold text-white mb-8">지역별 매장</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { region: "서울", count: stores.filter(s => s.region === "서울").length, desc: "강남, 홍대, 잠실 등" },
            { region: "경기", count: stores.filter(s => s.region === "경기").length, desc: "판교, 수원, 일산 등" },
            { region: "인천", count: stores.filter(s => s.region === "인천").length, desc: "부평, 송도 등" },
          ].map((r) => (
            <Link key={r.region} href={`/map?q=${r.region}`} className="group">
              <div className="bg-card rounded-3xl p-8 border border-border-custom hover:border-accent/40 transition-all group-hover:shadow-lg group-hover:shadow-accent/8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-2xl">{r.region}</h3>
                  <span className="gold-text-shine text-4xl font-bold">{r.count}</span>
                </div>
                <p className="text-muted text-base mb-5">{r.desc}</p>
                <span className="text-accent text-base font-semibold group-hover:text-accent-light transition-colors">매장 보기 →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
