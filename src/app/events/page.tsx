"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { events } from "@/data/events";

export default function EventsPage() {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">TOURNAMENTS</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">대회 / 이벤트</h1>
          </div>
          <div className="glass border border-white/10 rounded-full px-3 py-1.5">
            <span className="text-muted/50 text-xs">
              총 <span className="text-accent-light font-bold">{sortedEvents.length}</span>개
            </span>
          </div>
        </div>

        <div className="space-y-3">
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
                className="group bg-card rounded-2xl border border-white/5 hover:border-accent/20 transition-all animate-fade-in gradient-border overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5 p-5">
                  {/* Date block */}
                  <div className="flex md:flex-col items-center gap-2 md:gap-1.5 md:w-20 shrink-0">
                    <div className="bg-accent/10 border border-accent/10 rounded-xl p-3 md:w-full text-center">
                      <p className="text-accent-light text-2xl font-bold leading-none">
                        {eventDate.getDate()}
                      </p>
                      <p className="text-muted/40 text-[10px] mt-1 uppercase font-medium">
                        {eventDate.toLocaleDateString("ko", { month: "short" })}
                      </p>
                    </div>
                    {isUpcoming && (
                      <span className="text-gold text-[10px] font-bold bg-gold/10 border border-gold/10 px-2.5 py-1 rounded-lg">
                        {daysUntil === 0 ? "TODAY" : `D-${daysUntil}`}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-white font-bold text-base group-hover:text-accent-light transition-colors">{event.title}</h2>
                        <Link
                          href={`/store/${event.storeId}`}
                          className="text-accent/60 text-xs hover:text-accent transition-colors"
                        >
                          {event.storeName}
                        </Link>
                      </div>
                      {event.prize && (
                        <span className="bg-gold/10 text-gold px-3 py-1.5 rounded-lg text-xs font-bold border border-gold/10 shrink-0">
                          {event.prize}
                        </span>
                      )}
                    </div>

                    <p className="text-muted/60 text-sm mt-3 leading-relaxed">{event.description}</p>

                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-muted/40 text-xs flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.date}
                      </span>
                      <span className="text-muted/40 text-xs flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
