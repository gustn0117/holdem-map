"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "지금 가능", label: "지금 가능", color: "bg-green-500", desc: "즉시 근무 가능" },
  { value: "일하는 중", label: "일하는 중", color: "bg-yellow-500", desc: "설정 시간 후 자동 해제" },
  { value: "오늘 마감", label: "오늘 마감", color: "bg-red-500", desc: "다음날 오전 자동 해제" },
  { value: "비노출", label: "비노출", color: "bg-gray-400", desc: "프로필 숨기기" },
];

export default function MyPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [myBookmarks, setMyBookmarks] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [statusHours, setStatusHours] = useState(4);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [loading, user]);

  useEffect(() => {
    if (!profile) return;
    setForm(profile);
    supabase.from("posts").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).then(({ data }) => setMyPosts(data || []));
    supabase.from("jobs").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).then(({ data }) => setMyJobs(data || []));
    supabase.from("applications").select("*, jobs(*)").eq("applicant_id", profile.id).order("created_at", { ascending: false }).then(({ data }) => setMyApps(data || []));
    supabase.from("bookmarks").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).then(({ data }) => setMyBookmarks(data || []));
    // For 업주: get applicants for my jobs
    if (profile.user_type === "업주") {
      supabase.from("jobs").select("id").eq("user_id", profile.id).then(({ data: jobs }) => {
        if (jobs?.length) {
          const ids = jobs.map(j => j.id);
          supabase.from("applications").select("*, profiles(*)").in("job_id", ids).order("created_at", { ascending: false }).then(({ data }) => setApplicants(data || []));
        }
      });
    }
  }, [profile]);

  if (loading || (!loading && user && !profile)) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header /><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div></div>
  );
  if (!user || !profile) return null;

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));
  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors";

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").update({
      nickname: form.nickname, user_type: form.user_type, bio: form.bio, experience: form.experience,
      areas: form.areas, store_name: form.store_name,
      contact_kakao: form.contact_kakao, contact_telegram: form.contact_telegram, contact_phone: form.contact_phone,
    }).eq("id", profile.id);
    await refreshProfile(); setEditing(false); setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    let expiresAt: string | null = null;
    if (status === "일하는 중") expiresAt = new Date(Date.now() + statusHours * 3600000).toISOString();
    else if (status === "오늘 마감") { const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(6, 0, 0, 0); expiresAt = t.toISOString(); }
    await supabase.from("profiles").update({ status, status_expires_at: expiresAt, status_updated_at: new Date().toISOString() }).eq("id", profile.id);
    await refreshProfile();
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    setMyJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("posts").delete().eq("id", id);
    setMyPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleRemoveBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    setMyBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const timeAgo = (date: string | null) => {
    if (!date) return ""; const d = Date.now() - new Date(date).getTime(); const m = Math.floor(d / 60000);
    if (m < 1) return "방금 전"; if (m < 60) return `${m}분 전`; const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`; return `${Math.floor(h / 24)}일 전`;
  };

  // Tab config per user_type
  const tabConfig = profile.user_type === "딜러" ? [
    { key: "info", label: "내 정보" }, { key: "status", label: "상태 설정" },
    { key: "applications", label: "지원 내역" }, { key: "posts", label: "게시글" }, { key: "bookmarks", label: "저장" },
  ] : profile.user_type === "업주" ? [
    { key: "info", label: "업체 정보" }, { key: "jobs", label: "구인 관리" },
    { key: "applicants", label: "지원자" }, { key: "posts", label: "게시글" },
  ] : [
    { key: "info", label: "내 정보" }, { key: "posts", label: "게시글" }, { key: "bookmarks", label: "저장" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 px-4 md:px-12 lg:px-20 py-6" style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        <div>
          {/* Profile header */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-6">
            <div className={`h-20 ${
              profile.user_type === "딜러" ? "bg-linear-to-r from-emerald-500 to-emerald-400" :
              profile.user_type === "업주" ? "bg-linear-to-r from-blue-500 to-blue-400" :
              "bg-linear-to-r from-accent to-emerald-400"
            }`} />
            <div className="px-6 pb-6 -mt-10">
              <div className="flex items-end gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-accent text-3xl font-black shrink-0">
                  {profile.nickname?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-black text-surface">{profile.nickname}</h1>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      profile.user_type === "딜러" ? "bg-emerald-100 text-emerald-700" :
                      profile.user_type === "업주" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}>{profile.user_type}</span>
                    {profile.user_type === "딜러" && (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white ${
                        STATUS_OPTIONS.find(s => s.value === profile.status)?.color || "bg-gray-400"
                      }`}>{profile.status || "비노출"}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[13px]">
                <span className="text-muted">{profile.email?.includes("@phone.holdemmap") ? `전화: ${profile.phone}` : profile.email}</span>
                {profile.user_type === "딜러" && profile.status_updated_at && (
                  <span className="text-muted">상태 변경 {timeAgo(profile.status_updated_at)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mb-6 bg-white rounded-xl card-shadow p-1.5">
            {tabConfig.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`shrink-0 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${
                  tab === t.key ? "bg-accent text-white shadow-sm" : "text-sub hover:bg-[#f5f6f8]"
                }`}>{t.label}</button>
            ))}
          </div>

          {/* ─── INFO TAB ─── */}
          {tab === "info" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              {!editing ? (
                <>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-surface">프로필 정보</h2>
                    <button onClick={() => setEditing(true)} className="text-accent text-[13px] font-semibold">수정</button>
                  </div>
                  <div className="space-y-3">
                    {profile.user_type === "업주" && profile.store_name && <InfoRow label="업체명" value={profile.store_name} />}
                    {profile.bio && <InfoRow label="자기소개" value={profile.bio} />}
                    {profile.experience && <InfoRow label={profile.user_type === "딜러" ? "경력" : "업체 정보"} value={profile.experience} />}
                    {profile.areas?.length > 0 && (
                      <div className="bg-[#f9f9f9] rounded-xl p-4">
                        <p className="text-muted text-[12px] mb-1.5">활동지역</p>
                        <div className="flex flex-wrap gap-1.5">{profile.areas.map(a => <span key={a} className="text-[12px] bg-white border border-border-custom px-2.5 py-0.5 rounded-lg">{a}</span>)}</div>
                      </div>
                    )}
                    <div className="bg-[#f9f9f9] rounded-xl p-4">
                      <p className="text-muted text-[12px] mb-1.5">연락처</p>
                      {profile.contact_kakao && <p className="text-surface text-[14px]">카카오톡: {profile.contact_kakao}</p>}
                      {profile.contact_telegram && <p className="text-surface text-[14px]">텔레그램: {profile.contact_telegram}</p>}
                      {profile.contact_phone && <p className="text-surface text-[14px]">전화: {profile.contact_phone}</p>}
                      {!profile.contact_kakao && !profile.contact_telegram && !profile.contact_phone && <p className="text-muted text-[14px]">미등록</p>}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-5 border-t border-border-custom mt-5">
                    <button onClick={() => { signOut(); router.push("/"); }} className="text-red-400 text-[13px] font-semibold">로그아웃</button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-surface">프로필 수정</h2>
                  <Field label="닉네임"><input className={inputClass} value={form.nickname || ""} onChange={e => set("nickname", e.target.value)} /></Field>
                  <Field label="자기소개"><textarea className={inputClass + " resize-none"} rows={3} value={form.bio || ""} onChange={e => set("bio", e.target.value)} placeholder="간단한 자기소개" /></Field>
                  {(profile.user_type === "딜러" || profile.user_type === "업주") && (
                    <Field label={profile.user_type === "딜러" ? "경력" : "업체 정보"}>
                      <input className={inputClass} value={form.experience || ""} onChange={e => set("experience", e.target.value)} />
                    </Field>
                  )}
                  {profile.user_type === "업주" && <Field label="업체명"><input className={inputClass} value={form.store_name || ""} onChange={e => set("store_name", e.target.value)} /></Field>}
                  <div>
                    <p className="text-sub text-sm font-semibold mb-2">연락처</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3"><span className="w-16 text-[13px] font-semibold shrink-0">카카오톡</span><input className={inputClass} value={form.contact_kakao || ""} onChange={e => set("contact_kakao", e.target.value)} /></div>
                      <div className="flex items-center gap-3"><span className="w-16 text-[13px] font-semibold shrink-0">텔레그램</span><input className={inputClass} value={form.contact_telegram || ""} onChange={e => set("contact_telegram", e.target.value)} /></div>
                      <div className="flex items-center gap-3"><span className="w-16 text-[13px] font-semibold shrink-0">전화번호</span><input className={inputClass} value={form.contact_phone || ""} onChange={e => set("contact_phone", e.target.value)} /></div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setEditing(false)} className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl">취소</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">{saving ? "저장 중..." : "저장"}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STATUS TAB (딜러) ─── */}
          {tab === "status" && profile.user_type === "딜러" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              <h2 className="text-lg font-bold text-surface mb-4">현재 상태</h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => handleStatusChange(s.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${profile.status === s.value ? "border-accent bg-accent/5" : "border-border-custom hover:border-accent/30"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 rounded-full ${s.color}`} />
                      <span className="text-surface text-[14px] font-bold">{s.label}</span>
                    </div>
                    <p className="text-muted text-[11px]">{s.desc}</p>
                  </button>
                ))}
              </div>
              {profile.status === "일하는 중" && (
                <div className="bg-[#f9f9f9] rounded-xl p-4">
                  <p className="text-sub text-[13px] font-semibold mb-2">자동 해제 시간</p>
                  <div className="flex gap-2">
                    {[4, 6].map(h => (
                      <button key={h} onClick={() => { setStatusHours(h); handleStatusChange("일하는 중"); }}
                        className={`px-5 py-2 rounded-lg text-[13px] font-semibold ${statusHours === h ? "bg-accent text-white" : "bg-white border border-border-custom text-sub"}`}>{h}시간</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── APPLICATIONS TAB (딜러) ─── */}
          {tab === "applications" && (
            <ListCard title="지원 내역" count={myApps.length} emptyText="지원 내역이 없습니다">
              {myApps.map(app => (
                <Link key={app.id} href={`/jobs/${app.job_id}`} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-custom last:border-b-0 hover:bg-[#fafafa] transition group">
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-[14px] font-semibold truncate group-hover:text-accent">{app.jobs?.nickname || "구인글"} - {app.jobs?.role}</p>
                    <p className="text-muted text-[12px]">{app.created_at?.slice(0, 10)}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${app.status === "수락" ? "bg-emerald-100 text-emerald-700" : app.status === "거절" ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-600"}`}>{app.status}</span>
                </Link>
              ))}
            </ListCard>
          )}

          {/* ─── JOBS TAB (업주: 구인 관리) ─── */}
          {tab === "jobs" && (
            <ListCard title={profile.user_type === "업주" ? "내 구인글" : "내 구직글"} count={myJobs.length} emptyText="작성한 글이 없습니다" action={{ label: "글 작성", href: "/jobs/write" }}>
              {myJobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-custom last:border-b-0">
                  <Link href={`/jobs/${job.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:text-accent transition group">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${job.type === "구인" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-700"}`}>{job.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-surface text-[14px] font-semibold truncate group-hover:text-accent">{job.role} · {job.areas?.slice(0, 2).join(", ")}</p>
                      <p className="text-muted text-[12px]">{job.created_at?.slice(0, 10)}</p>
                    </div>
                  </Link>
                  <button onClick={() => handleDeleteJob(job.id)} className="text-[12px] text-muted hover:text-red-500 shrink-0">삭제</button>
                </div>
              ))}
            </ListCard>
          )}

          {/* ─── APPLICANTS TAB (업주) ─── */}
          {tab === "applicants" && profile.user_type === "업주" && (
            <ListCard title="지원자 관리" count={applicants.length} emptyText="아직 지원자가 없습니다">
              {applicants.map(app => {
                const p = app.profiles;
                return (
                  <div key={app.id} className="px-5 py-3.5 border-b border-border-custom last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0">{p?.nickname?.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-surface text-[14px] font-bold">{p?.nickname}</p>
                          {p?.status && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${STATUS_OPTIONS.find(s => s.value === p.status)?.color || "bg-gray-400"}`}>{p.status}</span>}
                        </div>
                        <p className="text-muted text-[12px]">{p?.experience} · {p?.areas?.slice(0, 2).join(", ")}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {p?.contact_phone && <a href={`tel:${p.contact_phone}`} className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"><svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>}
                        {p?.contact_kakao && <span className="text-[11px] text-muted bg-[#f5f6f8] px-2 py-1 rounded">카톡: {p.contact_kakao}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </ListCard>
          )}

          {/* ─── POSTS TAB ─── */}
          {tab === "posts" && (
            <ListCard title="내 게시글" count={myPosts.length} emptyText="작성한 게시글이 없습니다" action={{ label: "글 작성", href: "/board/write" }}>
              {myPosts.map(post => (
                <div key={post.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-custom last:border-b-0">
                  <Link href={`/board/${post.id}`} className="flex-1 min-w-0 hover:text-accent transition group">
                    <p className="text-surface text-[14px] font-semibold truncate group-hover:text-accent">{post.title}</p>
                    <p className="text-muted text-[12px]">조회 {post.views} · {post.created_at?.slice(0, 10)}</p>
                  </Link>
                  <button onClick={() => handleDeletePost(post.id)} className="text-[12px] text-muted hover:text-red-500 shrink-0">삭제</button>
                </div>
              ))}
            </ListCard>
          )}

          {/* ─── BOOKMARKS TAB ─── */}
          {tab === "bookmarks" && (
            <ListCard title="저장한 콘텐츠" count={myBookmarks.length} emptyText="저장한 콘텐츠가 없습니다">
              {myBookmarks.map(bm => (
                <div key={bm.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-custom last:border-b-0">
                  <Link href={`/${bm.target_type === "job" ? "jobs" : bm.target_type === "event" ? "events" : "board"}/${bm.target_id}`} className="flex-1 min-w-0">
                    <p className="text-surface text-[14px] font-semibold truncate">{bm.target_type === "job" ? "구인구직" : bm.target_type === "event" ? "대회" : "게시글"}</p>
                    <p className="text-muted text-[12px]">{bm.created_at?.slice(0, 10)}</p>
                  </Link>
                  <button onClick={() => handleRemoveBookmark(bm.id)} className="text-[12px] text-muted hover:text-red-500 shrink-0">삭제</button>
                </div>
              ))}
            </ListCard>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f9f9f9] rounded-xl p-4">
      <p className="text-muted text-[12px] mb-1">{label}</p>
      <p className="text-surface text-[15px] whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-sub text-sm font-semibold mb-1.5 block">{label}</label>{children}</div>;
}

function ListCard({ title, count, emptyText, action, children }: {
  title: string; count: number; emptyText: string;
  action?: { label: string; href: string }; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
        <h2 className="text-surface font-bold">{title} ({count})</h2>
        {action && <Link href={action.href} className="text-accent text-[13px] font-semibold">{action.label} →</Link>}
      </div>
      {count === 0 ? <div className="text-center py-12 text-muted text-[14px]">{emptyText}</div> : children}
    </div>
  );
}
