"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
import { stores } from "@/data/stores";
import { Store } from "@/types";

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

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Search + Filters */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">지도 검색</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="지역명 또는 매장명을 검색하세요"
                  className="w-full bg-card border-2 border-border-custom text-surface rounded-xl px-5 py-3 text-sm pr-12 focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(233,69,96,0.2)] transition-all placeholder:text-muted"
                />
                <svg
                  className="w-4 h-4 text-muted absolute right-4 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-accent text-white"
                      : "bg-card text-muted border border-border-custom hover:text-surface"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-[400px] lg:h-[600px]">
            <MapView
              stores={filteredStores}
              onStoreClick={setSelectedStore}
              selectedStore={selectedStore}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted text-sm">
                검색 결과{" "}
                <span className="text-accent font-semibold">
                  {filteredStores.length}
                </span>
                곳
              </p>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted text-xs hover:text-accent transition-colors"
                >
                  검색 초기화
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 lg:h-[550px] lg:overflow-y-auto lg:pr-2">
              {filteredStores.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-muted text-sm">
                    검색 결과가 없습니다.
                    <br />
                    다른 키워드로 검색해보세요.
                  </p>
                </div>
              ) : (
                filteredStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className={`rounded-xl transition-all ${
                      selectedStore?.id === store.id
                        ? "ring-2 ring-accent"
                        : ""
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
