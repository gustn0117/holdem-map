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
      <div className="bg-white border-b border-border-custom">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          {mainBanner?.image ? (
            mainBanner.link ? <a href={mainBanner.link} target="_blank" rel="noopener noreferrer"><img src={mainBanner.image} alt="" className="w-full h-16 md:h-20 object-cover rounded-lg my-2" /></a>
              : <img src={mainBanner.image} alt="" className="w-full h-16 md:h-20 object-cover rounded-lg my-2" />
          ) : (
            <div className="ad-pattern h-16 md:h-20 flex items-center justify-center rounded-lg my-2"><p className="text-muted text-sm">광고 영역</p></div>
          )}
        </div>
      </div>

      <Header />

      {/* Map Section */}
      <section className="section-gray">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-bold text-surface">매장 지도</h2>
              <div className="flex gap-1 bg-white rounded-full p-1 border border-border-custom">
                {regions.map((r) => (
                  <button key={r} onClick={() => setSelectedRegion(r)}
                    className={`px-3.5 py-[6px] rounded-full text-[13px] font-semibold transition-all ${selectedRegion === r ? "bg-accent text-white" : "text-muted hover:text-surface"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted text-[13px]"><span className="text-accent font-bold text-[18px]">{filteredStores.length}</span> 곳</span>
              <Link href="/map" className="hidden md:flex items-center gap-1.5 bg-white border border-border-custom text-sub hover:text-accent hover:border-accent text-[13px] font-medium px-3.5 py-[7px] rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                크게 보기
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 h-80 lg:h-[500px] rounded-2xl overflow-hidden border border-border-custom shadow-sm">
              <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
            </div>
            <div className="hidden lg:flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((i) => {
                const banner = sideBanners[i];
                return (
                  <div key={i} className="flex-1 rounded-xl border border-border-custom overflow-hidden">
                    {banner?.image ? (
                      banner.link ? <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block h-full"><img src={banner.image} alt="" className="w-full h-full object-cover" /></a>
                        : <img src={banner.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="ad-pattern h-full flex items-center justify-center text-muted text-xs">AD</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Store List */}
      <section className="bg-white border-t border-border-custom">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-surface">매장 목록</h2>
            <Link href="/map" className="text-accent text-[14px] font-semibold hover:underline">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)}
                className={`transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent rounded-2xl" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shorts */}
      {shorts.length > 0 && (
        <section className="section-gray border-t border-border-custom">
          <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold text-surface">숏츠</h2>
              <Link href="/shorts" className="text-accent text-[14px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {shorts.slice(0, 8).map((short, i) => (
                <Link key={short.id} href="/shorts" className="shrink-0 w-[130px] md:w-[140px] group">
                  <div className="aspect-9/16 rounded-2xl overflow-hidden border border-border-custom bg-bg relative shadow-sm group-hover:shadow-md transition-shadow">
                    <video src={short.video_url} poster={short.thumbnail || undefined} className="w-full h-full object-cover" muted loop playsInline autoPlay={i === 0} />
                    {i === 0 && <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full pulse-dot" />LIVE</div>}
                    {i !== 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-surface ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-surface text-[12px] font-semibold mt-2 truncate">{short.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3 Column */}
      <section className="bg-white border-t border-border-custom">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recommended */}
            <div className="bg-bg rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-[12px] font-bold">★</div>
                <h3 className="text-surface font-bold text-[15px]">추천 매장</h3>
              </div>
              <div className="px-3 pb-3 space-y-1">
                {recommendedStores.map((store, i) => (
                  <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white hover:shadow-sm transition-all group">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0 ${i === 0 ? "bg-accent text-white" : "bg-bg text-muted border border-border-custom"}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{store.name}</p>
                      <p className="text-muted text-[12px]">{store.region} · {store.hours}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#ddd] group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className="bg-bg rounded-2xl overflow-hidden">
              <div className="px-5 py-4 flex justify-between items-center">
                <h3 className="text-surface font-bold text-[15px]">대회 일정</h3>
                <Link href="/events" className="text-accent text-[12px] font-semibold hover:underline">더보기 →</Link>
              </div>
              <div className="px-3 pb-3 space-y-1">
                {upcomingEvents.map((event) => {
                  const d = new Date(event.date);
                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="flex gap-3 px-3 py-3 rounded-xl bg-white hover:shadow-sm transition-all group">
                      <div className="w-11 shrink-0 text-center bg-accent-light rounded-lg py-1.5">
                        <p className="text-accent text-[17px] font-black leading-none">{d.getDate()}</p>
                        <p className="text-accent/60 text-[10px]">{d.getMonth() + 1}월</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{event.title}</p>
                        <p className="text-muted text-[12px] mt-0.5">{event.store_name}</p>
                      </div>
                      {event.prize && <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 self-start">{event.prize}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Notices + Quick */}
            <div className="flex flex-col gap-4">
              <div className="bg-bg rounded-2xl overflow-hidden">
                <div className="px-5 py-4 flex justify-between items-center">
                  <h3 className="text-surface font-bold text-[15px]">공지사항</h3>
                  <Link href="/notices" className="text-accent text-[12px] font-semibold hover:underline">더보기 →</Link>
                </div>
                <div className="px-3 pb-3">
                  {notices.map((notice) => (
                    <Link key={notice.id} href={`/notices/${notice.id}`} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white group transition-all">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <p className="text-sub text-[13px] truncate flex-1 group-hover:text-accent transition-colors">{notice.title}</p>
                      <span className="text-muted text-[11px] shrink-0">{notice.date.slice(5)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 flex-1">
                <Link href="/jobs" className="bg-bg rounded-2xl p-5 hover:bg-accent-light/50 transition-all group flex flex-col justify-between">
                  <svg className="w-6 h-6 text-accent mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div><p className="text-surface font-bold text-[14px]">구인구직</p><p className="text-muted text-[12px]">딜러 · 서빙</p></div>
                </Link>
                <Link href="/contact" className="bg-accent rounded-2xl p-5 hover:bg-accent-hover transition-all flex flex-col justify-between">
                  <svg className="w-6 h-6 text-white/70 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <div><p className="text-white font-bold text-[14px]">매장 등록</p><p className="text-white/60 text-[12px]">문의하기</p></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
