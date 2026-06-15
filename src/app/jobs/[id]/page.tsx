"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("jobs").select("*").eq("id", id).single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setJob(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!job) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-surface mb-3">{error ? "글을 불러올 수 없습니다" : "글을 찾을 수 없습니다"}</h1>
          {error && <p className="text-muted text-sm mb-4">{error}</p>}
          <Link href="/jobs" className="text-accent text-base font-semibold">목록으로 돌아가기</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로
          </Link>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            {/* Photo */}
            {job.photo && (
              <div className="h-64 md:h-80 bg-bg overflow-hidden">
                <img src={job.photo} alt={job.nickname} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  job.type === "구인" ? "bg-blue-50 text-blue-500 border border-blue-100" : "bg-accent/8 text-accent border border-accent/15"
                }`}>
                  {job.type}
                </span>
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  job.role === "딜러" ? "bg-accent-light text-accent" : "bg-blue-50 text-blue-500"
                }`}>
                  {job.role}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-black text-surface mb-1">
                {job.type === "구인" && job.store_name ? job.store_name : job.nickname}
              </h1>
              {job.type === "구인" && job.store_name && (
                <p className="text-sub text-[15px] mb-4">작성자: {job.nickname}</p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-6">
                <div className="flex items-start gap-3 bg-[#f9f9f9] rounded-xl p-4">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-muted text-[12px] mb-0.5">경력</p>
                    <p className="text-surface text-[15px] font-semibold">{job.experience}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f9f9f9] rounded-xl p-4">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-muted text-[12px] mb-0.5">희망 지역</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {job.areas.map(area => (
                        <span key={area} className="text-[12px] bg-white border border-border-custom text-sub px-2.5 py-0.5 rounded-lg">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {job.message && (
                <div className="mb-6">
                  <h3 className="text-surface font-bold text-[15px] mb-2">소개</h3>
                  <p className="text-sub text-[15px] leading-relaxed whitespace-pre-wrap bg-[#f9f9f9] rounded-xl p-4">{job.message}</p>
                </div>
              )}

              {/* Contact — 작성폼이 '카카오톡: ID / 텔레그램: ID / 전화: 010xxx' 형태로 저장하므로 파싱 */}
              {(() => {
                const contact = job.contact || "";
                const kakao = contact.match(/카카오톡:\s*([^\/\n]+?)(?:\s*\/|$)/)?.[1]?.trim() || "";
                const telegram = contact.match(/텔레그램:\s*([^\/\n]+?)(?:\s*\/|$)/)?.[1]?.trim() || "";
                const phone = contact.match(/전화:\s*([^\/\n]+?)(?:\s*\/|$)/)?.[1]?.trim() || "";
                if (!kakao && !telegram && !phone) return null;
                return (
                  <div className="border-t border-border-custom pt-6">
                    <h3 className="text-surface font-bold text-[15px] mb-3">연락처</h3>
                    <div className="flex flex-wrap gap-2">
                      {phone && (
                        <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                          className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          전화 {phone}
                        </a>
                      )}
                      {kakao && (
                        <button onClick={() => { navigator.clipboard.writeText(kakao); alert(`카카오톡 ID: ${kakao} (복사됨)`); }}
                          className="flex items-center gap-1.5 bg-[#FEE500] hover:bg-[#e6cf00] text-[#3C1E1E] text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.08-.128.512.188.504.395.367.163-.108 2.592-1.76 3.637-2.477.733.104 1.49.16 2.27.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
                          카카오톡 {kakao}
                        </button>
                      )}
                      {telegram && (
                        <a href={`https://t.me/${telegram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-[#229ED9] hover:bg-[#1a8bc2] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-2.02 1.28-5.7 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06-.01.24-.02.38z"/></svg>
                          텔레그램 {telegram}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Date */}
              <p className="text-[#ccc] text-[12px] mt-6">{job.created_at?.slice(0, 10)} 작성</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
