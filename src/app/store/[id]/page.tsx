"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreMap from "@/components/StoreMap";
import { getStore, getEventsByStore } from "@/lib/api";
import { Store, Event } from "@/types";

export default function StorePage() {
  const params = useParams();
  const id = params.id as string;
  const [store, setStore] = useState<Store | null>(null);
  const [storeEvents, setStoreEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, e] = await Promise.all([getStore(id), getEventsByStore(id)]);
      setStore(s); setStoreEvents(e); setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header /><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div></div>;
  if (!store) return <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header /><div className="flex-1 flex items-center justify-center text-center"><div><h1 className="text-2xl font-bold text-surface mb-3">매장을 찾을 수 없습니다</h1><Link href="/" className="text-accent text-base">홈으로 돌아가기</Link></div></div><Footer /></div>;

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted hover:text-accent transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/map" className="text-muted hover:text-accent transition-colors">지도</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">{store.name}</span>
        </div>

        {/* Store Header */}
        <div className="bg-card rounded-3xl p-8 md:p-10 border border-border-custom mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-surface tracking-tight">{store.name}</h1>
                  {store.is_recommended && <span className="gold-btn text-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">추천</span>}
                </div>
                <p className="text-muted text-base mb-4">{store.address}</p>
                <div className="flex items-center gap-3 text-base">
                  <span className="flex items-center gap-2 text-green">
                    <span className="w-2 h-2 rounded-full bg-green pulse-dot" />영업중
                  </span>
                  <span className="w-px h-4 bg-border-custom" />
                  <span className="text-sub">{store.hours}</span>
                </div>
              </div>
              <span className="gold-btn text-dark px-5 py-2.5 rounded-xl text-base font-bold shadow-lg shadow-accent/20 shrink-0">{store.region}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {store.tags.map((tag) => (
                <span key={tag} className="px-3.5 py-1.5 rounded-xl text-sm bg-white/5 text-sub border border-border-custom">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Info + Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-3xl p-8 border border-border-custom">
            <h2 className="text-surface font-bold text-xl mb-6">기본 정보</h2>
            <div className="space-y-6">
              {[
                { label: "주소", value: store.address, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
                { label: "연락처", value: store.phone, icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                { label: "영업시간", value: store.hours, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                  </div>
                  <div>
                    <p className="text-muted text-sm mb-1">{item.label}</p>
                    <p className="text-surface text-base font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 border border-border-custom">
            <h2 className="text-surface font-bold text-xl mb-6">위치</h2>
            <div className="h-64 rounded-2xl overflow-hidden border border-border-custom">
              <StoreMap store={store} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-3xl p-8 border border-border-custom mb-8">
          <h2 className="text-surface font-bold text-xl mb-4">매장 소개</h2>
          <p className="text-sub text-base leading-relaxed">{store.description}</p>
        </div>

        {/* Events */}
        {storeEvents.length > 0 && (
          <div className="bg-card rounded-3xl p-8 border border-border-custom mb-10">
            <h2 className="text-surface font-bold text-xl mb-6">대회 / 이벤트</h2>
            <div className="space-y-4">
              {storeEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block group">
                  <div className="p-5 rounded-2xl bg-white/3 border border-border-custom hover:border-accent/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-surface font-bold text-lg group-hover:text-accent transition-colors">{event.title}</h3>
                      {event.prize && <span className="gold-btn text-dark text-sm font-bold px-3 py-1 rounded-lg shadow-sm">{event.prize}</span>}
                    </div>
                    <p className="text-muted text-sm">{event.date} · {event.time}</p>
                    <p className="text-sub text-base mt-2 leading-relaxed">{event.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/map" className="inline-flex items-center gap-2 text-muted hover:text-accent text-base transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
