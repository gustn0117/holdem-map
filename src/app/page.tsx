"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import StoreCard from "@/components/StoreCard";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
import { stores } from "@/data/stores";
import { events } from "@/data/events";
import { notices } from "@/data/notices";
import { Store } from "@/types";

const regions = ["전체", "서울", "경기", "인천"];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const filteredStores =
    selectedRegion === "전체"
      ? stores
      : stores.filter((s) => s.region === selectedRegion);

  const recommendedStores = stores.filter((s) => s.isRecommended);
  const upcomingEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary via-secondary to-dark py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-accent rounded-full pulse-glow" />
            <span className="text-accent text-xs font-medium">
              서울·경기·인천 매장 정보 서비스 중
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            전국 홀덤 매장을
            <br />
            <span className="text-accent">한눈에</span> 찾아보세요
          </h1>
          <p className="text-muted text-base md:text-lg mb-8 max-w-xl mx-auto">
            지역명이나 매장명으로 검색하면 지도에서 바로 확인할 수 있어요
          </p>

          <div className="max-w-xl mx-auto">
            <SearchBar large />
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <span className="text-muted text-xs">인기 검색:</span>
            {["강남", "홍대", "수원", "일산"].map((keyword) => (
              <Link
                key={keyword}
                href={`/map?q=${keyword}`}
                className="text-accent/80 hover:text-accent text-xs border border-accent/20 rounded-full px-3 py-1 hover:bg-accent/10 transition-colors"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map + Store List Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">매장 지도</h2>
          <div className="flex gap-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3 h-[400px] lg:h-[500px]">
            <MapView
              stores={filteredStores}
              onStoreClick={setSelectedStore}
              selectedStore={selectedStore}
            />
          </div>

          {/* Store list */}
          <div className="lg:col-span-2 flex flex-col gap-3 lg:h-[500px] lg:overflow-y-auto lg:pr-2">
            <p className="text-muted text-sm">
              검색 결과{" "}
              <span className="text-accent font-semibold">
                {filteredStores.length}
              </span>
              곳
            </p>
            {filteredStores.map((store) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* Recommended + Events + Notices */}
      <section className="max-w-7xl mx-auto px-4 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Stores */}
          <div className="bg-card rounded-xl p-6 border border-border-custom">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-gold text-lg">★</span>
              <h3 className="text-white font-bold">추천 매장</h3>
            </div>
            <div className="flex flex-col gap-3">
              {recommendedStores.map((store) => (
                <Link
                  key={store.id}
                  href={`/store/${store.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark/50 hover:bg-dark transition-colors"
                >
                  <div>
                    <p className="text-surface text-sm font-medium">
                      {store.name}
                    </p>
                    <p className="text-muted text-xs mt-0.5">{store.region}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card rounded-xl p-6 border border-border-custom">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-accent text-lg">🏆</span>
                <h3 className="text-white font-bold">다가오는 대회</h3>
              </div>
              <Link
                href="/events"
                className="text-accent text-xs hover:underline"
              >
                전체보기
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg bg-dark/50 border-l-2 border-accent"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-surface text-sm font-medium">
                      {event.title}
                    </p>
                    {event.prize && (
                      <span className="text-gold text-xs font-semibold">
                        {event.prize}
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs mt-1">
                    {event.storeName} · {event.date} {event.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notices + SNS Links */}
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-xl p-6 border border-border-custom">
              <h3 className="text-white font-bold mb-4">공지사항</h3>
              <div className="flex flex-col gap-2">
                {notices.map((notice) => (
                  <div key={notice.id} className="flex items-start gap-2">
                    <span className="text-accent text-xs mt-0.5">·</span>
                    <div>
                      <p className="text-surface text-sm">{notice.title}</p>
                      <p className="text-muted text-[10px]">{notice.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border-custom">
              <h3 className="text-white font-bold mb-4">커뮤니티</h3>
              <div className="flex flex-col gap-2">
                {[
                  { name: "네이버 카페", icon: "📗" },
                  { name: "인스타그램", icon: "📸" },
                  { name: "카카오톡 채널", icon: "💬" },
                ].map((link) => (
                  <div
                    key={link.name}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-dark/50 hover:bg-dark transition-colors cursor-pointer"
                  >
                    <span>{link.icon}</span>
                    <span className="text-muted text-sm">{link.name}</span>
                    <span className="text-muted text-[10px] ml-auto">
                      준비중
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Ad Section */}
      <section className="max-w-7xl mx-auto px-4 pb-12 w-full">
        <div className="bg-gradient-to-r from-accent/10 via-card to-accent/10 rounded-xl p-8 border border-accent/20 text-center">
          <p className="text-muted text-xs mb-2">광고</p>
          <p className="text-white font-bold text-lg mb-1">
            내 매장을 홀덤맵에 등록하세요
          </p>
          <p className="text-muted text-sm mb-4">
            전국 홀덤 유저에게 매장을 홍보할 수 있습니다
          </p>
          <button className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            매장 등록 문의
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
