"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { stores } from "@/data/stores";
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

  const filteredStores = useMemo(() => {
    let result = stores;

    if (selectedRegion !== "전체") {
      result = result.filter((s) => s.region === selectedRegion);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          s.region.includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [selectedRegion, query]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Search + Filters */}
        <div className="mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-accent/20 to-accent-light/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center">
                <svg className="absolute left-4 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="지역명 또는 매장명을 검색하세요"
                  className="w-full bg-card border border-border-custom text-surface rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-muted/50"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 text-muted hover:text-surface transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-1.5 bg-card rounded-xl p-1 border border-border-custom/50 shrink-0">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === region
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:text-surface"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-100 lg:h-150">
            <MapView
              stores={filteredStores}
              onStoreClick={setSelectedStore}
              selectedStore={selectedStore}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-muted text-xs">
                검색 결과 <span className="text-accent-light font-semibold">{filteredStores.length}</span>곳
              </p>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-accent text-xs hover:text-accent-light transition-colors"
                >
                  초기화
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2.5 lg:h-[570px] lg:overflow-y-auto lg:pr-1">
              {filteredStores.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-12 h-12 text-muted/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-muted text-sm">검색 결과가 없습니다</p>
                  <p className="text-muted/50 text-xs mt-1">다른 키워드로 검색해보세요</p>
                </div>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`rounded-2xl transition-all cursor-pointer ${
                      selectedStore?.id === store.id ? "ring-1 ring-accent/60" : ""
                    }`}
                  >
                    <StoreCard store={store} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
