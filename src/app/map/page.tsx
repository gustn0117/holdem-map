"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { useStores } from "@/hooks/useData";
import { Store } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const regions = ["전체", "서울", "경기", "인천"];

export default function MapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark" />}>
      <MapPageInner />
    </Suspense>
  );
}

function MapPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [sortBy, setSortBy] = useState("recommended");
  const { stores } = useStores();

  const filteredStores = useMemo(() => {
    let result = stores;
    if (selectedRegion !== "전체") result = result.filter((s) => s.region === selectedRegion);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.region.includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (sortBy === "recommended") result = [...result].sort((a, b) => (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0));
    else result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [selectedRegion, query, sortBy, stores]);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Sidebar */}
        <div className="lg:w-110 lg:shrink-0 lg:h-[calc(100vh-56px)] lg:sticky lg:top-14 flex flex-col border-r border-border-custom bg-primary">
          <div className="p-5 space-y-4 border-b border-border-custom">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="지역명, 매장명 검색"
                className="w-full bg-card border border-border-custom text-surface rounded-xl pl-12 pr-10 py-3.5 text-base focus:outline-none focus:border-accent/50 transition-all placeholder:text-muted"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-surface transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="flex gap-1.5 bg-card rounded-xl p-1.5 border border-border-custom">
              {regions.map((r) => (
                <button key={r} onClick={() => setSelectedRegion(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedRegion === r ? "bg-accent text-dark shadow-md" : "text-muted hover:text-surface"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
            <p className="text-muted text-base"><span className="text-accent font-bold text-xl mr-1">{filteredStores.length}</span>곳</p>
            <div className="flex gap-1.5">
              {[{ value: "recommended", label: "추천순" }, { value: "name", label: "이름순" }].map((opt) => (
                <button key={opt.value} onClick={() => setSortBy(opt.value)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${sortBy === opt.value ? "text-accent bg-accent/10 font-semibold" : "text-muted hover:text-surface"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {filteredStores.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted text-lg mb-2">검색 결과가 없습니다</p>
                <p className="text-muted text-sm">다른 키워드로 검색해보세요</p>
              </div>
            ) : filteredStores.map((store) => (
              <div key={store.id} onClick={() => setSelectedStore(store)}
                className={`rounded-xl transition-all cursor-pointer ${selectedStore?.id === store.id ? "ring-2 ring-accent/50" : ""}`}>
                <StoreCard store={store} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 h-110 lg:h-[calc(100vh-56px)] lg:sticky lg:top-14">
          <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
        </div>
      </main>
      <div className="lg:hidden"><Footer /></div>
    </div>
  );
}
