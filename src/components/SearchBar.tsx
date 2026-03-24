"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/map?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <svg className={`absolute text-muted pointer-events-none top-1/2 -translate-y-1/2 ${large ? "left-5 w-5 h-5" : "left-4 w-4 h-4"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="지역명, 매장명으로 검색"
          className={`w-full bg-card border border-border-custom text-white rounded-2xl focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted ${large ? "pl-14 pr-32 py-5 text-base" : "pl-11 pr-24 py-3.5 text-sm"}`}
        />
        <button type="submit" className={`absolute right-2 top-1/2 -translate-y-1/2 gold-btn text-dark rounded-xl font-bold shadow-lg shadow-accent/25 hover:shadow-accent/50 transition-all ${large ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs"}`}>
          검색하기
        </button>
      </div>
    </form>
  );
}
