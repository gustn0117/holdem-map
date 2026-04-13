"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface TradeItem {
  id: string; nickname: string; title: string; category: string;
  price: string; condition: string; description: string; images: string[];
  region: string; status: string; views: number; created_at: string;
}

const CATEGORIES = ["전체", "카드", "칩", "테이블", "악세서리", "기타"];
const STATUS_COLORS: Record<string, string> = {
  "판매중": "bg-emerald-100 text-emerald-700",
  "예약중": "bg-yellow-100 text-yellow-700",
  "판매완료": "bg-gray-200 text-gray-500",
};

export default function TradePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("전체");
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.from("trade_items").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const filtered = items
    .filter(i => filterCategory === "전체" || i.category === filterCategory)
    .filter(i => !query.trim() || i.title.toLowerCase().includes(query.toLowerCase()) || i.description.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-surface">중고거래</h1>
            <p className="text-muted text-sm mt-1">홀덤 관련 물품을 거래하세요</p>
          </div>
          {user ? (
            <Link href="/trade/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shrink-0">상품 등록</Link>
          ) : (
            <Link href="/register" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shrink-0">회원가입 후 등록</Link>
          )}
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="상품명, 설명 검색"
              className="w-full bg-white border border-border-custom rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-all placeholder:text-muted" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilterCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${filterCategory === c ? "bg-accent text-white" : "bg-white text-sub border border-border-custom hover:border-accent/30"}`}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <svg className="w-16 h-16 text-[#eee] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-muted text-lg">{query ? "검색 결과가 없습니다" : "등록된 상품이 없습니다"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <Link key={item.id} href={`/trade/${item.id}`} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
                {item.images?.[0] ? (
                  <div className="aspect-square bg-[#f5f6f8] overflow-hidden">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square bg-accent/5 flex items-center justify-center">
                    <svg className="w-12 h-12 text-accent/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-500"}`}>{item.status}</span>
                    <span className="text-[10px] text-muted">{item.category}</span>
                  </div>
                  <p className="text-surface text-[13px] font-bold truncate">{item.title}</p>
                  <p className="text-accent text-[15px] font-black mt-1">{item.price}</p>
                  <p className="text-muted text-[11px] mt-0.5">{item.region || "-"} · 조회 {item.views}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
