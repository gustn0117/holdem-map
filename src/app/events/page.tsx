"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEvents } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";

type RegionTab = "all" | "domestic" | "international";
type SortKey = "date" | "recent" | "prize";

const parsePrizeKRW = (s?: string): number => {
  if (!s) return 0;
  const txt = s.replace(/[\s,₩원]/g, "");
  const m = txt.match(/([\d.]+)\s*(억|만|천|백)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2];
  if (unit === "억") return n * 1e8;
  if (unit === "만") return n * 1e4;
  if (unit === "천") return n * 1e3;
  if (unit === "백") return n * 1e2;
  return n;
};

export default function EventsPage() {
  const { events, loading } = useEvents();
  const { user } = useAuth();
  const [regionTab, setRegionTab] = useState<RegionTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter(e => {
    if (regionTab === "all") return true;
    if (regionTab === "international") return !!e.is_international;
    return !e.is_international;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortKey === "recent") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortKey === "prize") {
      return parsePrizeKRW(b.prize) - parsePrizeKRW(a.prize);
    }
    // date (default): upcoming first by start date, then past desc
    const aEnd = new Date(a.end_date || a.date).getTime();
    const bEnd = new Date(b.end_date || b.date).getTime();
    const aUpcoming = aEnd >= today.getTime();
    const bUpcoming = bEnd >= today.getTime();
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    const aStart = new Date(a.date).getTime();
    const bStart = new Date(b.date).getTime();
    return aUpcoming ? aStart - bStart : bStart - aStart;
  });

  const counts = {
    all: events.length,
    domestic: events.filter(e => !e.is_international).length,
    international: events.filter(e => e.is_international).length,
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-surface">대회 / 이벤트</h1>
            <p className="text-muted text-base mt-2">다가오는 홀덤 대회 일정을 확인하세요</p>
          </div>
          <span className="text-muted text-base">
            총 <span className="text-accent font-bold text-xl">{sortedEvents.length}</span>개
          </span>
        </div>

        {/* Region tabs */}
        <div className="flex bg-bg rounded-xl p-1 mb-4">
          {([
            { k: "all" as RegionTab, l: `전체 ${counts.all}`, type: "all" },
            { k: "domestic" as RegionTab, l: `국내 ${counts.domestic}`, type: "domestic" },
            { k: "international" as RegionTab, l: `해외 ${counts.international}`, type: "international" },
          ]).map(t => (
            <button key={t.k} onClick={() => setRegionTab(t.k)}
              className={`flex-1 py-2.5 rounded-lg text-[13px] md:text-[14px] font-bold transition-all inline-flex items-center justify-center gap-1 ${regionTab === t.k ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
              {t.type === "domestic" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v14H3z" fill="#fff" stroke="currentColor" strokeWidth="1"/><circle cx="12" cy="12" r="3" fill="#cd2e3a"/><path d="M9.5 12a2.5 2.5 0 015 0" fill="#0047a0"/></svg>}
              {t.type === "international" && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>}
              {t.l}
            </button>
          ))}
        </div>

        {/* Sort + register */}
        <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {([
              { k: "date" as SortKey, l: "빠른 날짜순" },
              { k: "recent" as SortKey, l: "최신 등록순" },
              { k: "prize" as SortKey, l: "상금순" },
            ]).map(s => (
              <button key={s.k} onClick={() => setSortKey(s.k)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${sortKey === s.k ? "bg-accent text-white border-accent" : "bg-white text-sub border-border-custom hover:border-accent/40"}`}>
                {s.l}
              </button>
            ))}
          </div>
          {user ? (
            <Link href="/events/write" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-accent/20 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              대회 등록
            </Link>
          ) : (
            <Link href="/login" className="text-accent text-sm font-semibold hover:underline">로그인 후 대회 등록하기 →</Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {sortedEvents.map((event, i) => {
              const eventDate = new Date(event.date);
              const today = new Date();
              const daysUntil = Math.ceil(
                (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUpcoming = daysUntil >= 0 && daysUntil <= 3;

              return (
                <Link key={event.id} href={`/events/${event.id}`} className="block group anim-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="bg-card rounded-xl border border-border-custom hover:border-accent/30 transition-all overflow-hidden h-full flex flex-col">
                    {/* Image banner */}
                    <div className="relative h-28 md:h-40 bg-accent/5 overflow-hidden">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      {/* Date chip overlay */}
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur rounded-lg px-2 py-1 shadow-sm">
                        <p className="text-accent text-[13px] md:text-[15px] font-black leading-none text-center">{eventDate.getDate()}</p>
                        <p className="text-muted text-[9px] md:text-[10px] text-center">{eventDate.getMonth() + 1}월</p>
                      </div>
                      {/* D-day chip */}
                      {isUpcoming && (
                        <span className="absolute top-2 right-2 bg-accent text-dark text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md">
                          {daysUntil === 0 ? "TODAY" : `D-${daysUntil}`}
                        </span>
                      )}
                      {/* Prize badge bottom-right */}
                      {event.prize && (
                        <span className="absolute bottom-2 right-2 bg-accent text-dark px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[11px] md:text-[12px] font-bold shadow-md shadow-accent/15 max-w-[65%] truncate">
                          {event.prize}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        <span className={`text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${event.is_international ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-700"}`}>
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18" /></svg>
                          {event.is_international ? "해외" : "국내"}
                        </span>
                      </div>
                      <h2 className="text-surface font-bold text-[14px] md:text-[17px] leading-tight group-hover:text-accent transition-colors line-clamp-2 mb-1.5">{event.title}</h2>
                      {(event.location || event.store_name) && (
                        <p className="text-accent text-[11px] md:text-[13px] mb-1.5 line-clamp-1">📍 {event.location || event.store_name}</p>
                      )}
                      {event.description && (
                        <p className="text-sub text-[12px] md:text-[13px] leading-snug line-clamp-2 mb-2 hidden md:block">{event.description}</p>
                      )}
                      <div className="mt-auto pt-2 border-t border-border-custom/60 flex items-center gap-2 flex-wrap text-[10px] md:text-[12px] text-muted">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {event.date?.slice(5)}{event.end_date && event.end_date !== event.date && `~${event.end_date.slice(5)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
