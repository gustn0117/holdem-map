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

  useEffect(() => {
    supabase.from("jobs").select("*").eq("id", id).single()
      .then(({ data }) => { setJob(data); setLoading(false); });
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
          <h1 className="text-2xl font-bold text-surface mb-3">글을 찾을 수 없습니다</h1>
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

              {/* Contact */}
              <div className="border-t border-border-custom pt-6">
                <h3 className="text-surface font-bold text-[15px] mb-3">연락처</h3>
                <div className="flex items-center gap-3 bg-[#f9f9f9] rounded-xl p-4">
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                    job.contact_type === "카카오톡" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}>
                    {job.contact_type}
                  </span>
                  <span className="text-surface text-[16px] font-semibold">{job.contact}</span>
                </div>
              </div>

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
