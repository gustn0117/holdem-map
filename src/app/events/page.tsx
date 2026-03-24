"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { events } from "@/data/events";

export default function EventsPage() {
  const [filter, setFilter] = useState("전체");

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">대회 / 이벤트</h1>
          <span className="text-muted text-sm">
            총{" "}
            <span className="text-accent font-semibold">
              {sortedEvents.length}
            </span>
            개
          </span>
        </div>

        <div className="space-y-4">
          {sortedEvents.map((event, i) => {
            const eventDate = new Date(event.date);
            const today = new Date();
            const daysUntil = Math.ceil(
              (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isUpcoming = daysUntil >= 0 && daysUntil <= 3;

            return (
              <div
                key={event.id}
                className="bg-card rounded-xl p-5 md:p-6 border border-border-custom hover:border-accent/30 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Date badge */}
                  <div className="flex md:flex-col items-center gap-2 md:gap-0 md:w-20 md:text-center shrink-0">
                    <div className="bg-accent/10 rounded-lg p-2 md:p-3 md:w-full">
                      <p className="text-accent text-lg md:text-2xl font-bold">
                        {eventDate.getDate()}
                      </p>
                      <p className="text-muted text-xs">
                        {eventDate.getMonth() + 1}월
                      </p>
                    </div>
                    {isUpcoming && (
                      <span className="text-gold text-[10px] font-bold bg-gold/10 px-2 py-0.5 rounded-full">
                        {daysUntil === 0 ? "오늘" : `D-${daysUntil}`}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-white font-bold text-lg">
                          {event.title}
                        </h2>
                        <Link
                          href={`/store/${event.storeId}`}
                          className="text-accent text-sm hover:underline"
                        >
                          {event.storeName}
                        </Link>
                      </div>
                      {event.prize && (
                        <span className="bg-gold/15 text-gold px-3 py-1.5 rounded-lg text-sm font-bold border border-gold/20 shrink-0">
                          {event.prize}
                        </span>
                      )}
                    </div>

                    <p className="text-muted text-sm mt-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-muted text-xs flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {event.date}
                      </span>
                      <span className="text-muted text-xs flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {event.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
