"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";

export default function TournamentPage() {
  const { user, profile } = useAuth();
  const { events } = useEvents();
  const [applied, setApplied] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from("tournament_applications").select("event_id").eq("user_id", user.id)
        .then(({ data }) => setApplied(data?.map(a => a.event_id) || []));
    }
  }, [user]);

  const handleApply = async (eventId: string) => {
    if (!user) return;
    await supabase.from("tournament_applications").insert({ user_id: user.id, event_id: eventId });
    setApplied(prev => [...prev, eventId]);
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        {/* Hero */}
        <div className="bg-[#00874a] rounded-3xl p-8 md:p-12 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-[#006b3a] to-[#00a05a] opacity-50" />
          <div className="relative">
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-3">FREE TOURNAMENT</p>
            <h1 className="text-3xl md:text-4xl font-black mb-3">무료 토너먼트</h1>
            <p className="text-white/80 text-lg mb-6">가입만 하면 무료 참가! 지금 바로 신청하세요</p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 rounded-xl px-5 py-3">
                <p className="text-white/60 text-[11px] mb-0.5">참가비</p>
                <p className="text-white text-lg font-black">무료</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3">
                <p className="text-white/60 text-[11px] mb-0.5">혜택</p>
                <p className="text-white text-lg font-black">무료 바인권</p>
              </div>
              <div className="bg-white/20 rounded-xl px-5 py-3">
                <p className="text-white/60 text-[11px] mb-0.5">추천 보상</p>
                <p className="text-white text-lg font-black">친구 1명 = 무료 참가권</p>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <div className="bg-white rounded-2xl card-shadow p-6 md:p-8 mb-8 text-center">
            <h2 className="text-xl font-black text-surface mb-2">회원가입하고 무료로 참가하세요!</h2>
            <p className="text-muted text-[14px] mb-5">가입 시 무료 참가권 + 쿠폰이 지급됩니다</p>
            <div className="flex gap-3 justify-center">
              <Link href="/register" className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3 rounded-xl transition-all">회원가입</Link>
              <Link href="/login" className="border border-border-custom text-sub font-semibold px-8 py-3 rounded-xl hover:bg-[#f5f6f8] transition-all">로그인</Link>
            </div>
          </div>
        )}

        {/* Event list */}
        <h2 className="text-xl font-black text-surface mb-5">참가 가능한 토너먼트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => {
            const d = new Date(event.date);
            const isApplied = applied.includes(event.id);
            return (
              <div key={event.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-surface text-[17px] font-black">{event.title}</h3>
                      <p className="text-sub text-[14px] mt-1">{event.store_name}</p>
                    </div>
                    {event.prize && <span className="bg-[#00874a] text-white text-[12px] font-bold px-3 py-1 rounded-full shrink-0">{event.prize}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[13px] text-muted mb-4">
                    <span>{d.getFullYear()}.{d.getMonth()+1}.{d.getDate()}</span>
                    <span>{event.time}</span>
                  </div>
                  {user ? (
                    isApplied ? (
                      <div className="bg-accent/10 text-accent text-[14px] font-bold py-3 rounded-xl text-center">신청 완료</div>
                    ) : (
                      <button onClick={() => handleApply(event.id)} className="w-full bg-[#00874a] hover:bg-[#006b3a] text-white font-bold py-3 rounded-xl transition-all text-[14px]">
                        무료 참가 신청
                      </button>
                    )
                  ) : (
                    <Link href="/register" className="block w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-center text-[14px]">
                      가입하고 무료 참가
                    </Link>
                  )}
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
