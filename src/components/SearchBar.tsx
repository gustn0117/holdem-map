"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/map?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-linear-to-r from-accent/30 to-accent-light/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center">
          <svg
            className={`absolute left-4 text-muted pointer-events-none ${large ? "w-5 h-5" : "w-4 h-4"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="지역명, 매장명으로 검색"
            className={`w-full bg-card border border-border-custom text-surface rounded-xl focus:outline-none focus:border-accent/50 transition-all placeholder:text-muted/60 ${
              large ? "pl-12 pr-28 py-4 text-base" : "pl-10 pr-20 py-3 text-sm"
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all font-medium ${
              large ? "px-5 py-2.5 text-sm" : "px-4 py-2 text-xs"
            }`}
          >
            검색
          </button>
        </div>
      </div>
    </form>
  );
}
