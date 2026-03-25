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
  const [filterRole, setFilterRole] = useState("전체");

  useEffect(() => {
    getJobs().then(data => { setJobs(data); setLoading(false); });
  }, []);

  const filtered = filterRole === "전체" ? jobs : jobs.filter(j => j.role === filterRole);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-bg">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-surface">구인구직</h1>
            <p className="text-muted text-sm mt-1">딜러 · 서빙 구직자를 찾아보세요</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {["전체", "딜러", "서빙"].map(r => (
                <button key={r} onClick={() => setFilterRole(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filterRole === r ? "bg-accent text-white" : "bg-white text-muted border border-border-custom hover:text-surface"}`}>
                  {r}
                </button>
              ))}
            </div>
            <Link href="/jobs/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">
              구직글 작성
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-border-custom">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-muted text-lg mb-2">아직 등록된 구직글이 없습니다</p>
            <p className="text-muted text-sm mb-6">첫 번째 구직글을 작성해보세요</p>
            <Link href="/jobs/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-6 py-3 rounded-lg inline-block transition-all">
              구직글 작성하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white rounded-xl border border-border-custom overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all">
                {/* Photo */}
                {job.photo ? (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img src={job.photo} alt={job.nickname} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 bg-gray-50 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}

                <div className="p-5">
                  {/* Role badge + nickname */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${job.role === "딜러" ? "bg-accent/10 text-accent" : "bg-blue-50 text-blue-600"}`}>
                      {job.role}
                    </span>
                    <h3 className="text-surface font-bold text-lg">{job.nickname}</h3>
                  </div>

                  {/* Experience */}
                  <div className="flex items-start gap-2 mb-2">
                    <svg className="w-4 h-4 text-muted mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sub text-sm">{job.experience}</p>
                  </div>

                  {/* Areas */}
                  <div className="flex items-start gap-2 mb-3">
                    <svg className="w-4 h-4 text-muted mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div className="flex flex-wrap gap-1">
                      {job.areas.map(area => (
                        <span key={area} className="text-xs bg-gray-100 text-muted px-2 py-0.5 rounded">{area}</span>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  {job.message && (
                    <p className="text-muted text-sm mb-3 line-clamp-2">{job.message}</p>
                  )}

                  {/* Contact */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border-custom">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${job.contact_type === "카카오톡" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-600"}`}>
                      {job.contact_type}
                    </span>
                    <span className="text-surface text-sm font-medium">{job.contact}</span>
                  </div>

                  {/* Date */}
                  <p className="text-muted text-xs mt-3">{job.created_at?.slice(0, 10)}</p>
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
