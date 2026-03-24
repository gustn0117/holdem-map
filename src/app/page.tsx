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
      <Header />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden noise">
        <div className="absolute inset-0 felt-gradient opacity-20" />
        <div className="absolute inset-0 bg-linear-to-b from-dark/80 via-dark/60 to-dark" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-200 h-80 bg-accent/5 rounded-full blur-[180px]" />

        {/* Floating suit symbols */}
        <div className="absolute top-20 left-[10%] text-7xl text-white/[0.03] font-serif select-none">♠</div>
        <div className="absolute top-40 right-[12%] text-8xl text-red/[0.04] font-serif select-none">♥</div>
        <div className="absolute bottom-20 left-[20%] text-6xl text-red/[0.03] font-serif select-none">♦</div>
        <div className="absolute bottom-32 right-[18%] text-7xl text-white/[0.03] font-serif select-none">♣</div>

        <div className="absolute bottom-0 left-0 right-0 glow-line" />

        <div className="relative max-w-3xl mx-auto px-4 pt-28 md:pt-36 pb-28 text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="text-red text-lg">♥</span>
            <span className="text-accent uppercase tracking-[0.3em] text-sm font-bold">Find Your Table</span>
            <span className="text-white text-lg">♠</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
            홀덤 매장,<br />
            <span className="gold-text-shine">한눈에.</span>
          </h1>
          <p className="text-sub text-lg md:text-xl mb-14 max-w-lg mx-auto leading-relaxed font-light">
            매장 위치부터 대회 일정까지<br />가까운 홀덤 매장을 찾아보세요
          </p>
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar large />
          </div>
          <div className="flex justify-center items-center gap-3 flex-wrap">
            {["강남", "홍대", "수원", "일산", "잠실"].map((k) => (
              <Link key={k} href={`/map?q=${k}`} className="text-muted hover:text-white text-sm bg-white/5 hover:bg-white/10 border border-white/8 rounded-full px-5 py-2.5 transition-all hover:-translate-y-0.5">
                {k}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <section className="border-y border-border-custom py-4 overflow-hidden bg-card/50">
        <div className="flex whitespace-nowrap marquee">
          {Array(2).fill(null).map((_, i) => (
            <div key={i} className="flex items-center gap-6 mr-6 text-sm">
              <span className="text-muted">TEXAS HOLD&apos;EM</span><span className="suit-red">♦</span>
              <span className="text-muted">토너먼트</span><span className="text-white/30">♠</span>
              <span className="text-muted">CASH GAME</span><span className="suit-red">♥</span>
              <span className="text-muted">매장 검색</span><span className="text-white/30">♣</span>
              <span className="text-muted">ALL-IN</span><span className="suit-red">♦</span>
              <span className="text-muted">서울 · 경기 · 인천</span><span className="text-white/30">♠</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="max-w-5xl mx-auto px-4 py-20 w-full">
        <div className="flex items-center gap-2 justify-center mb-3">
          <span className="suit-red text-sm">♦</span>
          <p className="text-accent uppercase tracking-[0.3em] text-xs font-bold">Quick Search</p>
          <span className="suit-red text-sm">♦</span>
        </div>
        <h2 className="text-3xl font-black text-white text-center mb-12">카테고리로 찾기</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "토너먼트", tag: "토너먼트", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
            { label: "초보환영", tag: "초보환영", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "프리미엄", tag: "프리미엄", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
            { label: "주차가능", tag: "주차가능", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
            { label: "야간운영", tag: "야간운영", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" },
          ].map((cat) => (
            <Link key={cat.label} href={`/map?q=${cat.tag}`} className="group text-center">
              <div className="aspect-square rounded-3xl bg-card border border-border-custom group-hover:border-accent/40 flex items-center justify-center transition-all group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-accent/10 relative overflow-hidden">
                <div className="absolute inset-0 felt-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
                <svg className="w-8 h-8 md:w-10 md:h-10 text-accent relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                </svg>
              </div>
              <p className="text-muted text-sm font-semibold mt-3 group-hover:text-white transition-colors">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4"><div className="glow-line" /></div>

      {/* ─── Map ─── */}
      <section className="max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/30 text-sm">♠</span>
              <p className="text-accent uppercase tracking-[0.3em] text-xs font-bold">Explore</p>
            </div>
            <h2 className="text-3xl font-black text-white">매장 지도</h2>
          </div>
          <div className="flex gap-1.5 bg-card rounded-full p-1.5 border border-border-custom">
            {regions.map((r) => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${selectedRegion === r ? "gold-btn text-dark shadow-md" : "text-muted hover:text-white"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-110 lg:h-150 rounded-3xl overflow-hidden border border-border-custom">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-3 lg:h-150 lg:overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-base"><span className="gold-text-shine font-black text-3xl mr-2">{filteredStores.length}</span>곳</p>
              <Link href="/map" className="text-accent hover:text-accent-light text-base font-semibold transition-colors">전체보기 →</Link>
            </div>
            {filteredStores.map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)}
                className={`rounded-2xl transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent/50" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4"><div className="glow-line" /></div>

      {/* ─── 3 Column ─── */}
      <section className="max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recommended */}
          <div className="bg-card rounded-3xl border border-border-custom overflow-hidden gold-border relative noise">
            <div className="absolute top-4 right-4 text-5xl text-accent/5 font-serif select-none">♠</div>
            <div className="relative p-7 border-b border-border-custom">
              <p className="text-accent uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Editor&apos;s Pick ♦</p>
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
                <p className="text-accent uppercase tracking-[0.2em] text-[10px] font-bold mb-1">Upcoming ♣</p>
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

            {/* CTA */}
            <div className="relative rounded-3xl overflow-hidden flex-1 gold-border noise">
              <div className="absolute inset-0 felt-gradient opacity-30" />
              <div className="absolute inset-0 bg-linear-to-br from-dark/60 to-dark/80" />
              <div className="relative p-8 h-full flex flex-col justify-between min-h-52">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="suit-red text-lg">♥</span>
                    <span className="text-white/30 text-lg">♠</span>
                  </div>
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
      <section className="max-w-5xl mx-auto px-4 py-20 w-full">
        <div className="flex items-center gap-2 justify-center mb-3">
          <span className="text-white/30 text-sm">♣</span>
          <p className="text-accent uppercase tracking-[0.3em] text-xs font-bold">Regions</p>
          <span className="suit-red text-sm">♥</span>
        </div>
        <h2 className="text-3xl font-black text-white text-center mb-12">지역별 매장</h2>
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
