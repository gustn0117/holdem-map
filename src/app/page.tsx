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
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/[0.07] rounded-full blur-[100px]" />
          <div className="absolute top-20 left-1/4 w-[200px] h-[200px] bg-accent-light/[0.04] rounded-full blur-[80px]" />
          <div className="absolute top-10 right-1/4 w-[150px] h-[150px] bg-gold/[0.03] rounded-full blur-[60px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-dark)_70%)]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2.5 glass border border-white/10 rounded-full px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
            <span className="text-white/60 text-xs font-medium">서울 · 경기 · 인천 매장 서비스 중</span>
            <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-semibold">12곳</span>
          </div>

          <h1 className="text-4xl md:text-[52px] font-extrabold text-white mb-5 leading-[1.15] tracking-tight">
            홀덤 매장,<br />
            <span className="bg-linear-to-r from-accent-light via-accent to-accent-light bg-clip-text text-transparent">한눈에</span> 찾아보세요
          </h1>
          <p className="text-muted text-sm md:text-base mb-10 max-w-sm mx-auto leading-relaxed">
            지역별 매장 위치부터 영업시간, 대회 일정까지<br className="hidden md:block" />
            필요한 정보를 한 곳에서 확인하세요
          </p>

          <div className="max-w-lg mx-auto mb-8">
            <SearchBar large />
          </div>

          <div className="flex justify-center items-center gap-2 flex-wrap">
            <span className="text-muted/40 text-xs">인기 검색</span>
            {["강남", "홍대", "수원", "일산", "잠실"].map((keyword) => (
              <Link
                key={keyword}
                href={`/map?q=${keyword}`}
                className="text-muted/60 hover:text-white text-xs glass border border-white/5 hover:border-accent/30 rounded-full px-3.5 py-1.5 transition-all"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-4xl mx-auto px-4 mb-14 w-full">
        <div className="grid grid-cols-4 divide-x divide-white/5">
          {[
            { value: "12", label: "등록 매장", color: "text-accent-light" },
            { value: "3", label: "서비스 지역", color: "text-green" },
            { value: "6", label: "예정 대회", color: "text-gold" },
            { value: "3", label: "추천 매장", color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-2">
              <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-muted/50 text-[10px] md:text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">EXPLORE</p>
            <h2 className="text-xl font-bold text-white">매장 지도</h2>
          </div>
          <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRegion === region
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "text-muted hover:text-surface"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-100 lg:h-130">
            <MapView
              stores={filteredStores}
              onStoreClick={setSelectedStore}
              selectedStore={selectedStore}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2 lg:h-130 lg:overflow-y-auto lg:pr-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-muted/50 text-xs">
                <span className="text-accent-light font-bold text-sm mr-1">{filteredStores.length}</span>곳의 매장
              </p>
              <Link href="/map" className="text-xs text-muted/50 hover:text-accent transition-colors flex items-center gap-1">
                전체보기
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`rounded-2xl transition-all cursor-pointer ${
                  selectedStore?.id === store.id ? "ring-1 ring-accent/50 ring-offset-1 ring-offset-dark" : ""
                }`}
              >
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events + Recommended + Info */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Upcoming Events */}
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden gradient-border">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">다가오는 대회</h3>
                    <p className="text-muted/40 text-[10px]">곧 시작하는 토너먼트</p>
                  </div>
                </div>
                <Link href="/events" className="text-[10px] text-accent hover:text-accent-light transition-colors font-medium">더보기</Link>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-surface text-sm font-semibold leading-snug">{event.title}</p>
                    {event.prize && (
                      <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                        {event.prize}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted/50">
                    <span className="text-accent/60">{event.storeName}</span>
                    <span>·</span>
                    <span>{event.date}</span>
                    <span>·</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Stores */}
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden gradient-border">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">추천 매장</h3>
                  <p className="text-muted/40 text-[10px]">에디터가 선정한 매장</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {recommendedStores.map((store, i) => (
                <Link
                  key={store.id}
                  href={`/store/${store.id}`}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-gold/20 to-gold/5 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-sm font-semibold truncate group-hover:text-white transition-colors">{store.name}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted/50 mt-0.5">
                      <span>{store.region}</span>
                      <span>·</span>
                      <span>{store.hours}</span>
                    </div>
                  </div>
                  <svg className="w-3.5 h-3.5 text-white/10 group-hover:text-gold shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Notices + Community */}
          <div className="flex flex-col gap-5">
            <div className="bg-card rounded-2xl border border-white/5 overflow-hidden gradient-border">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-sm">공지사항</h3>
                </div>
              </div>
              <div className="p-4 space-y-1">
                {notices.map((notice) => (
                  <div key={notice.id} className="flex items-center gap-3 py-2.5 px-1 group cursor-pointer">
                    <span className="w-1 h-1 rounded-full bg-accent/40 shrink-0" />
                    <p className="text-muted/70 text-sm truncate flex-1 group-hover:text-surface transition-colors">{notice.title}</p>
                    <span className="text-muted/25 text-[10px] shrink-0">{notice.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA mini */}
            <div className="relative bg-card rounded-2xl p-6 border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px] translate-x-8 -translate-y-8" />
              <div className="relative">
                <h3 className="text-white font-bold text-sm mb-1">매장을 등록하세요</h3>
                <p className="text-muted/50 text-xs mb-4">홀덤맵에서 매장을 홍보하세요</p>
                <button className="bg-linear-to-r from-accent to-accent-light text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-accent/20 hover:opacity-90 transition-all">
                  등록 문의하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
