"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { getBanners, getShorts } from "@/lib/api";
import { Store, Banner, Short } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const regions = ["전체", "서울", "경기", "인천"];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { stores } = useStores();
  const { events } = useEvents();
  const { notices } = useNotices();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [shorts, setShorts] = useState<Short[]>([]);

  useEffect(() => { getBanners().then(setBanners); getShorts().then(setShorts); }, []);

  const mainBanner = banners.find(b => b.position === "main");
  const sideBanners = banners.filter(b => b.position.startsWith("side")).sort((a, b) => a.position.localeCompare(b.position));
  const filteredStores = selectedRegion === "전체" ? stores : stores.filter((s) => s.region === selectedRegion);
  const recommendedStores = stores.filter((s) => s.is_recommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      {/* Main Banner */}
      <div className="w-full bg-white border-b border-border-custom">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {mainBanner?.image ? (
            mainBanner.link ? <a href={mainBanner.link} target="_blank" rel="noopener noreferrer"><img src={mainBanner.image} alt="" className="w-full h-20 md:h-24 object-cover" /></a>
              : <img src={mainBanner.image} alt="" className="w-full h-20 md:h-24 object-cover" />
          ) : (
            <div className="ad-pattern h-20 md:h-24 flex items-center justify-center rounded-none"><p className="text-muted text-sm">광고 영역</p></div>
          )}
        </div>
      </div>

      <Header />

      {/* Map Section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-5 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {regions.map((r) => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedRegion === r ? "bg-accent text-white" : "bg-white text-sub hover:text-surface border border-border-custom"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted text-sm"><span className="text-accent font-bold text-lg">{filteredStores.length}</span> 곳</span>
            <Link href="/map" className="bg-white border border-border-custom text-sub hover:text-accent hover:border-accent text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              크게 보기
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 h-96 lg:h-[520px] rounded-xl overflow-hidden border border-border-custom">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>
          <div className="hidden lg:flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((i) => {
              const banner = sideBanners[i];
              return (
                <div key={i} className="h-[92px] rounded-xl border border-border-custom overflow-hidden">
                  {banner?.image ? (
                    banner.link ? <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block h-full"><img src={banner.image} alt="" className="w-full h-full object-cover" /></a>
                      : <img src={banner.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="ad-pattern h-full flex items-center justify-center text-muted text-xs">광고 {i + 1}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Store List */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-surface">매장 목록</h2>
          <Link href="/map" className="text-accent text-sm font-medium hover:underline">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStores.map((store) => (
            <div key={store.id} onClick={() => setSelectedStore(store)}
              className={`rounded-xl transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
              <StoreCard store={store} />
            </div>
          ))}
        </div>
      </section>

      {/* Shorts */}
      {shorts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-surface">숏츠</h2>
            <Link href="/shorts" className="text-accent text-sm font-medium hover:underline">전체보기 →</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {shorts.slice(0, 8).map((short, i) => (
              <div key={short.id} className="shrink-0 w-32 md:w-36">
                <div className="aspect-9/16 rounded-xl overflow-hidden border border-border-custom bg-bg relative group cursor-pointer">
                  <video
                    src={short.video_url}
                    poster={short.thumbnail || undefined}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay={i === 0}
                  />
                  {i !== 0 && (
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-surface ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  )}
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1 h-1 bg-white rounded-full pulse-dot" />LIVE
                    </div>
                  )}
                </div>
                <p className="text-surface text-xs font-medium mt-1.5 truncate">{short.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-[1400px] mx-auto px-4 md:px-8"><hr className="border-border-custom" /></div>

      {/* 3 Column */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recommended */}
          <div className="bg-white rounded-xl border border-border-custom overflow-hidden">
            <div className="px-5 py-4 border-b border-border-custom flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-bold">★</div>
              <h3 className="text-surface font-bold">추천 매장</h3>
            </div>
            <div className="p-3 space-y-1">
              {recommendedStores.map((store, i) => (
                <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg transition-all group">
                  <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? "bg-accent text-white" : "bg-bg text-muted"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-sm font-bold truncate group-hover:text-accent transition-colors">{store.name}</p>
                    <p className="text-muted text-xs">{store.region} · {store.hours}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-xl border border-border-custom overflow-hidden">
            <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
              <h3 className="text-surface font-bold">대회 일정</h3>
              <Link href="/events" className="text-accent text-xs font-medium hover:underline">전체보기 →</Link>
            </div>
            <div className="p-3 space-y-1">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="flex gap-3 px-3 py-3 rounded-lg hover:bg-bg transition-all group">
                    <div className="w-10 shrink-0 text-center">
                      <p className="text-accent text-lg font-black leading-none">{d.getDate()}</p>
                      <p className="text-muted text-[10px]">{d.getMonth() + 1}월</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface text-sm font-bold truncate group-hover:text-accent transition-colors">{event.title}</p>
                      <p className="text-muted text-xs mt-0.5">{event.store_name}</p>
                    </div>
                    {event.prize && <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0 self-start">{event.prize}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notices + Quick Links */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-border-custom overflow-hidden">
              <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
                <h3 className="text-surface font-bold">공지사항</h3>
                <Link href="/notices" className="text-accent text-xs font-medium hover:underline">전체보기 →</Link>
              </div>
              <div className="p-3">
                {notices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-bg group transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <p className="text-sub text-sm truncate flex-1 group-hover:text-accent transition-colors">{notice.title}</p>
                    <span className="text-muted text-xs shrink-0">{notice.date.slice(5)}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/jobs" className="bg-white rounded-xl border border-border-custom p-4 hover:border-accent/40 hover:shadow-sm transition-all group">
                <svg className="w-7 h-7 text-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-surface font-bold text-sm">구인구직</p>
                <p className="text-muted text-xs mt-0.5">딜러 · 서빙</p>
              </Link>
              <Link href="/contact" className="bg-accent rounded-xl p-4 hover:bg-accent-hover transition-all">
                <svg className="w-7 h-7 text-white/80 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <p className="text-white font-bold text-sm">매장 등록</p>
                <p className="text-white/70 text-xs mt-0.5">문의하기</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
