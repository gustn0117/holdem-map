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
      setStore(s);
      setStoreEvents(e);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-white/5 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <h1 className="text-xl font-bold text-white mb-2">매장을 찾을 수 없습니다</h1>
            <Link href="/" className="text-accent hover:text-accent-light text-sm transition-colors">홈으로 돌아가기</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const infoItems = [
    { label: "주소", value: store.address, icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { label: "연락처", value: store.phone, icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { label: "영업시간", value: store.hours, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-2 text-xs mb-6">
          <Link href="/" className="text-muted/40 hover:text-accent-light transition-colors">홈</Link>
          <svg className="w-3 h-3 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href="/map" className="text-muted/40 hover:text-accent-light transition-colors">지도</Link>
          <svg className="w-3 h-3 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-surface/80">{store.name}</span>
        </div>

        <div className="relative bg-card rounded-2xl p-6 md:p-8 border border-white/[0.04] mb-5 overflow-hidden glow-border">
          <div className="absolute inset-0 bg-linear-to-br from-accent/3 to-transparent" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{store.name}</h1>
                  {store.is_recommended && (
                    <span className="bg-gold/10 text-gold text-[10px] font-bold px-3 py-1 rounded-lg border border-gold/10 uppercase tracking-wider">추천</span>
                  )}
                </div>
                <p className="text-muted/60 text-sm">{store.address}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="flex items-center gap-1.5 text-green/70 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />영업중
                  </span>
                  <span className="text-white/10">|</span>
                  <span className="text-muted/40 text-xs">{store.hours}</span>
                </div>
              </div>
              <span className="bg-accent/10 text-accent-light px-4 py-2 rounded-xl text-sm font-semibold border border-accent/10">{store.region}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {store.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-white/4 text-muted/70 border border-white/4">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-card rounded-2xl p-6 border border-white/[0.04] glow-border">
            <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              기본 정보
            </h2>
            <div className="space-y-5">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/3 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                  </div>
                  <div>
                    <p className="text-muted/40 text-[11px] mb-0.5">{item.label}</p>
                    <p className="text-surface text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-white/[0.04] glow-border">
            <h2 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              위치
            </h2>
            <div className="h-56 rounded-xl overflow-hidden border border-white/5">
              <StoreMap store={store} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-white/[0.04] mb-5 glow-border">
          <h2 className="text-white font-bold text-sm mb-3">매장 소개</h2>
          <p className="text-muted/70 text-sm leading-relaxed">{store.description}</p>
        </div>

        {storeEvents.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-white/[0.04] mb-8 glow-border">
            <h2 className="text-white font-bold text-sm mb-4">대회 / 이벤트</h2>
            <div className="space-y-2.5">
              {storeEvents.map((event) => (
                <div key={event.id} className="p-4 rounded-xl bg-white/2 border border-white/3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-surface font-semibold text-sm">{event.title}</h3>
                    {event.prize && <span className="text-gold text-[10px] font-bold bg-gold/10 px-2 py-0.5 rounded border border-gold/10">{event.prize}</span>}
                  </div>
                  <p className="text-muted/40 text-xs">{event.date} · {event.time}</p>
                  <p className="text-muted/60 text-xs mt-1.5 leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/map" className="inline-flex items-center gap-2 text-muted/40 hover:text-accent text-sm transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
