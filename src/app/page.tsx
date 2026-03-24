"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";
import { stores } from "@/data/stores";
import { events } from "@/data/events";
import { notices } from "@/data/notices";
import { Store } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const regions = ["전체", "서울", "경기", "인천"];

const stats = [
  { label: "등록 매장", value: "12", suffix: "개", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { label: "서비스 지역", value: "3", suffix: "개", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { label: "예정 대회", value: "6", suffix: "건", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { label: "추천 매장", value: "3", suffix: "곳", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const filteredStores =
    selectedRegion === "전체"
      ? stores
      : stores.filter((s) => s.region === selectedRegion);

  const recommendedStores = stores.filter((s) => s.isRecommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-accent/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />

        <div className="relative max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 bg-green rounded-full pulse-glow" />
            <span className="text-accent-light text-xs font-medium">서울 / 경기 / 인천 매장 정보 서비스 중</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            내 주변 홀덤 매장을<br />
            <span className="bg-linear-to-r from-accent-light to-accent bg-clip-text text-transparent">한눈에</span> 찾아보세요
          </h1>
          <p className="text-muted text-sm md:text-base mb-8 max-w-md mx-auto">
            지역별 매장 위치, 영업시간, 대회 일정까지 한 곳에서 확인
          </p>

          <div className="max-w-lg mx-auto mb-6">
            <SearchBar large />
          </div>

          <div className="flex justify-center gap-2">
            <span className="text-muted text-xs mr-1">인기</span>
            {["강남", "홍대", "수원", "일산"].map((keyword) => (
              <Link
                key={keyword}
                href={`/map?q=${keyword}`}
                className="text-muted hover:text-accent-light text-xs border border-border-custom rounded-full px-3 py-1 hover:bg-accent/10 hover:border-accent/30 transition-all"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-2 mb-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border-custom/50 text-center">
              <svg className="w-5 h-5 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
              </svg>
              <p className="text-xl font-bold text-white">
                {stat.value}<span className="text-sm text-muted font-normal ml-0.5">{stat.suffix}</span>
              </p>
              <p className="text-muted text-[11px] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map + Store List */}
      <section className="max-w-7xl mx-auto px-4 pb-12 w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">매장 지도</h2>
            <p className="text-muted text-xs mt-0.5">지도에서 매장 위치를 확인하세요</p>
          </div>
          <div className="flex gap-1.5 bg-card rounded-lg p-1 border border-border-custom/50">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedRegion === region
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-surface"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-[400px] lg:h-[520px]">
            <MapView
              stores={filteredStores}
              onStoreClick={setSelectedStore}
              selectedStore={selectedStore}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2.5 lg:h-[520px] lg:overflow-y-auto lg:pr-1">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-muted text-xs">
                검색 결과 <span className="text-accent-light font-semibold">{filteredStores.length}</span>곳
              </p>
              <Link href="/map" className="text-accent text-xs hover:text-accent-light transition-colors">
                전체보기 →
              </Link>
            </div>
            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`rounded-2xl transition-all cursor-pointer ${
                  selectedStore?.id === store.id ? "ring-1 ring-accent/60" : ""
                }`}
              >
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events + Recommended + Notices */}
      <section className="max-w-7xl mx-auto px-4 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Upcoming Events */}
          <div className="bg-card rounded-2xl p-5 border border-border-custom/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                다가오는 대회
              </h3>
              <Link href="/events" className="text-accent text-[11px] hover:text-accent-light transition-colors">전체보기</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3.5 rounded-xl bg-dark/60 border border-border-custom/30 hover:border-accent/20 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-surface text-sm font-medium leading-snug">{event.title}</p>
                    {event.prize && (
                      <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border border-gold/15">
                        {event.prize}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>{event.storeName}</span>
                    <span className="text-border-custom">|</span>
                    <span>{event.date} {event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Stores */}
          <div className="bg-card rounded-2xl p-5 border border-border-custom/50">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              추천 매장
            </h3>
            <div className="flex flex-col gap-2">
              {recommendedStores.map((store) => (
                <Link
                  key={store.id}
                  href={`/store/${store.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-dark/60 border border-border-custom/30 hover:border-gold/20 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-sm font-medium truncate group-hover:text-white transition-colors">{store.name}</p>
                    <p className="text-muted text-[11px]">{store.region} · {store.hours}</p>
                  </div>
                  <svg className="w-4 h-4 text-muted/30 group-hover:text-gold shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Notices + Community */}
          <div className="flex flex-col gap-5">
            <div className="bg-card rounded-2xl p-5 border border-border-custom/50">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                공지사항
              </h3>
              <div className="flex flex-col gap-2">
                {notices.map((notice) => (
                  <div key={notice.id} className="flex items-start gap-2 py-1.5">
                    <div className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-surface text-sm truncate">{notice.title}</p>
                      <p className="text-muted/50 text-[10px] mt-0.5">{notice.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border-custom/50">
              <h3 className="text-white font-bold text-sm mb-3">커뮤니티</h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: "네이버 카페", color: "bg-green/10 text-green" },
                  { name: "인스타그램", color: "bg-red/10 text-red" },
                  { name: "카카오톡 채널", color: "bg-gold/10 text-gold" },
                ].map((link) => (
                  <div
                    key={link.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-dark/40 hover:bg-dark/80 transition-colors cursor-pointer"
                  >
                    <span className="text-muted text-sm">{link.name}</span>
                    <span className="text-muted/40 text-[10px]">준비중</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12 w-full">
        <div className="relative bg-card rounded-2xl p-8 md:p-10 border border-border-custom/50 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-accent/5 to-accent-light/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">내 매장을 홀덤맵에 등록하세요</h3>
              <p className="text-muted text-sm">전국 홀덤 유저에게 매장을 홍보할 수 있습니다</p>
            </div>
            <button className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg shadow-accent/20 shrink-0">
              매장 등록 문의
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
