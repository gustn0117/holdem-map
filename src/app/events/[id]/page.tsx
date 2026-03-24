"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getEvent } from "@/lib/api";
import { Event } from "@/types";

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getEvent(id);
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-surface mb-3">대회를 찾을 수 없습니다</h1>
            <Link href="/events" className="text-accent hover:text-accent-light text-base transition-colors">목록으로 돌아가기</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-muted hover:text-accent transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/events" className="text-muted hover:text-accent transition-colors">대회</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub truncate">{event.title}</span>
        </div>

        {/* Hero Image */}
        {event.image && (
          <div className="rounded-3xl overflow-hidden mb-8 border border-border-custom">
            <img src={event.image} alt={event.title} className="w-full h-64 md:h-96 object-cover" />
          </div>
        )}

        {/* Title + Meta */}
        <div className="mb-8">
          <div className="flex items-start gap-4 flex-wrap mb-4">
            {event.prize && (
              <span className="gold-btn text-dark text-sm font-bold px-4 py-1.5 rounded-full shadow-md shadow-accent/20">{event.prize}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-surface mb-4 leading-tight">{event.title}</h1>
          <Link href={`/store/${event.store_id}`} className="text-accent hover:text-accent-light text-lg font-medium transition-colors">
            {event.store_name} →
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-card rounded-2xl p-5 border border-border-custom text-center">
            <p className="text-muted text-sm mb-1">날짜</p>
            <p className="text-surface text-lg font-bold">{eventDate.getMonth() + 1}월 {eventDate.getDate()}일</p>
            <p className="text-muted text-sm">({dayNames[eventDate.getDay()]}요일)</p>
          </div>
          <div className="bg-card rounded-2xl p-5 border border-border-custom text-center">
            <p className="text-muted text-sm mb-1">시간</p>
            <p className="text-surface text-lg font-bold">{event.time}</p>
          </div>
          {event.buy_in && (
            <div className="bg-card rounded-2xl p-5 border border-border-custom text-center">
              <p className="text-muted text-sm mb-1">바이인</p>
              <p className="text-surface text-lg font-bold">{event.buy_in}</p>
            </div>
          )}
          {event.prize && (
            <div className="bg-card rounded-2xl p-5 border border-border-custom text-center gold-border">
              <p className="text-muted text-sm mb-1">상금</p>
              <p className="gold-text-shine text-lg font-bold">{event.prize}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-card rounded-3xl border border-border-custom p-8 mb-8">
          <h2 className="text-surface font-bold text-xl mb-4">대회 안내</h2>
          <p className="text-sub text-base leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Details */}
        {event.details && (
          <div className="bg-card rounded-3xl border border-border-custom p-8 mb-8">
            <h2 className="text-surface font-bold text-xl mb-4">상세 정보</h2>
            <p className="text-sub text-base leading-relaxed whitespace-pre-wrap">{event.details}</p>
          </div>
        )}

        {/* Location */}
        {event.location && (
          <div className="bg-card rounded-3xl border border-border-custom p-8 mb-8">
            <h2 className="text-surface font-bold text-xl mb-4">장소</h2>
            <p className="text-sub text-base">{event.location}</p>
          </div>
        )}

        {/* Store Link */}
        <div className="bg-card rounded-3xl border border-border-custom p-8 mb-10 flex items-center justify-between">
          <div>
            <p className="text-muted text-sm mb-1">주최 매장</p>
            <p className="text-surface text-lg font-bold">{event.store_name}</p>
          </div>
          <Link href={`/store/${event.store_id}`} className="gold-btn text-dark text-sm font-bold px-6 py-3 rounded-full shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all">
            매장 보기
          </Link>
        </div>

        {/* Back */}
        <div className="text-center">
          <Link href="/events" className="inline-flex items-center gap-2 text-muted hover:text-accent text-base transition-colors group">
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
