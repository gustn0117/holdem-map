"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

  const filteredStores = selectedRegion === "전체" ? stores : stores.filter((s) => s.region === selectedRegion);
  const recommendedStores = stores.filter((s) => s.is_recommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-[#f5f5f5]">
      {/* ─── Main Banner Ad ─── */}
      <div className="w-full ad-pattern border-b border-border-custom">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-24 md:h-28 flex items-center justify-center">
          <p className="text-muted text-base">메인 광고 예정</p>
        </div>
      </div>

      <Header />

      {/* ─── Map + Side Banners ─── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {regions.map((r) => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedRegion === r ? "bg-accent text-white" : "bg-white text-muted hover:text-surface border border-border-custom"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted text-sm"><span className="text-accent font-bold text-xl mr-1">{filteredStores.length}</span>곳</p>
            <Link href="/map" className="bg-white border border-border-custom text-surface hover:border-accent hover:text-accent text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              지도 크게 보기
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-110 lg:h-140 rounded-2xl overflow-hidden border border-border-custom">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>
          <div className="hidden lg:flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-24 ad-pattern rounded-xl border border-border-custom flex items-center justify-center text-muted text-sm hover:border-accent/30 transition-all">
                배너 광고 {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Store List ─── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-10 w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-surface">매장 목록</h2>
          <Link href="/map" className="text-accent text-sm font-semibold hover:underline">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <div key={store.id} onClick={() => setSelectedStore(store)}
              className={`rounded-2xl transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
              <StoreCard store={store} />
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8"><div className="h-px bg-border-custom" /></div>

      {/* ─── 3 Column ─── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recommended */}
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="p-5 border-b border-border-custom flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold">★</div>
              <div>
                <h3 className="text-surface font-bold text-base">추천 매장</h3>
                <p className="text-muted text-xs">에디터 추천</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {recommendedStores.map((store, i) => (
                <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-border-custom transition-all group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${i === 0 ? "bg-accent text-white" : "bg-gray-100 text-muted"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-sm font-bold truncate group-hover:text-accent transition-colors">{store.name}</p>
                    <p className="text-muted text-xs mt-0.5">{store.region} · {store.hours}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="p-5 border-b border-border-custom flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-surface font-bold text-base">대회 일정</h3>
                  <p className="text-muted text-xs">다가오는 토너먼트</p>
                </div>
              </div>
              <Link href="/events" className="bg-white border border-border-custom text-surface hover:border-accent hover:text-accent text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">전체보기 →</Link>
            </div>
            <div className="p-4 space-y-2">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="block group">
                    <div className="flex gap-3 p-3.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-border-custom transition-all">
                      <div className="w-12 shrink-0 text-center bg-accent/5 rounded-lg py-1.5">
                        <p className="text-accent text-xl font-black leading-none">{d.getDate()}</p>
                        <p className="text-muted text-[10px] mt-0.5">{d.getMonth() + 1}월</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-surface text-sm font-bold truncate group-hover:text-accent transition-colors">{event.title}</p>
                        <p className="text-muted text-xs mt-1">{event.store_name}</p>
                      </div>
                      {event.prize && <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 self-start">{event.prize}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notices + CTA */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
              <div className="p-5 border-b border-border-custom flex justify-between items-center">
                <h3 className="text-surface font-bold text-base">공지사항</h3>
                <Link href="/notices" className="text-accent text-xs font-semibold hover:underline">전체보기</Link>
              </div>
              <div className="p-4">
                {notices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="flex items-center gap-3 py-3 group border-b border-border-custom/50 last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <p className="text-sub text-sm truncate flex-1 group-hover:text-accent transition-colors">{notice.title}</p>
                    <span className="text-muted text-xs shrink-0">{notice.date.slice(5)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/jobs" className="bg-white rounded-2xl border border-border-custom p-5 hover:border-accent/30 hover:shadow-md transition-all group">
                <svg className="w-8 h-8 text-accent mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <h4 className="text-surface font-bold text-sm">구인구직</h4>
                <p className="text-muted text-xs mt-1">딜러 · 서빙</p>
              </Link>
              <Link href="/contact" className="bg-accent rounded-2xl p-5 text-white hover:bg-accent-hover transition-all group">
                <svg className="w-8 h-8 text-white/80 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <h4 className="text-white font-bold text-sm">매장 등록</h4>
                <p className="text-white/70 text-xs mt-1">문의하기</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8"><div className="h-px bg-border-custom" /></div>

      {/* ─── Regions ─── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 w-full">
        <h2 className="text-xl font-bold text-surface mb-6">지역별 매장</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { region: "서울", count: stores.filter(s => s.region === "서울").length, desc: "강남, 홍대, 잠실 등" },
            { region: "경기", count: stores.filter(s => s.region === "경기").length, desc: "판교, 수원, 일산 등" },
            { region: "인천", count: stores.filter(s => s.region === "인천").length, desc: "부평, 송도 등" },
          ].map((r) => (
            <Link key={r.region} href={`/map?q=${r.region}`} className="group">
              <div className="bg-white rounded-2xl p-6 border border-border-custom hover:border-accent/40 transition-all group-hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-surface font-bold text-xl">{r.region}</h3>
                  <span className="text-accent text-3xl font-black">{r.count}</span>
                </div>
                <p className="text-muted text-sm mb-4">{r.desc}</p>
                <span className="text-accent text-sm font-semibold group-hover:underline">매장 보기 →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
