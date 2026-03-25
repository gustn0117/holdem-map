"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEvents } from "@/hooks/useData";

export default function EventsPage() {
  const { events, loading } = useEvents();
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-surface">대회 / 이벤트</h1>
            <p className="text-muted text-base mt-2">다가오는 홀덤 대회 일정을 확인하세요</p>
          </div>
          <span className="text-muted text-base">
            총 <span className="text-accent font-bold text-xl">{sortedEvents.length}</span>개
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, i) => {
              const eventDate = new Date(event.date);
              const today = new Date();
              const daysUntil = Math.ceil(
                (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUpcoming = daysUntil >= 0 && daysUntil <= 3;

              return (
                <Link key={event.id} href={`/events/${event.id}`} className="block group anim-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="bg-card rounded-xl border border-border-custom hover:border-accent/30 transition-all overflow-hidden">
                    {/* Image banner if exists */}
                    {event.image && (
                      <div className="h-48 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-start gap-5 p-6">
                      {/* Date block */}
                      <div className="flex md:flex-col items-center gap-3 md:gap-2 md:w-20 shrink-0">
                        <div className="bg-accent/10 border border-accent/15 rounded-xl p-3 md:w-full text-center">
                          <p className="text-accent text-3xl font-bold leading-none">{eventDate.getDate()}</p>
                          <p className="text-muted text-xs mt-1">{eventDate.getMonth() + 1}월</p>
                        </div>
                        {isUpcoming && (
                          <span className="bg-accent text-dark text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                            {daysUntil === 0 ? "TODAY" : `D-${daysUntil}`}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-surface font-bold text-xl group-hover:text-accent transition-colors">{event.title}</h2>
                            <p className="text-accent text-sm mt-1">{event.store_name}</p>
                          </div>
                          {event.prize && (
                            <span className="bg-accent text-dark px-4 py-2 rounded-xl text-sm font-bold shrink-0 shadow-md shadow-accent/15">{event.prize}</span>
                          )}
                        </div>

                        <p className="text-sub text-base mt-3 leading-relaxed line-clamp-2">{event.description}</p>

                        <div className="flex items-center gap-5 mt-4">
                          <span className="text-muted text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {event.date}
                          </span>
                          <span className="text-muted text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {event.time}
                          </span>
                          {event.buy_in && (
                            <span className="text-muted text-sm">바이인: {event.buy_in}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
