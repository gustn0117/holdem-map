"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/map?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        {focused && (
          <div className="absolute -inset-1 bg-linear-to-r from-accent/20 via-accent-light/20 to-accent/20 rounded-2xl blur-lg transition-opacity" />
        )}
        <div className="relative flex items-center">
          <svg
            className={`absolute text-muted pointer-events-none ${large ? "left-5 w-5 h-5" : "left-4 w-4 h-4"}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="지역명, 매장명으로 검색"
            className={`w-full bg-white/[0.05] border border-white/10 text-surface rounded-2xl focus:outline-none focus:border-accent/40 focus:bg-white/[0.08] transition-all placeholder:text-muted/40 ${
              large ? "pl-14 pr-32 py-5 text-base" : "pl-11 pr-24 py-3.5 text-sm"
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 bg-linear-to-r from-accent to-accent-light hover:opacity-90 text-white rounded-xl transition-all font-semibold shadow-lg shadow-accent/20 ${
              large ? "px-6 py-3 text-sm" : "px-4 py-2 text-xs"
            }`}
          >
            검색하기
          </button>
        </div>
      </div>
    </form>
  );
}
