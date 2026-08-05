"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import RankInsignia from "@/components/RankInsignia";
import HomeSeoSection from "@/components/HomeSeoSection";
import ShortsLightbox from "@/components/ShortsLightbox";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { useUserProfiles } from "@/hooks/useUserRanks";
import { getBanners, getShorts, getJobs } from "@/lib/api";
import { Store, Banner, Short, Job } from "@/types";
import { stripHtml } from "@/lib/sanitize";
import { supabase } from "@/lib/supabase";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Post { id: string; title: string; nickname: string; views: number; created_at: string; user_id?: string | null; }

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
  const [shortsIdx, setShortsIdx] = useState<number | null>(null);
  const [showAllStores, setShowAllStores] = useState(false);
  const PC_STORE_PREVIEW = 6;

  useEffect(() => {
    getBanners().then(setBanners);
    getShorts().then(setShorts);
    getJobs().then(setJobs);
    supabase.from("posts").select("id,title,nickname,views,created_at,user_id").order("pinned_rank", { ascending: false }).order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => setPosts(data || []));
    supabase.from("live_games").select("*").in("status", ["진행중", "대기중"]).order("pinned_rank", { ascending: false }).order("updated_at", { ascending: false })
      .then(({ data }) => setLiveGames(data || []));
  }, []);

  const postProfiles = useUserProfiles(posts.map(p => p.user_id));
  const sideBanners = banners.filter(b => b.position.startsWith("side")).sort((a, b) => a.position.localeCompare(b.position));
  const mainBanner = banners.find(b => b.position === "main");
  const mainBannerPC = mainBanner?.image;
  const mainBannerMobile = mainBanner?.image_mobile || mainBanner?.image;
  const filteredStores = selectedRegion === "전체" ? stores : stores.filter((s) => s.region === selectedRegion);
  const recommendedStores = stores.filter((s) => s.is_recommended);
  const hotStores = stores.filter((s) => s.is_hot).slice(0, 5);
  const recentStores = [...stores].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const upcomingEvents = [...events]
    .filter(e => new Date(e.end_date || e.date).getTime() >= todayMs)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const timeAgo = (date: string) => {
    if (!date) return "";
    const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (m < 1) return "방금"; if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  };

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
        ) : posts.map((post) => {
          const pf = post.user_id ? postProfiles[post.user_id] : undefined;
          const r = pf?.rank;
          const displayName = pf?.nickname || post.nickname;
          return (
          <Link key={post.id} href="/board" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-bg group transition">
            <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
            <p className="text-sub text-[13px] truncate flex-1 group-hover:text-accent transition-colors">{post.title}</p>
            <span className="text-muted text-[11px] shrink-0 inline-flex items-center gap-1">
              {r && <span className={`inline-flex items-center rounded px-1 ${r.color}`}><RankInsignia rank={r} size="xs" /></span>}
              {displayName}
            </span>
          </Link>
          );
        })}
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
      <Link href="/recommended" className="px-5 py-4 border-b border-border-custom flex items-center justify-between gap-2 hover:bg-bg transition group">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.6 7.6h7.9l-6.4 4.7 2.4 7.7L12 17.3 5.5 22l2.4-7.7-6.4-4.7h7.9z" /></svg>
          </span>
          <h3 className="text-surface font-bold text-[15px] group-hover:text-accent transition-colors">추천 매장</h3>
        </div>
        <span className="text-accent text-[12px] font-semibold">더보기 →</span>
      </Link>
      <div className="p-2">
        {recommendedStores.slice(0, 5).map((store, i) => (
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
                <Link href="/jobs" className="text-surface text-[15px] font-extrabold hover:text-accent transition-colors">구인구직</Link>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/jobs/write" className="text-white text-[11px] font-bold bg-accent px-2.5 py-1 rounded-full">등록하기</Link>
                <Link href="/jobs" className="text-accent text-[12px] font-semibold">전체보기 →</Link>
              </div>
            </div>
          </div>
          {jobs.length > 0 ? (
            <>
            <div className="relative h-25 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />
              <div className="ticker-scroll px-4">
                {[...jobs, ...jobs].map((job, i) => (
                  <Link key={`${job.id}-${i}`} href="/jobs" className="flex items-center gap-3 py-2.5 group">
                    {job.photo ? (
                      <img src={job.photo} alt={job.nickname} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                        job.type === "구인" ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}>{job.type}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-surface text-[14px] font-bold truncate">{job.nickname}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${job.role === "딜러" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-600"}`}>{job.role}</span>
                        <span className="text-[10px] text-muted">{timeAgo(job.created_at || "")}</span>
                      </div>
                      <p className="text-sub text-[12px] truncate">{job.message ? stripHtml(job.message) : `${job.areas?.slice(0, 2).join(", ") || ""}${job.store_name ? ` · ${job.store_name}` : ""}`}</p>
                    </div>
                    <svg className="w-4 h-4 text-[#ccc] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
            </>
          ) : (
            <div className="px-4 pb-3">
              <Link href="/jobs/write" className="block text-center py-4 text-muted text-[13px]">아직 구직/구인글이 없습니다 <span className="text-accent font-semibold">등록하기 →</span></Link>
            </div>
          )}
        </section>

        {/* 2. 실시간 게임/토너/대회/레이크 (티커) */}
        <section className="border-b border-border-custom bg-white">
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-red-500 text-[12px] font-extrabold">LIVE</span>
                <Link href="/live" className="text-surface text-[14px] font-extrabold hover:text-accent transition-colors">진행중인 토너/대회/레이크</Link>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/live" className="text-white text-[11px] font-bold bg-accent px-2.5 py-1 rounded-full">등록하기</Link>
                <Link href="/live" className="text-accent text-[12px] font-semibold">전체보기 →</Link>
              </div>
            </div>
          </div>
          {liveGames.length > 0 ? (
            <div className="relative h-25 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />
              <div className="ticker-scroll px-4">
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
          <Link href="/banners" className="block rounded-2xl overflow-hidden relative group">
            <img src="/event-banner.jpeg" alt="진행중인 이벤트" className="w-full h-20 object-cover block group-hover:brightness-110 transition-all" />
          </Link>
        </section>

        {/* 3. 자유게시판 */}
        <section className="border-b border-border-custom bg-white">
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between mb-1">
              <Link href="/board" className="text-surface text-[15px] font-extrabold hover:text-accent transition-colors">자유게시판</Link>
              <div className="flex items-center gap-2">
                <Link href="/board/write" className="text-white text-[11px] font-bold bg-accent hover:bg-accent-hover px-2.5 py-1 rounded-full transition-all">글쓰기</Link>
                <Link href="/board" className="text-accent text-[12px] font-semibold">전체보기 →</Link>
              </div>
            </div>
          </div>
          {posts.length === 0 ? (
            <div className="px-4 pb-4 text-center">
              <Link href="/board/write" className="block py-4 text-muted text-[13px]">아직 게시글이 없습니다 <span className="text-accent font-semibold">첫 글 작성 →</span></Link>
            </div>
          ) : (
            <div className="px-4 pb-3">
              {posts.slice(0, 4).map(post => {
                const pf = post.user_id ? postProfiles[post.user_id] : undefined;
                const r = pf?.rank;
                const displayName = pf?.nickname || post.nickname;
                return (
                <Link key={post.id} href="/board" className="flex items-center gap-3 py-2.5 border-b border-border-custom/50 last:border-b-0 group">
                  <span className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{post.title}</p>
                    <p className="text-sub text-[12px] inline-flex items-center gap-1">
                      {r && <span className={`inline-flex items-center rounded px-1 ${r.color}`}><RankInsignia rank={r} size="xs" /></span>}
                      {displayName} · 조회 {post.views}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-[#ccc] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                );
              })}
            </div>
          )}
        </section>


        {/* 4. 지도 */}
        <section className="section-alt border-y border-border-custom px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-surface">매장 지도</h2>
            <Link href="/map" className="text-accent text-[12px] font-semibold hover:underline">크게 보기 →</Link>
          </div>
          {/* 좌우 여백(mx)으로 페이지를 아래로 스크롤할 통로 확보 */}
          <div className="h-60 mx-6 rounded-2xl overflow-hidden card-shadow">
            <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} embedded />
          </div>
        </section>

        {/* 5. 무료 토너먼트 배너 */}
        <section className="px-4 py-5">
          <Link href="/tournament" className="block rounded-2xl overflow-hidden relative group">
            <img src={mainBannerMobile || "/tournament-banner.jpeg"} alt="무료 토너먼트 신청"
              className="w-full h-20 object-cover block group-hover:brightness-110 transition-all" />
          </Link>
        </section>

        {/* 6. HOT 매장 */}
        {hotStores.length > 0 && (
          <section className="px-4 py-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>
                  HOT
                </span>
                <h2 className="text-[17px] font-bold text-surface">인기 매장</h2>
              </div>
              <Link href="/map" className="text-accent text-[12px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {hotStores.map(store => (
                <div key={store.id} onClick={() => setSelectedStore(store)}
                  className={`transition-all cursor-pointer rounded-2xl ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
                  <StoreCard store={store} isHot />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. 매장 정보 (5개) */}
        <section className="px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-surface">매장 정보</h2>
            <Link href="/map" className="text-accent text-[12px] font-semibold hover:underline">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredStores.slice(0, 5).map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)}
                className={`transition-all cursor-pointer rounded-2xl ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </section>

        {/* 8. 숏츠 */}
        {shorts.length > 0 && (
          <section className="section-alt border-y border-border-custom px-4 py-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-surface">숏츠</h2>
              <Link href="/shorts" className="text-accent text-[12px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4">
              {shorts.slice(0, 8).map((short, i) => (
                <button key={short.id} type="button" onClick={() => setShortsIdx(i)} className="shrink-0 w-32 group text-left" aria-label={`숏츠 재생: ${short.title}`}>
                  <div className="aspect-9/16 rounded-2xl overflow-hidden card-shadow relative">
                    <video src={short.video_url} poster={short.thumbnail || undefined} className="w-full h-full object-cover" muted loop playsInline autoPlay={i === 0} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/25 transition-opacity">
                      <span className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center">
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </span>
                    </div>
                    {i === 0 && <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full pulse-dot" />LIVE</div>}
                  </div>
                  <p className="text-surface text-[12px] font-semibold mt-2 truncate">{short.title}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 9. 추천 매장 */}
        <section className="px-4 pb-5 pt-5"><RecommendedSection /></section>

        {/* 10. 공지사항 */}
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
            {/* 크기를 줄이고 좌우 여백(max-w + mx-auto)을 둬서 화면을 꽉 채우지 않도록 */}
            <div className="h-72 lg:h-96 max-w-4xl mx-auto rounded-2xl overflow-hidden card-shadow">
              <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} embedded />
            </div>
          </div>
        </section>

        {/* PC: 이벤트 + 토너먼트 배너 */}
        <section className="border-b border-border-custom">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-6">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/banners" className="block rounded-2xl overflow-hidden group">
                <img src="/event-banner.jpeg" alt="진행중인 이벤트" className="w-full h-28 object-cover block group-hover:brightness-110 transition-all" />
              </Link>
              <Link href="/tournament" className="block rounded-2xl overflow-hidden group">
                <img src={mainBannerPC || "/tournament-banner.jpeg"} alt="무료 토너먼트 신청"
                  className="w-full h-28 object-cover block group-hover:brightness-110 transition-all" />
              </Link>
            </div>
          </div>
        </section>

        {/* PC LIVE: 실시간 토너/대회/레이크 */}
        <section className="border-b border-border-custom">
          <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-red-500 text-[13px] font-extrabold">LIVE</span>
                <h2 className="text-[17px] font-bold text-surface">진행중인 토너 · 대회 · 레이크</h2>
              </div>
              <Link href="/live" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
            </div>
            {liveGames.length === 0 ? (
              <div className="rounded-2xl card-shadow bg-white px-5 py-8 text-center">
                <p className="text-muted text-[13px]">현재 진행중인 현황이 없습니다</p>
                <Link href="/live" className="text-accent text-[12px] font-semibold mt-1 inline-block hover:underline">실시간 등록하기 →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {liveGames.slice(0, 8).map(game => (
                  <Link key={game.id} href="/live" className="rounded-2xl card-shadow bg-white p-4 hover:bg-bg transition group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        game.category === "게임" ? "bg-blue-100 text-blue-600" :
                        game.category === "토너" ? "bg-emerald-100 text-emerald-700" :
                        game.category === "대회" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>{game.category}</span>
                      {game.players_current > 0 && (
                        <span className="text-[10px] font-bold text-accent bg-accent/8 px-1.5 py-0.5 rounded">{game.players_current}{game.players_max > 0 ? `/${game.players_max}` : ""}명</span>
                      )}
                    </div>
                    <p className="text-surface text-[14px] font-bold truncate group-hover:text-accent transition-colors">{game.title}</p>
                    <p className="text-muted text-[12px] mt-0.5 truncate">{game.store_name}</p>
                    {(game.blind || game.prize) && (
                      <p className="text-muted text-[11px] mt-0.5 truncate">{[game.blind, game.prize].filter(Boolean).join(" · ")}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PC HOT 매장 */}
        {hotStores.length > 0 && (
          <section className="border-b border-border-custom">
            <div className="max-w-350 mx-auto px-5 md:px-10 py-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>
                  HOT
                </span>
                  <h2 className="text-[17px] font-bold text-surface">인기 매장</h2>
                </div>
                <Link href="/map" className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {hotStores.map(store => (
                  <div key={store.id} onClick={() => setSelectedStore(store)}
                    className={`transition-all cursor-pointer rounded-2xl ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
                    <StoreCard store={store} isHot />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
              <h2 className="text-[17px] font-bold text-surface">
                매장 목록
                <span className="text-muted text-[13px] font-normal ml-2">
                  ({showAllStores ? filteredStores.length : Math.min(PC_STORE_PREVIEW, filteredStores.length)} / {filteredStores.length})
                </span>
              </h2>
              <Link href="/map" className="text-muted text-[12px] hover:text-accent transition-colors">지도에서 보기 →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {(showAllStores ? filteredStores : filteredStores.slice(0, PC_STORE_PREVIEW)).map((store) => (
                <div key={store.id} onClick={() => setSelectedStore(store)}
                  className={`transition-all cursor-pointer rounded-2xl ${selectedStore?.id === store.id ? "ring-2 ring-accent" : ""}`}>
                  <StoreCard store={store} />
                </div>
              ))}
            </div>
            {filteredStores.length > PC_STORE_PREVIEW && (
              <div className="flex justify-center mt-6">
                <button onClick={() => setShowAllStores(v => !v)}
                  className="inline-flex items-center gap-2 bg-white border border-border-custom hover:border-accent hover:bg-accent-light text-sub hover:text-accent text-[14px] font-bold px-6 py-3 rounded-xl card-shadow transition-all">
                  {showAllStores ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      접기
                    </>
                  ) : (
                    <>
                      전체보기 ({filteredStores.length - PC_STORE_PREVIEW}개 더)
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </>
                  )}
                </button>
              </div>
            )}
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
                  <button key={short.id} type="button" onClick={() => setShortsIdx(i)} className="shrink-0 w-32 group text-left" aria-label={`숏츠 재생: ${short.title}`}>
                    <div className="aspect-9/16 rounded-2xl overflow-hidden card-shadow relative group-hover:card-shadow-hover transition-shadow">
                      <video src={short.video_url} poster={short.thumbnail || undefined} className="w-full h-full object-cover" muted loop playsInline autoPlay={i === 0} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/25 transition-opacity">
                        <span className="w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center">
                          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </span>
                      </div>
                      {i === 0 && <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full pulse-dot" />LIVE</div>}
                    </div>
                    <p className="text-surface text-[12px] font-semibold mt-2 truncate">{short.title}</p>
                  </button>
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

      <HomeSeoSection />

      {shortsIdx !== null && (
        <ShortsLightbox
          shorts={shorts.slice(0, 8)}
          index={shortsIdx}
          onClose={() => setShortsIdx(null)}
          onIndexChange={setShortsIdx}
        />
      )}

      <Footer />
    </div>
  );
}
