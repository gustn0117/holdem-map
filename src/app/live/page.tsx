"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEvents } from "@/hooks/useData";
import ImageUpload from "@/components/ImageUpload";

interface LiveGame {
  id: string; store_id: string; store_name: string; category: string;
  title: string; blind: string; buy_in: string; prize: string; rake: string;
  players_current: number; players_max: number; status: string;
  start_time: string; end_time: string | null; description: string;
  created_by: string | null; created_at: string; updated_at: string;
  image: string; contact_kakao: string; contact_telegram: string; contact_phone: string;
}

const CATEGORIES = ["전체", "토너", "대회", "레이크"];
const CATEGORY_COLORS: Record<string, string> = {
  "게임": "bg-blue-100 text-blue-600",
  "토너": "bg-emerald-100 text-emerald-700",
  "대회": "bg-red-100 text-red-600",
  "레이크": "bg-amber-100 text-amber-700",
};
const STATUS_COLORS: Record<string, string> = {
  "진행중": "bg-green-500",
  "대기중": "bg-yellow-500",
  "마감": "bg-gray-400",
  "종료": "bg-gray-300",
};

export default function LivePage() {
  const { user, profile } = useAuth();
  const { events } = useEvents();
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    store_name: "", category: "토너", title: "", blind: "", buy_in: "",
    prize: "", rake: "", players_current: 0, players_max: 0, description: "",
    image: "", contact_kakao: "", contact_telegram: "", contact_phone: "",
  });

  const fetchGames = () => {
    supabase.from("live_games").select("*")
      .in("status", ["진행중", "대기중"])
      .order("pinned_rank", { ascending: false })
      .order("updated_at", { ascending: false })
      .then(({ data }) => { setGames(data || []); setLoading(false); });
  };

  useEffect(() => { fetchGames(); const iv = setInterval(fetchGames, 30000); return () => clearInterval(iv); }, []);

  const filtered = category === "전체" ? games : games.filter(g => g.category === category);

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.store_name.trim()) { alert("매장명과 제목을 입력해주세요."); return; }
    setSaving(true);
    const { error } = await supabase.from("live_games").insert({
      store_name: form.store_name, category: form.category, title: form.title,
      blind: form.blind, buy_in: form.buy_in, prize: form.prize, rake: form.rake,
      players_current: form.players_current, players_max: form.players_max,
      description: form.description, created_by: user?.id,
      image: form.image, contact_kakao: form.contact_kakao, contact_telegram: form.contact_telegram, contact_phone: form.contact_phone,
    });
    if (error) { alert("등록에 실패했습니다."); setSaving(false); return; }
    setShowForm(false); setSaving(false);
    setForm({ store_name: "", category: "토너", title: "", blind: "", buy_in: "", prize: "", rake: "", players_current: 0, players_max: 0, description: "", image: "", contact_kakao: "", contact_telegram: "", contact_phone: "" });
    fetchGames();
  };

  const handleEnd = async (id: string) => {
    await supabase.from("live_games").update({ status: "종료", end_time: new Date().toISOString() }).eq("id", id);
    fetchGames();
  };

  const timeAgo = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return "방금"; if (m < 60) return `${m}분 전`; const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`; return `${Math.floor(h / 24)}일 전`;
  };

  const elapsed = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    const h = Math.floor(m / 60); const min = m % 60;
    return h > 0 ? `${h}시간 ${min}분` : `${min}분`;
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-6 flex-1" style={{ maxWidth: "1400px" }}>
        {/* Hero */}
        <div className="bg-white rounded-2xl card-shadow p-5 md:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <h1 className="text-xl font-black text-surface">실시간 현황</h1>
              </div>
              <p className="text-muted text-[14px]">현재 진행중인 토너먼트 · 대회 · 레이크 정보</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {["토너", "대회", "레이크"].map(cat => {
                  const count = cat === "대회"
                    ? events.filter(e => new Date(e.end_date || e.date).getTime() >= new Date().setHours(0, 0, 0, 0)).length
                    : games.filter(g => g.category === cat && g.status === "진행중").length;
                  return (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:scale-105 ${CATEGORY_COLORS[cat]}`}>
                      {cat} {count}건
                    </button>
                  );
                })}
              </div>
            </div>
            {user && (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setShowForm(!showForm)}
                  className="bg-accent hover:bg-accent-hover text-white text-[13px] font-bold px-3 py-2.5 rounded-lg transition-all">
                  {showForm ? "닫기" : "실시간 등록"}
                </button>
                <Link href="/jobs/write?type=구인"
                  className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[13px] font-bold px-3 py-2.5 rounded-lg transition-all whitespace-nowrap">
                  대회 구인글 등록
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Register form */}
        {showForm && (
          <div className="bg-white rounded-2xl card-shadow p-6 mb-5">
            <h2 className="text-lg font-bold text-surface mb-4">실시간 현황 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sub text-sm font-semibold mb-1.5 block">매장명 *</label>
                  <input className={inputClass} value={form.store_name} onChange={e => set("store_name", e.target.value)} placeholder="매장명" required />
                </div>
                <div>
                  <label className="text-sub text-sm font-semibold mb-1.5 block">카테고리 *</label>
                  <div className="flex gap-2">
                    {["토너", "대회", "레이크"].map(c => (
                      <button key={c} type="button" onClick={() => set("category", c)}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${form.category === c ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sub text-sm font-semibold mb-1.5 block">제목 *</label>
                <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} placeholder="예: NLH 1/2 캐시게임, 주말 토너먼트" required />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sub text-sm font-semibold mb-1.5 block">블라인드</label>
                  <input className={inputClass} value={form.blind} onChange={e => set("blind", e.target.value)} placeholder="1/2" />
                </div>
                <div>
                  <label className="text-sub text-sm font-semibold mb-1.5 block">바이인</label>
                  <input className={inputClass} value={form.buy_in} onChange={e => set("buy_in", e.target.value)} placeholder="100,000" />
                </div>
                <div>
                  <label className="text-sub text-sm font-semibold mb-1.5 block">{form.category === "레이크" ? "레이크" : "프라이즈"}</label>
                  <input className={inputClass} value={form.category === "레이크" ? form.rake : form.prize}
                    onChange={e => set(form.category === "레이크" ? "rake" : "prize", e.target.value)} placeholder={form.category === "레이크" ? "5%" : "GTD 100만"} />
                </div>
                <div>
                  <label className="text-sub text-sm font-semibold mb-1.5 block">인원</label>
                  <div className="flex items-center gap-1">
                    <input type="number" className={inputClass} value={form.players_current} onChange={e => set("players_current", parseInt(e.target.value) || 0)} placeholder="현재" />
                    <span className="text-muted">/</span>
                    <input type="number" className={inputClass} value={form.players_max} onChange={e => set("players_max", parseInt(e.target.value) || 0)} placeholder="최대" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sub text-sm font-semibold mb-1.5 block">설명</label>
                <textarea className={inputClass + " resize-none"} rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="추가 정보 (선택)" />
              </div>

              <ImageUpload
                value={form.image}
                onChange={v => set("image", v)}
                folder="live"
                label="포스터 이미지"
                hint="선택"
                aspect="aspect-4/3"
              />

              <div>
                <label className="text-sub text-sm font-semibold mb-1.5 block">연락처 <span className="text-muted font-normal">(하나 이상 입력)</span></label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[12px] font-semibold shrink-0">카카오톡</span>
                    <input className={inputClass} value={form.contact_kakao} onChange={e => set("contact_kakao", e.target.value)} placeholder="카톡 ID" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[12px] font-semibold shrink-0">텔레그램</span>
                    <input className={inputClass} value={form.contact_telegram} onChange={e => set("contact_telegram", e.target.value)} placeholder="텔레 ID" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-[12px] font-semibold shrink-0">전화번호</span>
                    <input className={inputClass} value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} placeholder="01012345678" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all">
                {saving ? "등록 중..." : "등록하기"}
              </button>
            </form>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(c => {
            const todayMs = new Date().setHours(0, 0, 0, 0);
            const count = c === "대회"
              ? events.filter(e => new Date(e.end_date || e.date).getTime() >= todayMs).length
              : games.filter(g => g.category === c).length;
            return (
              <button key={c} onClick={() => setCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  category === c ? "bg-accent text-white" : "bg-white card-shadow text-sub hover:bg-accent/10"
                }`}>{c} {c !== "전체" && <span className="ml-0.5 text-[11px]">({count})</span>}</button>
            );
          })}
        </div>

        {/* 대회 탭: /events 페이지와 동일한 디자인으로 표시 */}
        {category === "대회" ? (() => {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const sortedEvents = [...events].sort((a, b) => {
            const aEnd = new Date(a.end_date || a.date).getTime();
            const bEnd = new Date(b.end_date || b.date).getTime();
            const aUpcoming = aEnd >= today.getTime();
            const bUpcoming = bEnd >= today.getTime();
            if (aUpcoming && !bUpcoming) return -1;
            if (!aUpcoming && bUpcoming) return 1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          if (sortedEvents.length === 0) {
            return (
              <div className="text-center py-20 bg-white rounded-2xl card-shadow">
                <p className="text-muted text-lg mb-2">등록된 대회가 없습니다</p>
                {user && <Link href="/events/write" className="text-accent text-sm font-semibold hover:underline">대회 등록하기 →</Link>}
              </div>
            );
          }
          return (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {sortedEvents.map((event, i) => {
                const eventDate = new Date(event.date);
                const nowDate = new Date();
                const daysUntil = Math.ceil((eventDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
                const isUpcoming = daysUntil >= 0 && daysUntil <= 3;
                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="block group anim-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="bg-white rounded-xl border border-border-custom hover:border-accent/30 card-shadow hover:card-shadow-hover transition-all overflow-hidden h-full flex flex-col">
                      <div className="relative aspect-4/3 bg-accent/5 overflow-hidden flex items-center justify-center">
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-accent/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur rounded-lg px-2 py-1 shadow-sm">
                          <p className="text-accent text-[13px] md:text-[15px] font-black leading-none text-center">{eventDate.getDate()}</p>
                          <p className="text-muted text-[9px] md:text-[10px] text-center">{eventDate.getMonth() + 1}월</p>
                        </div>
                        {isUpcoming && (
                          <span className="absolute top-2 right-2 bg-accent text-dark text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md">
                            {daysUntil === 0 ? "TODAY" : `D-${daysUntil}`}
                          </span>
                        )}
                        {event.prize && (
                          <span className="absolute bottom-2 right-2 bg-accent text-dark px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[11px] md:text-[12px] font-bold shadow-md shadow-accent/15 max-w-[65%] truncate">
                            {event.prize}
                          </span>
                        )}
                      </div>
                      <div className="p-3 md:p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className={`text-[9px] md:text-[10px] font-black px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${event.is_international ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-700"}`}>
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18" /></svg>
                            {event.is_international ? "해외" : "국내"}
                          </span>
                        </div>
                        <h2 className="text-surface font-bold text-[14px] md:text-[17px] leading-tight group-hover:text-accent transition-colors line-clamp-2 mb-1.5">{event.title}</h2>
                        {(event.location || event.store_name) && (
                          <p className="text-accent text-[11px] md:text-[13px] mb-1.5 line-clamp-1 inline-flex items-center gap-1">
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate">{event.location || event.store_name}</span></p>
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
          );
        })() : loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <svg className="w-16 h-16 text-[#eee] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-muted text-lg mb-2">현재 진행중인 항목이 없습니다</p>
            <p className="text-muted text-sm">매장에서 실시간 현황을 등록하면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(game => (
              <div key={game.id} onClick={() => setSelectedGame(game)} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all cursor-pointer">
                {/* Poster image */}
                {game.image && (
                  <div className="aspect-4/3 bg-bg overflow-hidden flex items-center justify-center">
                    <img src={game.image} alt={game.title} className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[game.category] || "bg-gray-100 text-gray-600"}`}>{game.category}</span>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[game.status] || "bg-gray-400"}`} />
                        <span className="text-[11px] font-semibold text-sub">{game.status}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted">{timeAgo(game.updated_at)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-surface text-[16px] font-bold mb-1">{game.title}</h3>
                  <p className="text-accent text-[13px] font-semibold mb-3">{game.store_name}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {game.blind && (
                      <div className="bg-[#f9f9f9] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-muted">블라인드</p>
                        <p className="text-surface text-[14px] font-bold">{game.blind}</p>
                      </div>
                    )}
                    {game.buy_in && (
                      <div className="bg-[#f9f9f9] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-muted">바이인</p>
                        <p className="text-surface text-[14px] font-bold">{game.buy_in}</p>
                      </div>
                    )}
                    {game.prize && (
                      <div className="bg-[#f9f9f9] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-muted">프라이즈</p>
                        <p className="text-accent text-[14px] font-bold">{game.prize}</p>
                      </div>
                    )}
                    {game.rake && (
                      <div className="bg-[#f9f9f9] rounded-lg px-3 py-2">
                        <p className="text-[10px] text-muted">레이크</p>
                        <p className="text-surface text-[14px] font-bold">{game.rake}</p>
                      </div>
                    )}
                  </div>

                  {/* Players + Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(game.players_current > 0 || game.players_max > 0) && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-[13px] font-bold text-surface">{game.players_current}{game.players_max > 0 && `/${game.players_max}`}</span>
                        </div>
                      )}
                      <span className="text-[11px] text-muted">경과 {elapsed(game.start_time)}</span>
                    </div>
                    {user?.id === game.created_by && game.status === "진행중" && (
                      <button onClick={() => handleEnd(game.id)} className="text-[11px] text-red-400 font-semibold hover:text-red-500">종료</button>
                    )}
                  </div>

                  {game.description && <p className="text-muted text-[12px] mt-2 line-clamp-2">{game.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Detail modal */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedGame(null)} />
            <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto card-shadow">
              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 text-muted hover:text-surface z-10 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {/* Poster */}
              {selectedGame.image && (
                <div className="bg-bg overflow-hidden flex items-center justify-center max-h-[60vh]">
                  <img src={selectedGame.image} alt={selectedGame.title} className="max-w-full max-h-[60vh] object-contain" />
                </div>
              )}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${CATEGORY_COLORS[selectedGame.category] || "bg-gray-100 text-gray-600"}`}>{selectedGame.category}</span>
                  <div className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[selectedGame.status] || "bg-gray-400"}`} />
                    <span className="text-[13px] font-semibold text-sub">{selectedGame.status}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-surface mb-1">{selectedGame.title}</h2>
                <p className="text-accent text-[15px] font-semibold mb-5">{selectedGame.store_name}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {selectedGame.blind && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-[11px] text-muted mb-0.5">블라인드</p><p className="text-surface text-[17px] font-black">{selectedGame.blind}</p></div>}
                  {selectedGame.buy_in && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-[11px] text-muted mb-0.5">바이인</p><p className="text-surface text-[17px] font-black">{selectedGame.buy_in}</p></div>}
                  {selectedGame.prize && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-[11px] text-muted mb-0.5">프라이즈</p><p className="text-accent text-[17px] font-black">{selectedGame.prize}</p></div>}
                  {selectedGame.rake && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-[11px] text-muted mb-0.5">레이크</p><p className="text-surface text-[17px] font-black">{selectedGame.rake}</p></div>}
                  {(selectedGame.players_current > 0 || selectedGame.players_max > 0) && (
                    <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-[11px] text-muted mb-0.5">현재 인원</p><p className="text-surface text-[17px] font-black">{selectedGame.players_current}{selectedGame.players_max > 0 && ` / ${selectedGame.players_max}`}명</p></div>
                  )}
                  <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-[11px] text-muted mb-0.5">경과 시간</p><p className="text-surface text-[17px] font-black">{elapsed(selectedGame.start_time)}</p></div>
                </div>

                {selectedGame.description && (
                  <div className="mb-5">
                    <p className="text-[13px] text-muted mb-1">상세 정보</p>
                    <p className="text-sub text-[15px] leading-relaxed whitespace-pre-wrap bg-[#f9f9f9] rounded-xl p-4">{selectedGame.description}</p>
                  </div>
                )}

                {/* Contact buttons */}
                {(selectedGame.contact_phone || selectedGame.contact_kakao || selectedGame.contact_telegram) && (
                  <div className="mb-5">
                    <p className="text-[13px] text-muted mb-2">연락처</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.contact_phone && (
                        <a href={`tel:${selectedGame.contact_phone}`} className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          전화
                        </a>
                      )}
                      {selectedGame.contact_kakao && (
                        <button onClick={() => { navigator.clipboard.writeText(selectedGame.contact_kakao); alert(`카카오톡 ID: ${selectedGame.contact_kakao} (복사됨)`); }} className="flex items-center gap-1.5 bg-[#FEE500] hover:bg-[#e6cf00] text-[#3C1E1E] text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.08-.128.512.188.504.395.367.163-.108 2.592-1.76 3.637-2.477.733.104 1.49.16 2.27.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
                          카톡
                        </button>
                      )}
                      {selectedGame.contact_telegram && (
                        <a href={`https://t.me/${selectedGame.contact_telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#229ED9] hover:bg-[#1a8bc2] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-2.02 1.28-5.7 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06-.01.24-.02.38z"/></svg>
                          텔레
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-muted text-[12px]">등록: {selectedGame.created_at?.slice(0, 16).replace("T", " ")}</p>

                {user?.id === selectedGame.created_by && selectedGame.status === "진행중" && (
                  <button onClick={() => { handleEnd(selectedGame.id); setSelectedGame(null); }}
                    className="w-full mt-4 border border-red-200 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition-all">종료하기</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
