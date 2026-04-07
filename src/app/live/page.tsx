"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface LiveGame {
  id: string; store_id: string; store_name: string; category: string;
  title: string; blind: string; buy_in: string; prize: string; rake: string;
  players_current: number; players_max: number; status: string;
  start_time: string; end_time: string | null; description: string;
  created_by: string | null; created_at: string; updated_at: string;
}

const CATEGORIES = ["전체", "게임", "토너", "대회", "레이크"];
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
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    store_name: "", category: "게임", title: "", blind: "", buy_in: "",
    prize: "", rake: "", players_current: 0, players_max: 0, description: "",
  });

  const fetchGames = () => {
    supabase.from("live_games").select("*")
      .in("status", ["진행중", "대기중"])
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
    });
    if (error) { alert("등록에 실패했습니다."); setSaving(false); return; }
    setShowForm(false); setSaving(false);
    setForm({ store_name: "", category: "게임", title: "", blind: "", buy_in: "", prize: "", rake: "", players_current: 0, players_max: 0, description: "" });
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
              <p className="text-muted text-[14px]">현재 진행중인 게임 · 토너먼트 · 대회 · 레이크 정보</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {["게임", "토너", "대회", "레이크"].map(cat => {
                  const count = games.filter(g => g.category === cat && g.status === "진행중").length;
                  return (
                    <span key={cat} className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg ${CATEGORY_COLORS[cat]}`}>
                      {cat} {count}건
                    </span>
                  );
                })}
              </div>
            </div>
            {user && (
              <button onClick={() => setShowForm(!showForm)}
                className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shrink-0">
                {showForm ? "닫기" : "실시간 등록"}
              </button>
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
                    {["게임", "토너", "대회", "레이크"].map(c => (
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

              <button type="submit" disabled={saving} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all">
                {saving ? "등록 중..." : "등록하기"}
              </button>
            </form>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                category === c ? "bg-accent text-white" : "bg-white card-shadow text-sub hover:bg-accent/10"
              }`}>{c} {c !== "전체" && <span className="ml-0.5 text-[11px]">({games.filter(g => g.category === c).length})</span>}</button>
          ))}
        </div>

        {/* Games list */}
        {loading ? (
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
              <div key={game.id} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
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
      </main>
      <Footer />
    </div>
  );
}
