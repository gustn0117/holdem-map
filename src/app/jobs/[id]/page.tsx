"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types";
import { sanitizeHtml, isHtml, plainTextToHtml } from "@/lib/sanitize";
import { parseJobContact } from "@/lib/jobContact";
import JsonLdScript from "@/components/JsonLd";
import { jobPostingSchema, breadcrumbSchema } from "@/lib/schema";

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

  const schemas = [
    jobPostingSchema({
      id: job.id, type: job.type, role: job.role, store_name: job.store_name,
      areas: job.areas, message: job.message, experience: job.experience,
      gender: job.gender, salary: job.salary, work_hours: job.work_hours,
      headcount: job.headcount, created_at: job.created_at, photo: job.photo,
    }),
    breadcrumbSchema([
      { name: "홈", path: "/" },
      { name: "구인구직", path: "/jobs" },
      { name: `${job.areas?.[0] || ""} ${job.role || "딜러"} ${job.type}`, path: `/jobs/${job.id}` },
    ]),
  ].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <JsonLdScript data={schemas as Parameters<typeof JsonLdScript>[0]["data"]} />
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
              {/* Type label - 구인/구직 시각 강조 */}
              <div className={`inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg text-[11px] font-bold ${
                job.type === "구인" ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {job.type === "구인" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  )}
                </svg>
                {job.type === "구인" ? "매장에서 사람을 구합니다" : "구직 신청 — 일자리 찾아요"}
              </div>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  job.role === "딜러" ? "bg-emerald-100 text-emerald-700" :
                  job.role === "서빙" ? "bg-amber-100 text-amber-700" :
                  job.role === "매니저" ? "bg-indigo-100 text-indigo-700" :
                  job.role === "플로어" ? "bg-rose-100 text-rose-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {job.role}
                </span>
                {job.gender && (
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                    job.gender === "남" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    job.gender === "여" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                    "bg-gray-50 text-gray-600 border border-gray-100"
                  }`}>
                    {job.gender}
                  </span>
                )}
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
                    <p className="text-surface text-[15px] font-semibold">{job.experience || "미입력"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f9f9f9] rounded-xl p-4">
                  <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-muted text-[12px] mb-0.5">{job.type === "구인" ? "근무 지역" : "희망 지역"}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(job.areas || []).map(area => (
                        <span key={area} className="text-[12px] bg-white border border-border-custom text-sub px-2.5 py-0.5 rounded-lg">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 급여 (있을 때만) */}
                {job.salary && (
                  <div className="flex items-start gap-3 bg-[#f9f9f9] rounded-xl p-4">
                    <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-muted text-[12px] mb-0.5">급여</p>
                      <p className="text-surface text-[15px] font-semibold">{job.salary}</p>
                    </div>
                  </div>
                )}

                {/* 근무 시간 (있을 때만) */}
                {job.work_hours && (
                  <div className="flex items-start gap-3 bg-[#f9f9f9] rounded-xl p-4">
                    <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-muted text-[12px] mb-0.5">근무 시간</p>
                      <p className="text-surface text-[15px] font-semibold">{job.work_hours}</p>
                    </div>
                  </div>
                )}

                {/* 모집 인원 (있을 때만) */}
                {job.headcount && (
                  <div className="flex items-start gap-3 bg-[#f9f9f9] rounded-xl p-4">
                    <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-muted text-[12px] mb-0.5">모집 인원</p>
                      <p className="text-surface text-[15px] font-semibold">{job.headcount}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              {job.message && (
                <div className="mb-6">
                  <h3 className="text-surface font-bold text-[15px] mb-2">{job.type === "구인" ? "상세 내용" : "자기 소개"}</h3>
                  <div className="text-sub text-[15px] leading-relaxed bg-[#f9f9f9] rounded-xl p-4 rich-html"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(isHtml(job.message) ? job.message : plainTextToHtml(job.message)) }} />
                </div>
              )}

              {/* Contact — 사용자 작성폼(접두사) + 어드민(원본+contact_type) 형식 모두 파싱 */}
              {(() => {
                const { phone, kakao, telegram } = parseJobContact(job.contact, job.contact_type);
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
