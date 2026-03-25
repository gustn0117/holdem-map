"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { getBanners, getShorts, getJobs } from "@/lib/api";
import { Store, Banner, Short, Job } from "@/types";

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
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => { getBanners().then(setBanners); getShorts().then(setShorts); getJobs().then(setJobs); }, []);

  const mainBanner = banners.find(b => b.position === "main");
  const sideBanners = banners.filter(b => b.position.startsWith("side")).sort((a, b) => a.position.localeCompare(b.position));
  const filteredStores = selectedRegion === "전체" ? stores : stores.filter((s) => s.region === selectedRegion);
  const recommendedStores = stores.filter((s) => s.is_recommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      {/* Map */}
      <section className="section-alt border-b border-border-custom">
        <div className="max-w-350 mx-auto px-5 md:px-10 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-surface">매장 지도</h2>
            <div className="flex items-center gap-2.5">
              <span className="text-muted text-[13px]"><span className="text-accent font-bold">{filteredStores.length}</span>곳</span>
              <Link href="/map" className="hidden md:flex items-center gap-1 text-[13px] text-sub hover:text-accent font-medium transition-colors">
                크게 보기
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-3 h-72 lg:h-125 rounded-2xl overflow-hidden card-shadow">
              <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
            </div>
            <div className="hidden lg:flex flex-col gap-2.5">
              {[0, 1, 2, 3, 4].map((i) => {
                const banner = sideBanners[i];
                return (
                  <div key={i} className="flex-1 rounded-xl overflow-hidden card-shadow">
                    {banner?.image ? (
                      banner.link ? <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block h-full"><img src={banner.image} alt="" className="w-full h-full object-cover" /></a>
                        : <img src={banner.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="ad-pattern h-full flex items-center justify-center text-[#ccc] text-[11px]">AD</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Store List */}
      <section>
        <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-surface">매장 목록</h2>
            <Link href="/map" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStores.map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)}
                className={`transition-all cursor-pointer rounded-2xl ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shorts */}
      {shorts.length > 0 && (
        <section className="section-alt border-y border-border-custom">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-surface">숏츠</h2>
              <Link href="/shorts" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              {shorts.slice(0, 8).map((short, i) => (
                <Link key={short.id} href="/shorts" className="shrink-0 w-28 md:w-32 group">
                  <div className="aspect-9/16 rounded-2xl overflow-hidden card-shadow relative group-hover:card-shadow-hover transition-shadow">
                    <video src={short.video_url} poster={short.thumbnail || undefined} className="w-full h-full object-cover" muted loop playsInline autoPlay={i === 0} />
                    {i === 0 && <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full pulse-dot" />LIVE</div>}
                    {i !== 0 && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><svg className="w-3.5 h-3.5 text-surface ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div></div>}
                  </div>
                  <p className="text-surface text-[12px] font-semibold mt-2 truncate">{short.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom Grid */}
      <section>
        <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Recommended */}
            <div className="rounded-2xl overflow-hidden card-shadow bg-white">
              <div className="px-5 py-4 border-b border-border-custom flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-[11px] font-bold">★</span>
                <h3 className="text-surface font-bold text-[15px]">추천 매장</h3>
              </div>
              <div className="p-2">
                {recommendedStores.map((store, i) => (
                  <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg transition group">
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-black shrink-0 ${i === 0 ? "bg-accent text-white" : "bg-bg text-muted"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{store.name}</p>
                      <p className="text-muted text-[12px]">{store.region} · {store.hours}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 text-[#ddd] group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className="rounded-2xl overflow-hidden card-shadow bg-white">
              <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
                <h3 className="text-surface font-bold text-[15px]">대회 일정</h3>
                <Link href="/events" className="text-accent text-[12px] font-semibold hover:underline">더보기 →</Link>
              </div>
              <div className="p-2">
                {upcomingEvents.map((event) => {
                  const d = new Date(event.date);
                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="flex gap-3 px-3 py-3 rounded-xl hover:bg-bg transition group">
                      <div className="w-10 shrink-0 text-center">
                        <p className="text-accent text-[16px] font-black leading-none">{d.getDate()}</p>
                        <p className="text-muted text-[10px]">{d.getMonth() + 1}월</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{event.title}</p>
                        <p className="text-muted text-[12px]">{event.store_name}</p>
                      </div>
                      {event.prize && <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 self-center">{event.prize}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Notices */}
            <div className="rounded-2xl overflow-hidden card-shadow bg-white">
              <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
                <h3 className="text-surface font-bold text-[15px]">공지사항</h3>
                <Link href="/notices" className="text-accent text-[12px] font-semibold hover:underline">더보기 →</Link>
              </div>
              <div className="p-2">
                {notices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-bg group transition">
                    <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                    <p className="text-sub text-[13px] truncate flex-1 group-hover:text-accent transition-colors">{notice.title}</p>
                    <span className="text-[#ccc] text-[11px] shrink-0">{notice.date.slice(5)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 구인구직 */}
            <div className="rounded-2xl overflow-hidden card-shadow bg-white">
              <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
                <h3 className="text-surface font-bold text-[15px]">구인구직</h3>
                <Link href="/jobs" className="text-accent text-[12px] font-semibold hover:underline">더보기 →</Link>
              </div>
              <div className="p-2">
                {jobs.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-muted text-[13px]">등록된 구직글이 없습니다</p>
                    <Link href="/jobs/write" className="text-accent text-[12px] font-semibold mt-1 inline-block hover:underline">구직글 작성하기 →</Link>
                  </div>
                ) : (
                  jobs.slice(0, 4).map((job) => (
                    <Link key={job.id} href="/jobs" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg transition group">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${job.role === "딜러" ? "bg-accent-light text-accent" : "bg-blue-50 text-blue-500"}`}>
                        {job.role === "딜러" ? "D" : "S"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{job.nickname}</p>
                        <p className="text-muted text-[12px]">{job.role} · {job.areas.slice(0, 2).join(", ")}</p>
                      </div>
                      <span className="text-[#ccc] text-[11px] shrink-0">{job.created_at?.slice(5, 10)}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
