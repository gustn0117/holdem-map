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
        {/* Hero Banner */}
        <div className="rounded-2xl card-shadow overflow-hidden mb-6 bg-[#00874a] relative">
          <div className="absolute inset-0 bg-linear-to-br from-[#002a15] via-[#006b3a] to-[#00a05a]" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative p-8 md:p-12 text-white">
            <span className="inline-block text-[10px] md:text-[11px] font-black text-yellow-300 bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/30 uppercase tracking-widest mb-3">FREE TOURNAMENT</span>
            <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">무료 토너먼트 신청</h1>
            <p className="text-white/85 text-[15px] md:text-lg mb-6">가입만 하면 무료 참가 · 친구 초대하면 추가 참가권 지급</p>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-5 py-2.5 md:py-3 border border-white/20">
                <p className="text-white/70 text-[10px] md:text-[11px] mb-0.5">참가비</p>
                <p className="text-white text-[15px] md:text-lg font-black">무료</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-5 py-2.5 md:py-3 border border-white/20">
                <p className="text-white/70 text-[10px] md:text-[11px] mb-0.5">혜택</p>
                <p className="text-white text-[15px] md:text-lg font-black">무료 바인권</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl px-3 md:px-5 py-2.5 md:py-3 border border-white/20">
                <p className="text-white/70 text-[10px] md:text-[11px] mb-0.5">추천 보상</p>
                <p className="text-white text-[13px] md:text-lg font-black">친구 1명당</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-2xl card-shadow p-6 md:p-8 mb-6">
          <h2 className="text-surface text-lg md:text-xl font-black mb-4">이벤트 안내</h2>
          <div className="space-y-4 text-sub text-[14px] md:text-[15px] leading-relaxed">
            <div>
              <p className="text-surface font-bold mb-1">🎯 참가 방법</p>
              <p className="text-muted text-[13px] md:text-[14px]">홀덤맵KOREA 회원가입 후 아래 토너먼트 목록에서 원하는 대회를 선택하여 무료 참가 신청하세요.</p>
            </div>
            <div>
              <p className="text-surface font-bold mb-1">🎁 신규 가입 혜택</p>
              <p className="text-muted text-[13px] md:text-[14px]">가입 즉시 무료 참가권 1장 + 웰컴 쿠폰이 지급됩니다.</p>
            </div>
            <div>
              <p className="text-surface font-bold mb-1">👥 친구 초대 혜택</p>
              <p className="text-muted text-[13px] md:text-[14px]">친구를 초대할 때마다 추가 무료 참가권이 지급됩니다. 초대 링크는 마이페이지에서 확인하세요.</p>
            </div>
            <div>
              <p className="text-surface font-bold mb-1">⚠️ 유의사항</p>
              <div className="text-muted text-[13px] md:text-[14px] space-y-1.5">
                <p>참가 신청은 매장별 정원 내에서 선착순으로 마감됩니다. 현장 확인을 위해 본인 신분증을 지참해 주세요.</p>
                <p className="pt-1.5 border-t border-border-custom/60 mt-2 text-[12px] md:text-[13px]">※ 본 토너먼트는 홀덤맵KOREA와 무관하며, 각 업장에서 개별적으로 진행됩니다.</p>
                <p className="text-[12px] md:text-[13px]">※ 본 사이트는 운영·모집·정산 등에 관여하지 않으며, 이용은 업장 기준에 따릅니다.</p>
                <p className="text-[12px] md:text-[13px]">※ 관련 법령에 위반될 수 있는 행위는 지원하지 않습니다.</p>
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
