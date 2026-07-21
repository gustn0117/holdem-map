"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";
import JsonLdScript from "@/components/JsonLd";
import { eventSchema, breadcrumbSchema } from "@/lib/schema";

export default function TournamentPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { events } = useEvents();
  const [applied, setApplied] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from("tournament_applications").select("event_id, user_id")
      .then(({ data }) => {
        const c: Record<string, number> = {};
        (data || []).forEach((a: { event_id: string }) => { c[a.event_id] = (c[a.event_id] || 0) + 1; });
        setCounts(c);
        if (user) setApplied((data || []).filter((a: { user_id: string | null }) => a.user_id === user.id).map((a: { event_id: string }) => a.event_id));
      });
  }, [user]);

  const tickets = (profile as { tournament_tickets?: number } | null)?.tournament_tickets ?? 0;

  const handleApply = async (eventId: string) => {
    if (!user) return;
    if (tickets <= 0) {
      alert("보유한 무료 토너권이 없습니다. 네이버 카페 · 카톡 오픈채팅을 통해 신청 후 지급받아 주세요.");
      return;
    }
    const { error } = await supabase.from("tournament_applications").insert({ user_id: user.id, event_id: eventId });
    if (error) { alert("신청에 실패했습니다."); return; }
    await supabase.from("profiles").update({ tournament_tickets: Math.max(0, tickets - 1) }).eq("id", user.id);
    setApplied(prev => [...prev, eventId]);
    setCounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
    if (refreshProfile) await refreshProfile();
  };

  const todayMsSchema = new Date().setHours(0, 0, 0, 0);
  const schemas = [
    breadcrumbSchema([
      { name: "홈", path: "/" },
      { name: "무료 토너먼트", path: "/tournament" },
    ]),
    ...events
      .filter(e => !e.submitted_by)
      .filter(e => e.is_free_tournament) // 화면에 노출되는 대회와 구조화 데이터를 일치시킴
      .filter(e => new Date(e.end_date || e.date).getTime() >= todayMsSchema)
      .slice(0, 50)
      .map(e => eventSchema({
        id: e.id, title: e.title, store_name: e.store_name, date: e.date,
        time: e.time, end_date: e.end_date, prize: e.prize, image: e.image,
        description: e.description,
      })),
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <JsonLdScript data={schemas} />
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        {/* Hero Banner */}
        <div className="rounded-2xl card-shadow overflow-hidden mb-6 bg-[#00874a] relative">
          <div className="absolute inset-0 bg-linear-to-br from-[#002a15] via-[#006b3a] to-[#00a05a]" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative p-8 md:p-12 text-white">
            <span className="inline-block text-[10px] md:text-[11px] font-black text-yellow-300 bg-yellow-400/15 px-3 py-1 rounded-full border border-yellow-400/30 uppercase tracking-widest mb-3">FREE TOURNAMENT</span>
            <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">무료 토너먼트 신청</h1>
            <p className="text-white/85 text-[15px] md:text-lg">네이버 카페 가입 후 카톡 오픈채팅 참여하면 무료토너 신청권 지급</p>
            {user && (
              <div className="mt-5 inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 border border-white/20">
                <span className="text-white/70 text-[12px]">내 보유 토너권</span>
                <span className="text-white text-[16px] font-black">{tickets}장</span>
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-2xl card-shadow p-6 md:p-8 mb-6">
          <h2 className="text-surface text-lg md:text-xl font-black mb-4">이벤트 안내</h2>
          <div className="space-y-4 text-sub text-[14px] md:text-[15px] leading-relaxed">
            <div>
              <p className="text-surface font-bold mb-3 inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
                참가 방법
              </p>
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center">1</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sub text-[14px] md:text-[15px] mb-2">
                      <strong className="text-surface">네이버 카페 가입</strong> 후 <strong className="text-surface">홀덤 무료토너 신청 게시판</strong>에 글 작성
                    </p>
                    <a href="https://cafe.naver.com/incheonholdem" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#03c75a] hover:bg-[#029f4a] text-white font-bold text-[13px] px-3 py-1.5 rounded-lg transition-all break-all">
                      <span className="font-black text-[14px] leading-none">N</span>
                      네이버 카페 바로가기
                    </a>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-accent text-white text-[13px] font-bold flex items-center justify-center">2</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sub text-[14px] md:text-[15px] mb-2">
                      <strong className="text-surface">카톡 오픈채팅 참여</strong> 후 방장에게 <strong className="text-surface">카페 닉네임</strong> 전달하면 <strong className="text-accent">무료토너 신청권 1장 지급</strong>
                    </p>
                    <a href="https://open.kakao.com/o/pcew2Eoi" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#FEE500] hover:bg-[#e6cf00] text-[#3C1E1E] font-bold text-[13px] px-3 py-1.5 rounded-lg transition-all break-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.08-.128.512.188.504.395.367.163-.108 2.592-1.76 3.637-2.477.733.104 1.49.16 2.27.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
                      카카오톡 오픈채팅 입장
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-surface font-bold mb-1 inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/></svg>
                유의사항
              </p>
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
            <h2 className="text-xl font-black text-surface mb-2">홀덤맵KOREA에 가입하고 토너 참가하세요!</h2>
            <p className="text-muted text-[14px] mb-5">무료 토너 참가는 위 안내된 네이버 카페 · 카톡 오픈채팅을 통해 신청 가능합니다</p>
            <div className="flex gap-3 justify-center">
              <Link href="/register" className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-3 rounded-xl transition-all">회원가입</Link>
              <Link href="/login" className="border border-border-custom text-sub font-semibold px-8 py-3 rounded-xl hover:bg-bg transition-all">로그인</Link>
            </div>
          </div>
        )}

        {/* Event list */}
        <h2 className="text-xl font-black text-surface mb-5">참가 가능한 토너먼트</h2>
        {(() => {
          const todayMs = new Date().setHours(0, 0, 0, 0);
          const upcoming = [...events]
            .filter(e => !e.submitted_by) // 회원 제출 대회 제외 (관리자 공식 토너먼트만)
            .filter(e => e.is_free_tournament) // 어드민에서 '무료토너먼트 노출'로 지정한 대회만
            .filter(e => new Date(e.end_date || e.date).getTime() >= todayMs)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          if (upcoming.length === 0) {
            return <div className="bg-white rounded-2xl card-shadow py-16 text-center text-muted">다가오는 토너먼트가 없습니다</div>;
          }
          return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.map(event => {
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
                  <div className="flex items-center gap-4 text-[13px] text-muted mb-4 flex-wrap">
                    <span>{d.getFullYear()}.{d.getMonth()+1}.{d.getDate()}</span>
                    <span>{event.time}</span>
                    <span className="inline-flex items-center gap-1 ml-auto bg-accent/10 text-accent text-[12px] font-bold px-2.5 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      신청 {counts[event.id] || 0}명
                    </span>
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
          );
        })()}
      </main>
      <Footer />
    </div>
  );
}
