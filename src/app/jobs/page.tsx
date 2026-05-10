"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Job } from "@/types";
import { regionData, allRegions } from "@/data/areas";

const REGIONS = ["전체", ...allRegions];
const STATUSES = ["전체", "지금 가능", "예약 가능", "일하는 중"];
const GENDERS = ["전체", "남", "여"];
const SORTS = [
  { value: "available", label: "즉시 가능순" },
  { value: "recent", label: "최근 등록순" },
  { value: "updated", label: "최근 업데이트순" },
];

interface DealerProfile {
  id: string; nickname: string; role: string; status: string; status_updated_at: string;
  experience: string; areas: string[]; bio: string; avatar: string;
  contact_kakao: string; contact_telegram: string; contact_phone: string;
  created_at: string; gender: string;
}

export default function JobsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"dealer" | "jobs">("dealer");
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRegion, setFilterRegion] = useState("전체");
  const [filterDistrict, setFilterDistrict] = useState("전체");
  const [filterGender, setFilterGender] = useState("전체");
  const [filterStatus, setFilterStatus] = useState("전체");
  const [filterRole, setFilterRole] = useState("딜러");
  const [filterJobType, setFilterJobType] = useState<"전체" | "구인" | "구직">("전체");
  const [sortBy, setSortBy] = useState("available");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*").eq("user_type", "딜러"),
      supabase.from("jobs").select("*").order("pinned_rank", { ascending: false }).order("created_at", { ascending: false }),
    ]).then(([{ data: d }, { data: j }]) => {
      const allJobs = j || [];
      // 사용자별 최신 구직 글에서 role 가져오기 (profile.role은 시스템 권한 값이라 미사용)
      const userIdToJobRole: Record<string, string> = {};
      allJobs.filter(job => job.type === "구직" && job.user_id).forEach(job => {
        if (!userIdToJobRole[job.user_id]) userIdToJobRole[job.user_id] = job.role || "딜러";
      });
      const profileDealers = (d || [])
        .filter(p => p.status !== "비노출")
        .map(p => ({ ...p, role: userIdToJobRole[p.id] || p.user_type || "딜러" }));

      // Merge: 구직글 작성자도 딜러 카드에 포함 (profiles에 없는 경우)
      // ⚠️ 한 user_id가 여러 구직 글을 작성할 수 있으므로 카드 id는 job.id (글 ID) 사용해야 React key 충돌 방지
      const profileIds = new Set(profileDealers.map(p => p.id));
      const jobDealers = allJobs
        .filter(job => job.type === "구직" && !profileIds.has(job.user_id))
        .map(job => ({
          id: job.id,
          nickname: job.nickname,
          role: job.role || "딜러",
          status: "지금 가능",
          status_updated_at: job.created_at,
          experience: job.experience,
          areas: job.areas || [],
          bio: job.message || "",
          avatar: job.photo || "",
          contact_kakao: "",
          contact_telegram: "",
          contact_phone: "",
          contact: (job as any).contact || "",
          created_at: job.created_at,
          gender: (job as any).gender || "",
        }));

      // Parse contact field for job dealers (각 카드의 contact 문자열에서 직접 파싱 — id별 매칭이라 정확)
      jobDealers.forEach(d => {
        if (d.contact) {
          const parts = d.contact.split(" / ");
          parts.forEach((p: string) => {
            if (p.startsWith("카카오톡:")) d.contact_kakao = p.replace("카카오톡: ", "");
            if (p.startsWith("텔레그램:")) d.contact_telegram = p.replace("텔레그램: ", "");
            if (p.startsWith("전화:")) d.contact_phone = p.replace("전화: ", "");
          });
        }
      });

      setDealers([...profileDealers, ...jobDealers]);
      setJobs(allJobs);
      setLoading(false);
    });
  }, []);

  const filteredDealers = useMemo(() => {
    let result = dealers;
    if (filterRegion !== "전체") result = result.filter(d => d.areas && d.areas.length > 0 && d.areas.some((a: string) => a.includes(filterRegion)));
    if (filterDistrict !== "전체") result = result.filter(d => d.areas && d.areas.some((a: string) => a.includes(filterDistrict)));
    if (filterStatus !== "전체") result = result.filter(d => d.status === filterStatus);
    if (filterGender !== "전체") result = result.filter(d => d.gender === filterGender);
    if (filterRole !== "전체") {
      result = result.filter(d => d.role === filterRole);
    }

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
  }, [dealers, filterRegion, filterDistrict, filterStatus, filterGender, filterRole, sortBy]);

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (filterJobType !== "전체") result = result.filter(j => j.type === filterJobType);
    if (filterRole !== "전체") result = result.filter(j => j.role === filterRole);
    if (filterRegion !== "전체") result = result.filter(j => j.areas && j.areas.some((a: string) => a.includes(filterRegion)));
    if (filterDistrict !== "전체") result = result.filter(j => j.areas && j.areas.some((a: string) => a.includes(filterDistrict)));
    if (filterGender !== "전체") result = result.filter((j: any) => j.gender === filterGender);
    return result;
  }, [jobs, filterJobType, filterRole, filterRegion, filterDistrict, filterGender]);

  const timeAgo = (date: string | null) => {
    if (!date) return ""; const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d / 60000);
    if (m < 1) return "방금 전"; if (m < 60) return `${m}분 전`; const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`; return `${Math.floor(h / 24)}일 전`;
  };

  const statusColor = (s: string) => s === "지금 가능" ? "bg-green-500" : s === "예약 가능" ? "bg-blue-500" : s === "일하는 중" ? "bg-yellow-500" : "bg-gray-400";
  const statusBg = (s: string) => s === "지금 가능" ? "bg-green-100 text-green-700" : s === "예약 가능" ? "bg-blue-100 text-blue-700" : s === "일하는 중" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";

  // Region + Role stats
  const regionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    dealers.forEach(d => {
      d.areas?.forEach((a: string) => {
        const r = a.split(" ")[0]; counts[r] = (counts[r] || 0) + 1;
      });
    });
    return counts;
  }, [dealers]);

  const roleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    // From jobs
    jobs.filter(j => j.type === "구직").forEach(j => { counts[j.role] = (counts[j.role] || 0) + 1; });
    return counts;
  }, [jobs]);

  const availableCount = dealers.length;

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
              <p className="text-muted text-[14px]">현재 <span className="text-accent font-bold">{availableCount}명</span>이 즉시 연결 가능합니다</p>
              {/* Region + Role stats */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Object.entries(regionStats).map(([r, c]) => (
                  <span key={r} className="text-[11px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-lg">{r}({c}명)</span>
                ))}
                <span className="w-px h-4 bg-border-custom self-center mx-0.5" />
                {Object.entries(roleStats).map(([r, c]) => (
                  <span key={r} className="text-[11px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-lg">{r}({c}명)</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {user ? (
                <Link href="/jobs/write" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[12px] md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-lg transition-all whitespace-nowrap shadow-md shadow-red-500/20">딜러/서빙/매니저/플로어 구인구직 등록하기</Link>
              ) : (
                <Link href="/register" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[12px] md:text-sm font-bold px-4 md:px-5 py-2.5 rounded-lg transition-all whitespace-nowrap shadow-md shadow-red-500/20">딜러/서빙/매니저/플로어 구인구직 등록하기</Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3 overflow-x-auto hide-scrollbar -mx-5 md:-mx-10 px-5 md:px-10">
          <div className="inline-flex bg-white rounded-lg p-1 card-shadow">
            <button onClick={() => { setTab("jobs"); setFilterJobType("구인"); setFilterRole("전체"); }} className={`px-3 md:px-5 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap ${tab === "jobs" && filterJobType === "구인" ? "bg-accent text-white" : "text-sub"}`}>일자리 찾기</button>
            <button onClick={() => { setTab("dealer"); setFilterRole("딜러"); }} className={`px-3 md:px-5 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap ${tab === "dealer" && filterRole === "딜러" ? "bg-accent text-white" : "text-sub"}`}>딜러 찾기</button>
            <button onClick={() => { setTab("dealer"); setFilterRole("서빙"); }} className={`px-3 md:px-5 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap ${tab === "dealer" && filterRole === "서빙" ? "bg-accent text-white" : "text-sub"}`}>서빙 찾기</button>
            <button onClick={() => { setTab("dealer"); setFilterRole("매니저"); }} className={`px-3 md:px-5 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap ${tab === "dealer" && filterRole === "매니저" ? "bg-accent text-white" : "text-sub"}`}>매니저 찾기</button>
            <button onClick={() => { setTab("dealer"); setFilterRole("플로어"); }} className={`px-3 md:px-5 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap ${tab === "dealer" && filterRole === "플로어" ? "bg-accent text-white" : "text-sub"}`}>플로어 찾기</button>
            <button onClick={() => { setTab("jobs"); setFilterJobType("전체"); }} className={`px-3 md:px-5 py-2 rounded-md text-[12px] md:text-[13px] font-semibold transition-all whitespace-nowrap ${tab === "jobs" && filterJobType === "전체" ? "bg-accent text-white" : "text-sub"}`}>구인/구직글</button>
          </div>
        </div>

        {/* Filter toggle (전체 폭) */}
        <button onClick={() => setShowFilter(!showFilter)} className={`w-full card-shadow px-4 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap mb-5 transition-all ${
          (filterRegion !== "전체" || filterStatus !== "전체" || filterGender !== "전체") ? "bg-accent text-white" : "bg-white text-sub"
        }`}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          <span>필터 (조건 선택){(filterRegion !== "전체" || filterStatus !== "전체" || filterGender !== "전체") && " · 적용중"}</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${showFilter ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {/* Filter panel */}
        {showFilter && (
          <div className="bg-white rounded-2xl card-shadow p-5 mb-5 space-y-4">
            {tab === "dealer" ? (
              <>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">지역</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map(r => <button key={r} onClick={() => { setFilterRegion(r); setFilterDistrict("전체"); }} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterRegion === r ? "bg-accent text-white" : "bg-bg text-sub"}`}>{r}</button>)}
                  </div>
                </div>
                {filterRegion !== "전체" && regionData[filterRegion] && (
                  <div>
                    <p className="text-sub text-[12px] font-semibold mb-2">{filterRegion} 세부 지역</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setFilterDistrict("전체")} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterDistrict === "전체" ? "bg-accent text-white" : "bg-bg text-sub"}`}>전체</button>
                      {regionData[filterRegion].map(d => (
                        <button key={d} onClick={() => setFilterDistrict(d)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterDistrict === d ? "bg-accent text-white" : "bg-bg text-sub"}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">상태</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map(s => <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterStatus === s ? "bg-accent text-white" : "bg-bg text-sub"}`}>{s}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">성별</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENDERS.map(g => <button key={g} onClick={() => setFilterGender(g)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterGender === g ? "bg-accent text-white" : "bg-bg text-sub"}`}>{g}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">정렬</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SORTS.map(s => <button key={s.value} onClick={() => setSortBy(s.value)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${sortBy === s.value ? "bg-accent text-white" : "bg-bg text-sub"}`}>{s.label}</button>)}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">직종</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["전체", "딜러", "서빙", "매니저", "플로어"].map(r => <button key={r} onClick={() => setFilterRole(r)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterRole === r ? "bg-accent text-white" : "bg-bg text-sub"}`}>{r}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">지역</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map(r => <button key={r} onClick={() => { setFilterRegion(r); setFilterDistrict("전체"); }} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterRegion === r ? "bg-accent text-white" : "bg-bg text-sub"}`}>{r}</button>)}
                  </div>
                </div>
                {filterRegion !== "전체" && regionData[filterRegion] && (
                  <div>
                    <p className="text-sub text-[12px] font-semibold mb-2">{filterRegion} 세부 지역</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setFilterDistrict("전체")} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterDistrict === "전체" ? "bg-accent text-white" : "bg-bg text-sub"}`}>전체</button>
                      {regionData[filterRegion].map(d => (
                        <button key={d} onClick={() => setFilterDistrict(d)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterDistrict === d ? "bg-accent text-white" : "bg-bg text-sub"}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sub text-[12px] font-semibold mb-2">성별</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GENDERS.map(g => <button key={g} onClick={() => setFilterGender(g)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filterGender === g ? "bg-accent text-white" : "bg-bg text-sub"}`}>{g}</button>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && tab === "dealer" && (
          <p className="text-muted text-[13px] mb-3">검색 결과 <span className="text-accent font-bold">{filteredDealers.length}</span>명</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : tab === "dealer" ? (
          /* ─── Dealer Cards ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDealers.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl card-shadow">
                <p className="text-muted text-lg mb-2">조건에 맞는 딜러가 없습니다</p>
                {(filterRegion !== "전체" || filterStatus !== "전체") && (
                  <button onClick={() => { setFilterRegion("전체"); setFilterStatus("전체"); }}
                    className="text-accent text-sm font-semibold hover:underline">필터 초기화</button>
                )}
              </div>
            ) : filteredDealers.map(d => (
              <div key={d.id} className="bg-white rounded-2xl card-shadow overflow-hidden hover:card-shadow-hover transition-all flex md:flex-col">
                {/* Photo / Placeholder */}
                <div className="w-32 md:w-full md:aspect-square shrink-0 bg-bg overflow-hidden relative">
                  {d.avatar ? (
                    <img src={d.avatar} alt={d.nickname}
                      className={`w-full h-full ${d.avatar.includes("/posters/") ? "object-contain" : "object-cover object-top"}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent/5 min-h-32">
                      <svg className="w-10 h-10 md:w-14 md:h-14 text-accent/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-5 flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 md:mb-3 flex-wrap">
                    <p className="text-surface text-[14px] md:text-[16px] font-bold truncate">{d.nickname}</p>
                    {d.role && (
                      <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full ${
                        d.role === "딜러" ? "bg-emerald-100 text-emerald-700" :
                        d.role === "서빙" ? "bg-amber-100 text-amber-700" :
                        d.role === "매니저" ? "bg-indigo-100 text-indigo-700" :
                        d.role === "플로어" ? "bg-rose-100 text-rose-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{d.role}</span>
                    )}
                    <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full ${statusBg(d.status || "")}`}>{d.status || "등록됨"}</span>
                  </div>
                  <p className="text-muted text-[11px] md:text-[12px] line-clamp-2">{d.areas?.join(", ")}{d.experience && ` · ${d.experience}`}</p>
                  <div className="flex items-center gap-1.5 text-[10px] md:text-[12px] text-muted my-1.5 md:mb-3">
                    <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${statusColor(d.status || "")}`} />
                    <span>{timeAgo(d.status_updated_at || d.created_at)}</span>
                  </div>
                  {d.bio && <p className="text-sub text-[11px] md:text-[13px] mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">{d.bio}</p>}
                  {/* Contact icons */}
                  <div className="flex gap-1 md:gap-2 mt-auto md:pt-2">
                    {d.contact_phone && (
                      <a href={`tel:${d.contact_phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 flex-1 bg-accent hover:bg-accent-hover text-white text-[11px] md:text-[12px] font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl justify-center transition-all">
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        전화
                      </a>
                    )}
                    {d.contact_kakao && (
                      <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(d.contact_kakao); alert(`카카오톡 ID: ${d.contact_kakao} (복사됨)`); }} className="flex items-center gap-1 flex-1 bg-[#FEE500] hover:bg-[#e6cf00] text-[#3C1E1E] text-[11px] md:text-[12px] font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl justify-center transition-all">
                        <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.516 6.467-.197.735-.714 2.666-.818 3.08-.128.512.188.504.395.367.163-.108 2.592-1.76 3.637-2.477.733.104 1.49.16 2.27.16 5.523 0 10-3.463 10-7.691S17.523 3 12 3z"/></svg>
                        카톡
                      </button>
                    )}
                    {d.contact_telegram && (
                      <a href={`https://t.me/${d.contact_telegram}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 flex-1 bg-[#229ED9] hover:bg-[#1a8bc2] text-white text-[11px] md:text-[12px] font-bold py-1.5 md:py-2.5 rounded-lg md:rounded-xl justify-center transition-all">
                        <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-2.02 1.28-5.7 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.84-.28-1.51-.43-1.45-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .38.03.55.17.14.12.18.28.2.45-.01.06-.01.24-.02.38z"/></svg>
                        텔레
                      </a>
                    )}
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
