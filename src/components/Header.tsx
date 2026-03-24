"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-border-custom">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
            H
          </div>
          <span className="text-xl font-bold text-white">
            홀덤<span className="text-accent">맵</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-surface hover:text-accent transition-colors text-sm font-medium"
          >
            홈
          </Link>
          <Link
            href="/map"
            className="text-muted hover:text-accent transition-colors text-sm font-medium"
          >
            지도검색
          </Link>
          <Link
            href="/events"
            className="text-muted hover:text-accent transition-colors text-sm font-medium"
          >
            대회/이벤트
          </Link>
          <Link
            href="/admin"
            className="text-muted hover:text-accent transition-colors text-sm font-medium"
          >
            관리자
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-surface p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden bg-primary border-t border-border-custom px-4 py-4 flex flex-col gap-4">
          <Link
            href="/"
            className="text-surface hover:text-accent transition-colors text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            홈
          </Link>
          <Link
            href="/map"
            className="text-muted hover:text-accent transition-colors text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            지도검색
          </Link>
          <Link
            href="/events"
            className="text-muted hover:text-accent transition-colors text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            대회/이벤트
          </Link>
          <Link
            href="/admin"
            className="text-muted hover:text-accent transition-colors text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            관리자
          </Link>
        </nav>
      )}
    </header>
  );
}
