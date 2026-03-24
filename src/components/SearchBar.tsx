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
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="지역명 또는 매장명을 검색하세요"
          className={`w-full bg-card border-2 border-border-custom text-surface rounded-2xl focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(233,69,96,0.2)] transition-all placeholder:text-muted ${
            large ? "px-6 py-5 text-lg pr-14" : "px-5 py-3.5 text-sm pr-12"
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors flex items-center justify-center ${
            large ? "w-11 h-11" : "w-9 h-9"
          }`}
        >
          <svg
            className={large ? "w-5 h-5" : "w-4 h-4"}
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
        </button>
      </div>
    </form>
  );
}
