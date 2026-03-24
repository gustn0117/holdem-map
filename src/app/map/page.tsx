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
const sortOptions = [
  { value: "name", label: "이름순" },
  { value: "recommended", label: "추천순" },
];

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
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.region.includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === "recommended") {
      result = [...result].sort((a, b) => (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0));
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [selectedRegion, query, sortBy, stores]);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Sidebar */}
        <div className="lg:w-105 lg:shrink-0 lg:h-[calc(100vh-56px)] lg:sticky lg:top-14 flex flex-col border-r border-white/[0.04] bg-primary/50">
          {/* Search */}
          <div className="p-4 space-y-3 border-b border-white/[0.04]">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="지역명, 매장명 검색"
                className="w-full bg-white/[0.04] border border-white/[0.04] text-surface rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-accent/30 transition-all placeholder:text-muted/25"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30 hover:text-surface transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.03]">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedRegion === r ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted/40 hover:text-surface"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
            <p className="text-muted/30 text-xs">
              <span className="text-accent-light font-bold text-sm mr-1">{filteredStores.length}</span>곳
            </p>
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    sortBy === opt.value ? "text-accent-light bg-accent/10" : "text-muted/30 hover:text-surface"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Store list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
            {filteredStores.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-10 h-10 text-white/[0.04] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-muted/30 text-sm">검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`rounded-2xl transition-all cursor-pointer ${
                    selectedStore?.id === store.id ? "ring-1 ring-accent/30 ring-offset-1 ring-offset-dark" : ""
                  }`}
                >
                  <StoreCard store={store} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 h-100 lg:h-[calc(100vh-56px)] lg:sticky lg:top-14">
          <MapView stores={filteredStores} onStoreClick={setSelectedStore} selectedStore={selectedStore} />
        </div>
      </main>

      <div className="lg:hidden"><Footer /></div>
    </div>
  );
}
