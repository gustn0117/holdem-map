"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createJob } from "@/lib/api";
import { allAreas } from "@/data/areas";
import Select from "@/components/Select";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";

export default function JobWritePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center bg-white rounded-2xl card-shadow p-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-surface text-xl font-black mb-2">회원 전용 기능입니다</h2>
            <p className="text-muted text-[14px] mb-6">글을 작성하려면 회원가입 또는 로그인이 필요합니다</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/register" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-[15px]">회원가입</Link>
              <Link href="/login" className="w-full border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-bg transition-all text-[14px]">이미 계정이 있어요</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  const [form, setForm] = useState({
    type: "구직",
    nickname: "",
    role: "딜러",
    experience: "",
    areas: [] as string[],
    contact_kakao: "",
    contact_telegram: "",
    contact_phone: "",
    contact_type: "카카오톡",
    contact: "",
    photo: "",
    message: "",
    store_name: "",
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleArea = (area: string) => {
    setForm(prev => {
      if (prev.areas.includes(area)) return { ...prev, areas: prev.areas.filter(a => a !== area) };
      if (prev.areas.length >= 3) return prev;
      return { ...prev, areas: [...prev.areas, area] };
    });
  };

  const filteredAreas = areaSearch
    ? allAreas.filter(a => a.includes(areaSearch))
    : allAreas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.nickname?.trim()) missing.push("닉네임");
    if (!form.experience?.trim()) missing.push("경력");
    if (!form.areas || form.areas.length === 0) missing.push("희망 근무지역");
    if (missing.length > 0) {
      alert(`다음 항목을 입력해주세요: ${missing.join(", ")}`);
      return;
    }
    // Build contact string from multiple fields
    const contacts: string[] = [];
    if (form.contact_kakao?.trim()) contacts.push(`카카오톡: ${form.contact_kakao.trim()}`);
    if (form.contact_telegram?.trim()) contacts.push(`텔레그램: ${form.contact_telegram.trim()}`);
    if (form.contact_phone?.trim()) contacts.push(`전화: ${form.contact_phone.trim()}`);
    if (contacts.length === 0) {
      alert("연락처를 하나 이상 입력해주세요. (카카오톡, 텔레그램, 전화번호 중 택1)");
      return;
    }
    setSaving(true);
    try {
      await createJob({
        type: form.type,
        nickname: form.nickname,
        role: form.role,
        experience: form.experience,
        areas: form.areas,
        contact_type: "복수",
        contact: contacts.join(" / "),
        photo: form.photo,
        message: form.message,
        store_name: form.store_name,
        user_id: user.id,
      });
      router.push("/jobs");
    } catch {
      alert("등록에 실패했습니다.");
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-bg">
      <Header />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 w-full">
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/jobs" className="text-muted hover:text-accent transition-colors">구인구직</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">글 작성</span>
        </div>

        <h1 className="text-2xl font-black text-surface mb-2">구인구직 글 작성</h1>
        <p className="text-muted text-sm mb-8">{form.type === "구직" ? "매장에서 직접 연락드립니다." : "구직자가 직접 연락합니다."} 정확한 정보를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border-custom p-6 md:p-8 space-y-6">
          {/* Type selector */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">글 유형 *</label>
            <div className="flex bg-bg rounded-lg p-1">
              {[{ value: "구직", label: "구직 (일자리를 찾고 있어요)" }, { value: "구인", label: "구인 (직원을 찾고 있어요)" }].map(t => (
                <button key={t.value} type="button" onClick={() => set("type", t.value)}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${form.type === t.value ? "bg-accent text-white" : "text-muted"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 구인: Store name */}
          {form.type === "구인" && (
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">매장명 *</label>
              <input className={inputClass} value={form.store_name} onChange={e => set("store_name", e.target.value)} placeholder="매장명을 입력하세요" />
            </div>
          )}

          {/* Role + Nickname */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">{form.type === "구인" ? "모집 직종 *" : "직종 *"}</label>
              <Select value={form.role} onChange={v => set("role", v)} options={[
                { value: "딜러", label: "딜러" }, { value: "서빙", label: "서빙" }, { value: "매니저", label: "매니저" }, { value: "플로어", label: "플로어" },
              ]} />
            </div>
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">{form.type === "구인" ? "담당자 닉네임 *" : "닉네임 *"}</label>
              <input className={inputClass} value={form.nickname} onChange={e => set("nickname", e.target.value)} placeholder={form.type === "구인" ? "담당자 닉네임" : "닉네임을 입력하세요"} />
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">{form.type === "구인" ? "요구 경력 *" : "경력 *"}</label>
            <input className={inputClass} value={form.experience} onChange={e => set("experience", e.target.value)} placeholder={form.type === "구인" ? "예: 경력 1년 이상, 신입 가능" : "예: 딜러 2년, 신입"} />
          </div>

          {/* Areas */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">
              희망 근무지역 * <span className="text-muted font-normal">(최대 3개)</span>
            </label>

            {/* Selected */}
            {form.areas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.areas.map(area => (
                  <button key={area} type="button" onClick={() => toggleArea(area)}
                    className="bg-accent text-white text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hover:bg-accent-hover">
                    {area}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <input
              type="text" value={areaSearch} onChange={e => setAreaSearch(e.target.value)}
              placeholder="지역 검색 (예: 강남, 수원)"
              className={inputClass + " mb-3"}
            />

            {/* Area grid */}
            <div className="max-h-48 overflow-y-auto border border-border-custom rounded-xl p-3 grid grid-cols-3 md:grid-cols-4 gap-1.5">
              {filteredAreas.map(area => (
                <button key={area} type="button" onClick={() => toggleArea(area)}
                  disabled={form.areas.length >= 3 && !form.areas.includes(area)}
                  className={`text-xs py-2 px-2 rounded-lg text-center transition-all ${
                    form.areas.includes(area)
                      ? "bg-accent text-white font-semibold"
                      : form.areas.length >= 3
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "bg-gray-50 text-muted hover:bg-accent/10 hover:text-accent"
                  }`}>
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Contact - multiple methods */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-3">연락처 <span className="text-muted font-normal">(하나 이상 입력)</span></label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-20 text-[13px] font-semibold text-surface shrink-0">카카오톡</span>
                <input className={inputClass} value={form.contact_kakao} onChange={e => set("contact_kakao", e.target.value)} placeholder="카카오톡 ID" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-[13px] font-semibold text-surface shrink-0">텔레그램</span>
                <input className={inputClass} value={form.contact_telegram} onChange={e => set("contact_telegram", e.target.value)} placeholder="텔레그램 ID" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-20 text-[13px] font-semibold text-surface shrink-0">전화번호</span>
                <input className={inputClass} value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} placeholder="01012345678" />
              </div>
            </div>
          </div>

          {/* Photo */}
          <ImageUpload value={form.photo} onChange={v => set("photo", v)} folder="jobs" label="프로필 사진" aspect="aspect-square max-w-[160px]" hint="선택" />

          {/* Message */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">{form.type === "구인" ? "상세 내용" : "자기소개"} <span className="text-muted font-normal">(선택)</span></label>
            <textarea className={inputClass + " resize-none"} rows={4} value={form.message} onChange={e => set("message", e.target.value)} placeholder={form.type === "구인" ? "근무 조건, 급여, 근무 시간 등" : "간단한 자기소개를 작성해주세요"} />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link href="/jobs" className="flex-1 text-center bg-gray-100 text-muted hover:text-surface py-3.5 rounded-xl text-base font-medium transition-colors">
              취소
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-50">
              {saving ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
