"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getJobs } from "@/lib/api";
import { Job } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"구직" | "구인">("구직");
  const [filterRole, setFilterRole] = useState("전체");

  useEffect(() => {
    getJobs().then(data => { setJobs(data); setLoading(false); });
  }, []);

  const filtered = jobs
    .filter(j => j.type === tab)
    .filter(j => filterRole === "전체" ? true : j.role === filterRole);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="container-main py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-surface">구인구직</h1>
            <p className="text-muted text-sm mt-1">{tab === "구직" ? "딜러 · 서빙 구직자를 찾아보세요" : "딜러 · 서빙 구인 공고를 확인하세요"}</p>
          </div>
          <Link href="/jobs/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shrink-0">
            글 작성
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-bg rounded-lg p-1">
            {(["구직", "구인"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${tab === t ? "bg-accent text-white" : "text-muted hover:text-surface"}`}>
                {t === "구직" ? "구직글" : "구인글"}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {["전체", "딜러", "서빙"].map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${filterRole === r ? "bg-surface text-white" : "text-muted hover:text-surface"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <svg className="w-16 h-16 text-[#eee] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-muted text-lg mb-2">{tab === "구직" ? "등록된 구직글이 없습니다" : "등록된 구인글이 없습니다"}</p>
            <p className="text-muted text-sm mb-6">첫 번째 글을 작성해보세요</p>
            <Link href="/jobs/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-6 py-3 rounded-lg inline-block transition-all">
              글 작성하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
                {job.photo ? (
                  <div className="h-48 bg-bg overflow-hidden">
                    <img src={job.photo} alt={job.nickname} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-28 bg-bg flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#ddd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab === "구직" ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" : "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"} />
                    </svg>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${job.type === "구인" ? "bg-orange-50 text-orange-500" : job.role === "딜러" ? "bg-accent-light text-accent" : "bg-blue-50 text-blue-500"}`}>
                      {job.type === "구인" ? "구인" : job.role}
                    </span>
                    <h3 className="text-surface font-bold text-[16px]">{job.type === "구인" ? job.store_name || job.nickname : job.nickname}</h3>
                  </div>

                  {job.type === "구인" && job.store_name && (
                    <div className="flex items-center gap-1.5 mb-2 text-[13px] text-sub">
                      <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
                      {job.store_name}
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 mb-2 text-[13px] text-sub">
                    <svg className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {job.experience}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.areas.map(area => (
                      <span key={area} className="text-[11px] bg-bg text-muted px-2 py-0.5 rounded">{area}</span>
                    ))}
                  </div>

                  {job.message && <p className="text-muted text-[13px] mb-3 line-clamp-2">{job.message}</p>}

                  <div className="flex items-center gap-2 pt-3 border-t border-border-custom">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${job.contact_type === "카카오톡" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-600"}`}>
                      {job.contact_type}
                    </span>
                    <span className="text-surface text-sm font-medium">{job.contact}</span>
                  </div>

                  <p className="text-[#ccc] text-[11px] mt-3">{job.created_at?.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
