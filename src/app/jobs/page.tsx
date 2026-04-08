"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types";

const REGIONS = ["전체", "서울", "경기", "인천", "지방"];
const STATUSES = ["전체", "지금 가능", "예약 가능", "일하는 중"];
const SORTS = [
  { value: "available", label: "즉시 가능순" },
  { value: "recent", label: "최근 등록순" },
  { value: "updated", label: "최근 업데이트순" },
];

interface DealerProfile {
  id: string; nickname: string; status: string; status_updated_at: string;
  experience: string; areas: string[]; bio: string; avatar: string;
  contact_kakao: string; contact_telegram: string; contact_phone: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"dealer" | "jobs">("dealer");
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState("전체");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterRole, setFilterRole] = useState("전체");
  const [sortBy, setSortBy] = useState("available");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*").eq("user_type", "딜러"),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    ]).then(([{ data: d }, { data: j }]) => {
      // Filter out 비노출 on client (keep null/empty status visible)
      setDealers((d || []).filter(p => p.status !== "비노출"));
      setJobs(j || []);
      setLoading(false);
    });
  }, []);

  const filteredDealers = useMemo(() => {
    let result = dealers;
    if (filterRegion !== "전체") result = result.filter(d => d.areas && d.areas.length > 0 && d.areas.some((a: string) => a.includes(filterRegion)));
    if (filterStatus !== "전체") result = result.filter(d => d.status === filterStatus);

    // Sort: 지금 가능 > 예약 가능 > 일하는 중 > 미설정, then by update time
    const statusOrder: Record<string, number> = { "지금 가능": 0, "예약 가능": 1, "일하는 중": 2 };
    result = [...result].sort((a, b) => {
      if (sortBy === "available" || sortBy === "updated") {
        const sa = statusOrder[a.status] ?? 3, sb = statusOrder[b.status] ?? 3;
        if (sortBy === "available" && sa !== sb) return sa - sb;
      }
      return new Date(b.status_updated_at || b.created_at || 0).getTime() - new Date(a.status_updated_at || a.created_at || 0).getTime();
    });
    return result;
  }, [dealers, filterRegion, filterStatus, sortBy]);

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (filterRole !== "전체") result = result.filter(j => j.role === filterRole);
    return result;
  }, [jobs, filterRole]);

  const timeAgo = (date: string | null) => {
    if (!date) return ""; const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d / 60000);
    if (m < 1) return "방금 전"; if (m < 60) return `${m}분 전`; const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`; return `${Math.floor(h / 24)}일 전`;
  };

  const statusColor = (s: string) => s === "지금 가능" ? "bg-green-500" : s === "예약 가능" ? "bg-blue-500" : s === "일하는 중" ? "bg-yellow-500" : "bg-gray-400";
  const statusBg = (s: string) => s === "지금 가능" ? "bg-green-100 text-green-700" : s === "예약 가능" ? "bg-blue-100 text-blue-700" : s === "일하는 중" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";

  // Region stats
  const regionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    dealers.filter(d => d.status === "지금 가능").forEach(d => {
      d.areas?.forEach(a => {
        const r = a.split(" ")[0]; counts[r] = (counts[r] || 0) + 1;
      });
    });
    return counts;
  }, [dealers]);

  const availableCount = dealers.filter(d => d.status === "지금 가능").length;

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-6 flex-1" style={{ maxWidth: "1400px" }}>
        {/* Hero */}
        <div className="bg-white rounded-2xl card-shadow p-5 md:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5"><span className="live-pulse absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" /></span>
                <h1 className="text-xl font-black text-surface">지금 바로 가능한 인원</h1>
              </div>
              <p className="text-muted text-[14px]">현재 <span className="text-accent font-bold">{availableCount}명</span>의 딜러가 즉시 연결 가능합니다</p>
              {/* Region stats */}
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(regionStats).slice(0, 5).map(([r, c]) => (
                  <span key={r} className="text-[12px] bg-accent/10 text-accent font-semibold px-2.5 py-1 rounded-lg">{r} ({c}명)</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {user ? (
                <Link href="/jobs/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">등록하기</Link>
              ) : (
                <Link href="/register" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">가입하고 등록</Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex bg-white rounded-lg p-1 card-shadow">
            <button onClick={() => setTab("dealer")} className={`px-5 py-2 rounded-md text-[13px] font-semibold transition-all ${tab === "dealer" ? "bg-accent text-white" : "text-sub"}`}>딜러 찾기</button>
            <button onClick={() => setTab("jobs")} className={`px-5 py-2 rounded-md text-[13px] font-semibold transition-all ${tab === "jobs" ? "bg-accent text-white" : "text-sub"}`}>구인/구직글</button>
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className="bg-white card-shadow px-4 py-2 rounded-lg text-[13px] font-semibold text-sub flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            필터
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="bg-white rounded-2xl card-shadow p-5 mb-5 space-y-4">
            {tab === "dealer" ? (
              <>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">지역</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map(r => <button key={r} onClick={() => setFilterRegion(r)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterRegion === r ? "bg-accent text-white" : "bg-[#f5f6f8] text-sub"}`}>{r}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">상태</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map(s => <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterStatus === s ? "bg-accent text-white" : "bg-[#f5f6f8] text-sub"}`}>{s}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">정렬</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SORTS.map(s => <button key={s.value} onClick={() => setSortBy(s.value)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${sortBy === s.value ? "bg-accent text-white" : "bg-[#f5f6f8] text-sub"}`}>{s.label}</button>)}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sub text-[12px] font-semibold mb-2">직종</p>
                <div className="flex gap-1.5">
                  {["전체", "딜러", "서빙", "매니저", "플로어"].map(r => <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterRole === r ? "bg-accent text-white" : "bg-[#f5f6f8] text-sub"}`}>{r}</button>)}
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : tab === "dealer" ? (
          /* ─── Dealer Cards ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDealers.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl card-shadow">
                <p className="text-muted text-lg">조건에 맞는 딜러가 없습니다</p>
              </div>
            ) : filteredDealers.map(d => (
              <div key={d.id} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-lg font-black shrink-0">{d.nickname?.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-surface text-[16px] font-bold truncate">{d.nickname}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBg(d.status || "")}`}>{d.status || "상태 미설정"}</span>
                      </div>
                      <p className="text-muted text-[12px]">{d.areas?.slice(0, 2).join(", ")} · {d.experience || "경력 미입력"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted mb-3">
                    <span className={`w-2 h-2 rounded-full ${statusColor(d.status)}`} />
                    <span>마지막 업데이트 {timeAgo(d.status_updated_at)}</span>
                  </div>
                  {d.bio && <p className="text-sub text-[13px] mb-3 line-clamp-2">{d.bio}</p>}
                  <div className="flex gap-2">
                    {d.contact_phone && <a href={`tel:${d.contact_phone}`} className="flex-1 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-2.5 rounded-xl text-center transition-all">연락하기</a>}
                    {d.contact_kakao && <span className="flex-1 bg-[#f5f6f8] text-sub text-[13px] font-semibold py-2.5 rounded-xl text-center">카톡: {d.contact_kakao}</span>}
                    {!d.contact_phone && !d.contact_kakao && d.contact_telegram && <span className="flex-1 bg-[#f5f6f8] text-sub text-[13px] font-semibold py-2.5 rounded-xl text-center">TG: {d.contact_telegram}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── Job Posts ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl card-shadow">
                <p className="text-muted text-lg">등록된 글이 없습니다</p>
              </div>
            ) : filteredJobs.map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all block">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${job.type === "구인" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-700"}`}>{job.type}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${job.role === "딜러" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-600"}`}>{job.role}</span>
                  </div>
                  <h3 className="text-surface text-[16px] font-bold mb-1">{job.type === "구인" && job.store_name ? job.store_name : job.nickname}</h3>
                  <p className="text-sub text-[13px] mb-2">{job.experience} · {job.areas?.slice(0, 2).join(", ")}</p>
                  {job.message && <p className="text-muted text-[13px] line-clamp-2">{job.message}</p>}
                  <p className="text-muted text-[11px] mt-2">{job.created_at?.slice(0, 10)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
