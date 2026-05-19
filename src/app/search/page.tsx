"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { useStores } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";
import { Job, Store } from "@/types";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  );
}

type Tab = "all" | "stores" | "jobs";

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [tab, setTab] = useState<Tab>("all");
  const { stores } = useStores();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    supabase.from("jobs").select("*").order("pinned_rank", { ascending: false }).order("created_at", { ascending: false })
      .then(({ data }) => setJobs((data as Job[]) || []));
  }, []);

  const term = q.trim().toLowerCase();
  const matchedStores: Store[] = !term ? [] : stores.filter(s =>
    s.name?.toLowerCase().includes(term) ||
    s.address?.toLowerCase().includes(term) ||
    s.region?.toLowerCase().includes(term) ||
    s.tags?.some((t: string) => t.toLowerCase().includes(term))
  );
  const matchedJobs: Job[] = !term ? [] : jobs.filter(j =>
    j.nickname?.toLowerCase().includes(term) ||
    j.role?.toLowerCase().includes(term) ||
    j.store_name?.toLowerCase().includes(term) ||
    j.areas?.some((a: string) => a.toLowerCase().includes(term)) ||
    j.message?.toLowerCase().includes(term)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const showStores = tab === "all" || tab === "stores";
  const showJobs = tab === "all" || tab === "jobs";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-surface mb-1">검색 결과</h1>
          {initialQ && (
            <p className="text-muted text-sm mb-5">
              <span className="text-accent font-bold">{initialQ}</span> 에 대한 결과
            </p>
          )}

          {/* Search input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={q} onChange={e => setQ(e.target.value)}
                className="w-full bg-white border border-border-custom rounded-xl pl-12 pr-24 py-3.5 text-[15px] focus:outline-none focus:border-accent"
                placeholder="매장명, 지역, 닉네임, 직종으로 검색" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent-hover text-white font-bold text-[13px] px-4 py-2 rounded-lg transition-all">
                검색
              </button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex bg-bg rounded-xl p-1 mb-5">
            {[
              { k: "all" as Tab, l: `전체 (${matchedStores.length + matchedJobs.length})` },
              { k: "stores" as Tab, l: `매장 (${matchedStores.length})` },
              { k: "jobs" as Tab, l: `구인구직 (${matchedJobs.length})` },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all ${tab === t.k ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
                {t.l}
              </button>
            ))}
          </div>

          {!term ? (
            <div className="bg-white rounded-2xl card-shadow py-16 text-center text-muted text-sm">
              검색어를 입력해주세요
            </div>
          ) : matchedStores.length === 0 && matchedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl card-shadow py-16 text-center">
              <p className="text-muted text-lg mb-1">검색 결과가 없습니다</p>
              <p className="text-muted text-sm">매장명, 지역, 닉네임, 직종 등으로 다시 검색해보세요</p>
            </div>
          ) : (
            <div className="space-y-8">
              {showStores && matchedStores.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-surface text-lg font-bold">매장 <span className="text-accent">({matchedStores.length})</span></h2>
                    {matchedStores.length > 6 && tab === "all" && (
                      <button onClick={() => setTab("stores")} className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(tab === "all" ? matchedStores.slice(0, 6) : matchedStores).map(s => (
                      <StoreCard key={s.id} store={s} />
                    ))}
                  </div>
                </section>
              )}

              {showJobs && matchedJobs.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-surface text-lg font-bold">구인구직 <span className="text-accent">({matchedJobs.length})</span></h2>
                    {matchedJobs.length > 6 && tab === "all" && (
                      <button onClick={() => setTab("jobs")} className="text-accent text-[13px] font-semibold hover:underline">전체보기 →</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(tab === "all" ? matchedJobs.slice(0, 6) : matchedJobs).map(j => (
                      <Link key={j.id} href="/jobs" className="bg-white rounded-2xl card-shadow p-4 hover:card-shadow-hover transition-all flex gap-3">
                        {j.photo && (
                          <div className="w-16 h-16 rounded-lg bg-bg shrink-0 overflow-hidden flex items-center justify-center">
                            <img src={j.photo} alt={j.nickname}
                              className={`w-full h-full ${j.photo.includes("/posters/") ? "object-contain" : "object-cover object-top"}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${j.type === "구인" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-700"}`}>{j.type}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-bg text-sub">{j.role}</span>
                          </div>
                          <p className="text-surface text-[14px] font-bold truncate">{j.nickname}{j.store_name ? ` · ${j.store_name}` : ""}</p>
                          <p className="text-muted text-[12px] truncate mt-0.5">{(j.areas || []).join(", ")}{j.experience ? ` · ${j.experience}` : ""}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
