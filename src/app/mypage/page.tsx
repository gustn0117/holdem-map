"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const USER_TYPES = ["일반", "딜러", "업주"] as const;
const STATUS_OPTIONS = [
  { value: "지금 가능", label: "지금 가능", color: "bg-green-500" },
  { value: "일하는 중", label: "일하는 중", color: "bg-yellow-500" },
  { value: "오늘 마감", label: "오늘 마감", color: "bg-red-500" },
  { value: "비노출", label: "비노출(숨기기)", color: "bg-gray-400" },
];

export default function MyPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "status" | "posts" | "jobs">("info");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [statusHours, setStatusHours] = useState(4);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setForm(profile);
      supabase.from("posts").select("*").eq("user_id", profile.id).order("created_at", { ascending: false })
        .then(({ data }) => setMyPosts(data || []));
      supabase.from("jobs").select("*").eq("user_id", profile.id).order("created_at", { ascending: false })
        .then(({ data }) => setMyJobs(data || []));
    }
  }, [profile]);

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!user || !profile) return null;

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").update({
      nickname: form.nickname,
      user_type: form.user_type,
      bio: form.bio,
      experience: form.experience,
      areas: form.areas,
      store_name: form.store_name,
      contact_kakao: form.contact_kakao,
      contact_telegram: form.contact_telegram,
      contact_phone: form.contact_phone,
    }).eq("id", profile.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const handleStatusChange = async (status: string) => {
    let expiresAt: string | null = null;
    if (status === "일하는 중") {
      expiresAt = new Date(Date.now() + statusHours * 60 * 60 * 1000).toISOString();
    } else if (status === "오늘 마감") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);
      expiresAt = tomorrow.toISOString();
    }
    await supabase.from("profiles").update({
      status,
      status_expires_at: expiresAt,
      status_updated_at: new Date().toISOString(),
    }).eq("id", profile.id);
    await refreshProfile();
  };

  const timeAgo = (date: string | null) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors";

  const tabs = [
    { key: "info" as const, label: "내 정보" },
    { key: "status" as const, label: "상태 설정", show: profile.user_type === "딜러" },
    { key: "posts" as const, label: "내 게시글" },
    { key: "jobs" as const, label: profile.user_type === "업주" ? "내 구인글" : "내 구직글" },
  ].filter(t => t.show !== false);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="container-main py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Header card */}
          <div className="bg-white rounded-2xl card-shadow p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-black shrink-0">
                {profile.nickname?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-black text-surface">{profile.nickname}</h1>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    profile.user_type === "딜러" ? "bg-emerald-100 text-emerald-700" :
                    profile.user_type === "업주" ? "bg-blue-100 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>{profile.user_type}</span>
                  {profile.user_type === "딜러" && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                      STATUS_OPTIONS.find(s => s.value === profile.status)?.color || "bg-gray-400"
                    }`}>{profile.status}</span>
                  )}
                </div>
                <p className="text-muted text-[13px]">{profile.email?.includes("@phone.holdemmap") ? `전화: ${profile.phone}` : profile.email}</p>
                {profile.user_type === "딜러" && profile.status_updated_at && (
                  <p className="text-muted text-[11px] mt-0.5">상태 변경: {timeAgo(profile.status_updated_at)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#f5f6f8] rounded-xl p-1 mb-6">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${tab === t.key ? "bg-white text-surface shadow-sm" : "text-muted"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Info tab */}
          {tab === "info" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              {!editing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-surface">프로필 정보</h2>
                    <button onClick={() => setEditing(true)} className="text-accent text-[13px] font-semibold">수정</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-[#f9f9f9] rounded-xl p-4">
                      <p className="text-muted text-[12px] mb-1">회원 유형</p>
                      <p className="text-surface text-[15px] font-semibold">{profile.user_type}</p>
                    </div>
                    {profile.bio && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-muted text-[12px] mb-1">자기소개</p><p className="text-surface text-[15px]">{profile.bio}</p></div>}
                    {profile.experience && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-muted text-[12px] mb-1">경력</p><p className="text-surface text-[15px]">{profile.experience}</p></div>}
                    {profile.areas?.length > 0 && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-muted text-[12px] mb-1">활동지역</p><div className="flex flex-wrap gap-1.5 mt-1">{profile.areas.map(a => <span key={a} className="text-[12px] bg-white border border-border-custom px-2.5 py-0.5 rounded-lg">{a}</span>)}</div></div>}
                    {profile.store_name && <div className="bg-[#f9f9f9] rounded-xl p-4"><p className="text-muted text-[12px] mb-1">업체명</p><p className="text-surface text-[15px]">{profile.store_name}</p></div>}
                    <div className="bg-[#f9f9f9] rounded-xl p-4">
                      <p className="text-muted text-[12px] mb-1">연락처</p>
                      <div className="space-y-1">
                        {profile.contact_kakao && <p className="text-surface text-[14px]">카카오톡: {profile.contact_kakao}</p>}
                        {profile.contact_telegram && <p className="text-surface text-[14px]">텔레그램: {profile.contact_telegram}</p>}
                        {profile.contact_phone && <p className="text-surface text-[14px]">전화: {profile.contact_phone}</p>}
                        {!profile.contact_kakao && !profile.contact_telegram && !profile.contact_phone && <p className="text-muted text-[14px]">미등록</p>}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border-custom">
                    <button onClick={() => { signOut(); router.push("/"); }} className="text-red-400 text-[13px] font-semibold">로그아웃</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-surface mb-2">프로필 수정</h2>
                  <div>
                    <label className="text-sub text-sm font-semibold mb-1.5 block">닉네임</label>
                    <input className={inputClass} value={form.nickname || ""} onChange={e => set("nickname", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sub text-sm font-semibold mb-1.5 block">회원 유형</label>
                    <div className="flex gap-2">
                      {USER_TYPES.map(t => (
                        <button key={t} onClick={() => set("user_type", t)}
                          className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all border ${form.user_type === t ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sub text-sm font-semibold mb-1.5 block">자기소개</label>
                    <textarea className={inputClass + " resize-none"} rows={3} value={form.bio || ""} onChange={e => set("bio", e.target.value)} placeholder="간단한 자기소개" />
                  </div>
                  {(form.user_type === "딜러" || form.user_type === "업주") && (
                    <>
                      <div>
                        <label className="text-sub text-sm font-semibold mb-1.5 block">{form.user_type === "딜러" ? "경력" : "업체 정보"}</label>
                        <input className={inputClass} value={form.experience || ""} onChange={e => set("experience", e.target.value)} placeholder={form.user_type === "딜러" ? "경력 3년" : "근무 시간, 급여 등"} />
                      </div>
                      {form.user_type === "업주" && (
                        <div>
                          <label className="text-sub text-sm font-semibold mb-1.5 block">업체명</label>
                          <input className={inputClass} value={form.store_name || ""} onChange={e => set("store_name", e.target.value)} />
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <label className="text-sub text-sm font-semibold mb-1.5 block">연락처</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3"><span className="w-16 text-[13px] font-semibold shrink-0">카카오톡</span><input className={inputClass} value={form.contact_kakao || ""} onChange={e => set("contact_kakao", e.target.value)} /></div>
                      <div className="flex items-center gap-3"><span className="w-16 text-[13px] font-semibold shrink-0">텔레그램</span><input className={inputClass} value={form.contact_telegram || ""} onChange={e => set("contact_telegram", e.target.value)} /></div>
                      <div className="flex items-center gap-3"><span className="w-16 text-[13px] font-semibold shrink-0">전화번호</span><input className={inputClass} value={form.contact_phone || ""} onChange={e => set("contact_phone", e.target.value)} /></div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setEditing(false)} className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl">취소</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">
                      {saving ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status tab (딜러 only) */}
          {tab === "status" && profile.user_type === "딜러" && (
            <div className="bg-white rounded-2xl card-shadow p-6">
              <h2 className="text-lg font-bold text-surface mb-4">현재 상태 설정</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => handleStatusChange(s.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      profile.status === s.value ? "border-accent bg-accent/5" : "border-border-custom hover:border-accent/30"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 rounded-full ${s.color}`} />
                      <span className="text-surface text-[14px] font-bold">{s.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              {profile.status === "일하는 중" && (
                <div className="bg-[#f9f9f9] rounded-xl p-4">
                  <p className="text-sub text-[13px] font-semibold mb-2">자동 해제 시간 설정</p>
                  <div className="flex gap-2">
                    {[4, 6, 8].map(h => (
                      <button key={h} onClick={() => { setStatusHours(h); handleStatusChange("일하는 중"); }}
                        className={`px-4 py-2 rounded-lg text-[13px] font-semibold ${statusHours === h ? "bg-accent text-white" : "bg-white border border-border-custom text-sub"}`}>
                        {h}시간
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Posts tab */}
          {tab === "posts" && (
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
                <h2 className="text-surface font-bold">내 게시글 ({myPosts.length})</h2>
                <Link href="/board/write" className="text-accent text-[13px] font-semibold">글 작성 →</Link>
              </div>
              {myPosts.length === 0 ? (
                <div className="text-center py-12 text-muted text-[14px]">작성한 게시글이 없습니다</div>
              ) : myPosts.map(post => (
                <Link key={post.id} href={`/board/${post.id}`} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-custom last:border-b-0 hover:bg-[#fafafa] transition group">
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-[14px] font-semibold truncate group-hover:text-accent">{post.title}</p>
                    <p className="text-muted text-[12px]">조회 {post.views} · {post.created_at?.slice(0, 10)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Jobs tab */}
          {tab === "jobs" && (
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="px-5 py-4 border-b border-border-custom flex justify-between items-center">
                <h2 className="text-surface font-bold">{profile.user_type === "업주" ? "내 구인글" : "내 구직글"} ({myJobs.length})</h2>
                <Link href="/jobs/write" className="text-accent text-[13px] font-semibold">글 작성 →</Link>
              </div>
              {myJobs.length === 0 ? (
                <div className="text-center py-12 text-muted text-[14px]">작성한 글이 없습니다</div>
              ) : myJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-custom last:border-b-0 hover:bg-[#fafafa] transition group">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    job.type === "구인" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-700"
                  }`}>{job.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface text-[14px] font-semibold truncate group-hover:text-accent">{job.nickname} - {job.role}</p>
                    <p className="text-muted text-[12px]">{job.areas?.slice(0, 2).join(", ")} · {job.created_at?.slice(0, 10)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
