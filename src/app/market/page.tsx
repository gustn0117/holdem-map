"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Listing {
  id: string; type: string; title: string; region: string; address: string;
  price: string; description: string; images: string[]; contact: string;
  status: string; is_featured: boolean; created_at: string;
}

const TYPES = ["전체", "매매", "대관", "단기운영"];

export default function MarketPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("전체");
  const [filterRegion, setFilterRegion] = useState("전체");

  useEffect(() => {
    supabase.from("market_listings").select("*").order("is_featured", { ascending: false }).order("created_at", { ascending: false })
      .then(({ data }) => { setListings(data || []); setLoading(false); });
  }, []);

  const filtered = listings
    .filter(l => filterType === "전체" || l.type === filterType)
    .filter(l => filterRegion === "전체" || l.region.includes(filterRegion));

  const featured = filtered.filter(l => l.is_featured);
  const regular = filtered.filter(l => !l.is_featured);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-surface">매장 거래소</h1>
            <p className="text-muted text-sm mt-1">홀덤 매장 매매 · 대관 · 단기운영</p>
          </div>
          {user ? (
            <Link href="/market/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shrink-0">등록하기</Link>
          ) : (
            <Link href="/register" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shrink-0">회원가입 후 등록</Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex gap-1.5">
            {TYPES.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${filterType === t ? "bg-accent text-white" : "bg-white text-sub border border-border-custom hover:border-accent/30"}`}>{t}</button>
            ))}
          </div>
          <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
            className="bg-white border border-border-custom rounded-lg px-3 py-2 text-[13px] text-sub focus:outline-none focus:border-accent">
            <option value="전체">전체 지역</option>
            <option value="서울">서울</option><option value="경기">경기</option><option value="인천">인천</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <svg className="w-16 h-16 text-[#eee] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-muted text-lg mb-2">등록된 매물이 없습니다</p>
            <p className="text-muted text-sm">첫 번째 매물을 등록해보세요</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div className="mb-6">
                <h2 className="text-[15px] font-bold text-surface mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" /></svg>
                  추천 매물
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regular.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ListingCard({ listing: l }: { listing: any }) {
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
      {l.images?.[0] ? (
        <div className="h-44 bg-[#f5f6f8] overflow-hidden"><img src={l.images[0]} alt="" className="w-full h-full object-cover" /></div>
      ) : (
        <div className="h-32 bg-[#f5f6f8] flex items-center justify-center">
          <svg className="w-10 h-10 text-[#ddd]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            l.type === "매매" ? "bg-red-100 text-red-600" : l.type === "대관" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-700"
          }`}>{l.type}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${l.status === "모집중" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span>
          {l.is_featured && <span className="text-[10px] font-bold text-red-500">추천</span>}
        </div>
        <h3 className="text-surface text-[16px] font-bold mb-1">{l.title}</h3>
        <p className="text-sub text-[13px] mb-2">{l.region} {l.address && `· ${l.address}`}</p>
        <p className="text-accent text-[15px] font-black mb-3">{l.price}</p>
        {l.description && <p className="text-muted text-[13px] line-clamp-2 mb-3">{l.description}</p>}
        <div className="flex gap-2">
          <button className="flex-1 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-2.5 rounded-xl transition-all">상세보기</button>
          {l.contact && <button className="flex-1 border border-border-custom text-sub text-[13px] font-semibold py-2.5 rounded-xl hover:bg-[#f5f6f8] transition-all">문의하기</button>}
        </div>
      </div>
    </div>
  );
}
