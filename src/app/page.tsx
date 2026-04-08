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
import { supabase } from "@/lib/supabase";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Post { id: string; title: string; nickname: string; views: number; created_at: string; }

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { stores } = useStores();
  const { events } = useEvents();
  const { notices } = useNotices();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [shorts, setShorts] = useState<Short[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [liveGames, setLiveGames] = useState<any[]>([]);

  useEffect(() => {
    getBanners().then(setBanners);
    getShorts().then(setShorts);
    getJobs().then(setJobs);
    supabase.from("posts").select("id,title,nickname,views,created_at").order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => setPosts(data || []));
    supabase.from("live_games").select("*").in("status", ["진행중", "대기중"]).order("updated_at", { ascending: false })
      .then(({ data }) => setLiveGames(data || []));
  }, []);

  const sideBanners = banners.filter(b => b.position.startsWith("side")).sort((a, b) => a.position.localeCompare(b.position));
  const filteredStores = selectedRegion === "전체" ? stores : stores.filter((s) => s.region === selectedRegion);
  const recommendedStores = stores.filter((s) => s.is_recommended);
  const upcomingEvents = events.slice(0, 3);

  // ── Shared Components ──

  const BoardSection = () => (
    <div className="rounded-2xl overflow-hidden card-shadow bg-white">
      <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
        <h3 className="text-surface font-bold text-[15px]">자유게시판</h3>
        <Link href="/board" className="text-accent text-[12px] font-semibold hover:underline">더보기 →</Link>
      </div>
      <div className="p-2">
        {posts.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-muted text-[13px]">아직 게시글이 없습니다</p>
            <Link href="/board/write" className="text-accent text-[12px] font-semibold mt-1 inline-block hover:underline">첫 글 작성하기 →</Link>
          </div>
        ) : posts.map((post) => (
          <Link key={post.id} href={`/board/${post.id}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-bg group transition">
            <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
            <p className="text-sub text-[13px] truncate flex-1 group-hover:text-accent transition-colors">{post.title}</p>
            <span className="text-muted text-[11px] shrink-0">{post.nickname}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  const EventsSection = () => (
    <div className="rounded-2xl overflow-hidden card-shadow bg-white">
      <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
        <h3 className="text-surface font-bold text-[15px]">진행중인 대회</h3>
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
  );

  const RecommendedSection = () => (
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
  );

  const NoticesSection = () => (
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
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      {/* ════════════════════════════════════════════
           MOBILE LAYOUT
         ════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* 1. 구인구직 (티커) */}
        {jobs.length > 0 && (
          <section className="border-b border-border-custom bg-white">
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-red-500 text-[12px] font-extrabold">실시간</span>
                  </div>
                  <h3 className="text-surface text-[15px] font-extrabold">구인구직</h3>
                </div>
                <Link href="/jobs" className="text-accent text-[12px] font-semibold">전체보기 →</Link>
              </div>
            </div>
            <div className="relative h-25 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />
              <div className="ticker-scroll px-4">
                {[...jobs, ...jobs].map((job, i) => (
                  <Link key={`${job.id}-${i}`} href={`/jobs/${job.id}`} className="flex items-center gap-3 py-2.5 group">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                      job.type === "구인" ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}>{job.type}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-surface text-[14px] font-bold truncate">{job.nickname}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${job.role === "딜러" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-600"}`}>{job.role}</span>
                      </div>
                      <p className="text-sub text-[12px] truncate">{job.areas.slice(0, 2).join(", ")}{job.store_name ? ` · ${job.store_name}` : ""}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#ccc] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. 실시간 게임/토너/대회/레이크 (티커) */}
        <section className="border-b border-border-custom bg-white">
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <h3 className="text-surface text-[15px] font-extrabold">실시간 현황</h3>
              </div>
              <Link href="/live" className="text-accent text-[12px] font-semibold">전체보기 →</Link>
            </div>
          </div>
          {liveGames.length > 0 ? (
            <div className="relative h-25 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />
              <div className="ticker-scroll px-4" style={{ animationDuration: "18s" }}>
                {[...liveGames, ...liveGames].map((game, i) => (
                  <Link key={`${game.id}-${i}`} href="/live" className="flex items-center gap-3 py-2.5 group">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                      game.category === "게임" ? "bg-blue-100 text-blue-600 border border-blue-200" :
                      game.category === "토너" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                      game.category === "대회" ? "bg-red-100 text-red-600 border border-red-200" :
                      "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>{game.category}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-surface text-[14px] font-bold truncate">{game.title}</p>
                        {game.players_current > 0 && (
                          <span className="text-[10px] font-bold text-accent bg-accent/8 px-1.5 py-0.5 rounded">{game.players_current}{game.players_max > 0 ? `/${game.players_max}` : ""}명</span>
                        )}
                      </div>
                      <p className="text-sub text-[12px] truncate">{game.store_name}{game.blind ? ` · ${game.blind}` : ""}{game.prize ? ` · ${game.prize}` : ""}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#ccc] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 pb-3">
              <Link href="/live" className="block text-center py-4 text-muted text-[13px]">현재 진행중인 현황이 없습니다 <span className="text-accent font-semibold">등록하기 →</span></Link>
            </div>
          )}
        </section>

        {/* 이벤트 배너 */}
        <section className="px-4 pb-2 pt-3">
          <Link href="/promotions" className="block rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-[#1a2744] via-[#1e3a8a] to-[#2563eb]" />
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-blue-300 bg-blue-400/20 px-1.5 py-0.5 rounded-full uppercase">EVENT</span>
                <p className="text-white text-[15px] font-black leading-tight mt-0.5">진행중인 이벤트</p>
                <p className="text-white/50 text-[11px]">특별 혜택과 프로모션을 확인하세요</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-all">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        </section>

        {/* 3. 자유게시판 (티커) */}
        <section className="border-b border-border-custom bg-white">
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-surface text-[15px] font-extrabold">자유게시판</h3>
              <Link href="/board" className="text-accent text-[12px] font-semibold">더보기 →</Link>
            </div>
          </div>
          {posts.length === 0 ? (
            <div className="px-4 pb-4 text-center">
              <p className="text-muted text-[13px] py-4">아직 게시글이 없습니다</p>
            </div>
          ) : (
            <div className="relative h-25 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />
              <div className="ticker-scroll px-4" style={{ animationDuration: "15s" }}>
                {[...posts, ...posts].map((post, i) => (
                  <Link key={`${post.id}-${i}`} href={`/board/${post.id}`} className="flex items-center gap-3 py-2.5 group">
                    <span className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface text-[14px] font-bold truncate">{post.title}</p>
                      <p className="text-sub text-[12px]">{post.nickname} · 조회 {post.views}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#ccc] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. 진행중인 대회 */}
        <section className="px-4 py-5"><EventsSection /></section>

        {/* 4. 무료 토너먼트 배너 */}
        <section className="px-4 pb-5">
          <Link href="/tournament" className="block rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-br from-[#002a15] via-[#00693a] to-[#00874a]" />
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v4M8 4v4M4 8h16M12 14v3m-4-1.5h8M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-yellow-300 bg-yellow-400/15 px-1.5 py-0.5 rounded-full border border-yellow-400/20 uppercase">FREE</span>
                <p className="text-white text-[15px] font-black leading-tight mt-0.5">무료 토너먼트 신청</p>
                <p className="text-white/50 text-[11px]">가입만 하면 무료 참가 + 바인권 지급</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-all">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        </section>

        {/* 5. 지도 */}
        <section className="section-alt border-y border-border-custom px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-surface">매장 지도</h2>
            <Link href="/map" className="text-accent text-[12px] font-semibold hover:underline">크게 보기 →</Link>
          </div>
          <div className="h-72 rounded-2xl overflow-hidden card-shadow">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
          </div>
        </section>

        {/* 6. 홀덤 매장 목록 */}
        <section className="px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-surface">홀덤 매장</h2>
            <Link href="/map" className="text-accent text-[12px] font-semibold hover:underline">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredStores.map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)}
                className={`transition-all cursor-pointer rounded-2xl ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </section>

        {/* 7. 추천 매장 */}
        <section className="px-4 pb-5"><RecommendedSection /></section>

        {/* 8. 공지사항 */}
        <section className="px-4 pb-5"><NoticesSection /></section>
      </div>

      {/* ════════════════════════════════════════════
           PC LAYOUT
         ════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Map + Ads */}
        <section className="section-alt border-b border-border-custom">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-surface">매장 지도</h2>
              <div className="flex items-center gap-2.5">
                <span className="text-muted text-[13px]"><span className="text-accent font-bold">{filteredStores.length}</span>곳</span>
                <Link href="/map" className="flex items-center gap-1 text-[13px] text-sub hover:text-accent font-medium transition-colors">
                  크게 보기
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </Link>
              </div>
            </div>
            <div className="h-80 lg:h-110 rounded-2xl overflow-hidden card-shadow">
              <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
            </div>
          </div>
        </section>

        {/* PC: 이벤트 + 토너먼트 배너 */}
        <section className="border-b border-border-custom">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-6">
            <div className="grid grid-cols-2 gap-4">
              {/* 이벤트 */}
              <Link href="/promotions" className="block rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-linear-to-br from-[#1a2744] via-[#1e3a8a] to-[#2563eb]" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="relative px-6 py-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-blue-300 bg-blue-400/20 px-2 py-0.5 rounded-full uppercase">EVENT</span>
                    <p className="text-white text-lg font-black mt-1">진행중인 이벤트</p>
                    <p className="text-white/50 text-[13px]">특별 혜택과 프로모션 확인</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>

              {/* 무료 토너먼트 */}
              <Link href="/tournament" className="block rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-linear-to-br from-[#002a15] via-[#00693a] to-[#00874a]" />
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="relative px-6 py-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v4M8 4v4M4 8h16M12 14v3m-4-1.5h8M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-yellow-300 bg-yellow-400/15 px-2 py-0.5 rounded-full border border-yellow-400/20 uppercase">FREE</span>
                    <p className="text-white text-lg font-black mt-1">무료 토너먼트 신청</p>
                    <p className="text-white/50 text-[13px]">가입만 하면 무료 참가 + 바인권</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* PC Jobs */}
        <section className="border-b border-border-custom">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-red-500 text-[13px] font-extrabold">실시간</span>
                <h2 className="text-[17px] font-bold text-surface">구인구직</h2>
              </div>
              <Link href="/jobs" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            {jobs.length === 0 ? (
              <div className="rounded-2xl card-shadow bg-white px-5 py-8 text-center">
                <p className="text-muted text-[13px]">등록된 구직글이 없습니다</p>
                <Link href="/jobs/write" className="text-accent text-[12px] font-semibold mt-1 inline-block hover:underline">구직글 작성하기 →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {jobs.slice(0, 8).map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="rounded-2xl card-shadow bg-white p-4 hover:bg-bg transition group">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${job.type === "구인" ? "bg-blue-50 text-blue-500" : "bg-accent-light text-accent"}`}>
                        {job.type === "구인" ? "구인" : "구직"}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${job.role === "딜러" ? "bg-accent-light text-accent" : "bg-blue-50 text-blue-500"}`}>{job.role}</span>
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{job.nickname}</p>
                    <p className="text-muted text-[12px] mt-0.5 truncate">{job.areas.slice(0, 2).join(", ")}</p>
                    {job.store_name && <p className="text-muted text-[11px] mt-0.5 truncate">{job.store_name}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PC Store List */}
        <section>
          <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-surface">매장 목록</h2>
              <Link href="/map" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                  <Link key={short.id} href="/shorts" className="shrink-0 w-32 group">
                    <div className="aspect-9/16 rounded-2xl overflow-hidden card-shadow relative group-hover:card-shadow-hover transition-shadow">
                      <video src={short.video_url} poster={short.thumbnail || undefined} className="w-full h-full object-cover" muted loop playsInline autoPlay={i === 0} />
                      {i === 0 && <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full pulse-dot" />LIVE</div>}
                    </div>
                    <p className="text-surface text-[12px] font-semibold mt-2 truncate">{short.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PC Bottom Grid */}
        <section>
          <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
            <div className="grid grid-cols-2 gap-4">
              <RecommendedSection />
              <EventsSection />
              <BoardSection />
              <NoticesSection />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
