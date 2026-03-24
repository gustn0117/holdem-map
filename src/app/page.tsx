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

  const filteredStores = selectedRegion === "전체" ? stores : stores.filter((s) => s.region === selectedRegion);
  const recommendedStores = stores.filter((s) => s.is_recommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      {/* ─── Main Banner Ad ─── */}
      <div className="w-full bg-card border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-4 h-24 md:h-28 flex items-center justify-center text-center">
          <p className="text-muted text-base">메인 광고 예정</p>
        </div>
      </div>

      <Header />

      {/* ─── Search ─── */}
      <section className="max-w-3xl mx-auto px-4 py-8 w-full">
        <SearchBar large />
      </section>

      {/* ─── Map + Side Banners ─── */}
      <section className="max-w-7xl mx-auto px-4 pb-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5 bg-card rounded-full p-1.5 border border-border-custom">
            {regions.map((r) => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${selectedRegion === r ? "gold-btn text-dark shadow-md" : "text-muted hover:text-white"}`}>
                {r}
              </button>
            ))}
          </div>
          <p className="text-muted text-base"><span className="gold-text-shine font-black text-2xl mr-1">{filteredStores.length}</span>곳</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-110 lg:h-140 rounded-3xl overflow-hidden border border-border-custom">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>

          {/* Side Banners */}
          <div className="hidden lg:flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-24 bg-card rounded-2xl border border-border-custom flex items-center justify-center text-muted text-sm relative overflow-hidden group hover:border-accent/20 transition-all">
                <div className="absolute inset-0 felt-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
                <span className="relative">배너 광고 {n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Store List ─── */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">매장 목록</h2>
          <Link href="/map" className="text-accent hover:text-accent-light text-base font-semibold transition-colors">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <div key={store.id} onClick={() => setSelectedStore(store)}
              className={`rounded-2xl transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent/50" : ""}`}>
              <StoreCard store={store} />
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4"><div className="glow-line" /></div>

      {/* ─── 3 Column ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recommended */}
          <div className="bg-card rounded-3xl border border-border-custom overflow-hidden gold-border relative noise">
            <div className="absolute top-4 right-4 text-5xl text-accent/5 font-serif select-none">♠</div>
            <div className="relative p-7 border-b border-border-custom">
              <p className="text-accent uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Editor&apos;s Pick</p>
              <h3 className="text-white font-black text-xl">추천 매장</h3>
            </div>
            <div className="relative p-5 space-y-3">
              {recommendedStores.map((store, i) => (
                <Link key={store.id} href={`/store/${store.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/3 hover:bg-white/5 border border-border-custom hover:border-accent/30 transition-all group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${i === 0 ? "gold-shine text-dark" : "bg-felt/20 text-green"}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-bold truncate group-hover:text-accent transition-colors">{store.name}</p>
                    <p className="text-muted text-sm mt-1">{store.region} · {store.hours}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-card rounded-3xl border border-border-custom overflow-hidden relative noise">
            <div className="absolute top-4 right-4 text-5xl text-red/5 font-serif select-none">♥</div>
            <div className="relative p-7 border-b border-border-custom flex justify-between items-end">
              <div>
                <p className="text-accent uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Upcoming</p>
                <h3 className="text-white font-black text-xl">대회 일정</h3>
              </div>
              <Link href="/events" className="text-accent text-sm font-semibold hover:text-accent-light transition-colors">전체보기</Link>
            </div>
            <div className="relative p-5 space-y-3">
              {upcomingEvents.map((event) => {
                const d = new Date(event.date);
                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="block group">
                    <div className="flex gap-4 p-4 rounded-2xl bg-white/3 border border-border-custom hover:border-accent/20 transition-all">
                      <div className="w-14 shrink-0 text-center">
                        <p className="gold-text-shine text-2xl font-black leading-none">{d.getDate()}</p>
                        <p className="text-muted text-xs mt-1">{d.getMonth() + 1}월</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-base font-bold truncate group-hover:text-accent transition-colors">{event.title}</p>
                        <p className="text-muted text-sm mt-1">{event.store_name}</p>
                      </div>
                      {event.prize && <span className="gold-btn text-dark text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 self-start shadow-sm">{event.prize}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notices + CTA */}
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-3xl border border-border-custom overflow-hidden relative noise">
              <div className="absolute top-4 right-4 text-5xl text-white/[0.02] font-serif select-none">♣</div>
              <div className="relative p-7 border-b border-border-custom flex justify-between items-end">
                <div>
                  <p className="text-accent uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Notice</p>
                  <h3 className="text-white font-black text-xl">공지사항</h3>
                </div>
                <Link href="/notices" className="text-accent text-sm font-semibold hover:text-accent-light transition-colors">전체보기</Link>
              </div>
              <div className="relative p-5">
                {notices.map((notice) => (
                  <Link key={notice.id} href={`/notices/${notice.id}`} className="flex items-center gap-3 py-3.5 group border-b border-border-custom/50 last:border-0">
                    <span className="w-2 h-2 rounded-full gold-shine shrink-0" />
                    <p className="text-sub text-base truncate flex-1 group-hover:text-white transition-colors">{notice.title}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden flex-1 gold-border noise">
              <div className="absolute inset-0 felt-gradient opacity-30" />
              <div className="absolute inset-0 bg-linear-to-br from-dark/60 to-dark/80" />
              <div className="relative p-8 h-full flex flex-col justify-between min-h-52">
                <div>
                  <h3 className="text-white font-black text-2xl mb-2">매장을 등록하세요</h3>
                  <p className="text-sub text-base">전국 유저에게 매장을 홍보하세요</p>
                </div>
                <Link href="/contact" className="gold-btn text-dark text-base font-bold px-8 py-3.5 rounded-full shadow-lg shadow-accent/25 self-start inline-block mt-6 hover:-translate-y-0.5 transition-all">
                  등록 문의 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4"><div className="glow-line" /></div>

      {/* ─── Regions ─── */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
        <h2 className="text-2xl font-black text-white mb-8">지역별 매장</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { region: "서울", count: stores.filter(s => s.region === "서울").length, desc: "강남, 홍대, 잠실 등", suit: "♠" },
            { region: "경기", count: stores.filter(s => s.region === "경기").length, desc: "판교, 수원, 일산 등", suit: "♦" },
            { region: "인천", count: stores.filter(s => s.region === "인천").length, desc: "부평, 송도 등", suit: "♣" },
          ].map((r) => (
            <Link key={r.region} href={`/map?q=${r.region}`} className="group">
              <div className="bg-card rounded-3xl p-8 border border-border-custom hover:border-accent/40 transition-all group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent/8 relative overflow-hidden noise">
                <span className="absolute top-4 right-6 text-8xl text-white/[0.02] font-serif select-none">{r.suit}</span>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-black text-3xl">{r.region}</h3>
                    <span className="gold-text-shine text-4xl font-black">{r.count}</span>
                  </div>
                  <p className="text-muted text-base mb-6">{r.desc}</p>
                  <span className="text-accent text-base font-semibold group-hover:text-accent-light transition-colors">매장 보기 →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
