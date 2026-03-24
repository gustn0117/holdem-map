"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createJob } from "@/lib/api";
import { allAreas } from "@/data/areas";

export default function JobWritePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [form, setForm] = useState({
    nickname: "",
    role: "딜러",
    experience: "",
    areas: [] as string[],
    contact_type: "카카오톡",
    contact: "",
    photo: "",
    message: "",
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
    if (!form.nickname || !form.experience || form.areas.length === 0 || !form.contact) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      await createJob(form);
      router.push("/jobs");
    } catch {
      alert("등록에 실패했습니다.");
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-[#f5f5f5]">
      <Header />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 w-full">
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/jobs" className="text-muted hover:text-accent transition-colors">구인구직</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">구직글 작성</span>
        </div>

        <h1 className="text-2xl font-black text-surface mb-2">구직글 작성</h1>
        <p className="text-muted text-sm mb-8">매장에서 직접 연락드립니다. 정확한 정보를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-custom p-6 md:p-8 space-y-6">
          {/* Role + Nickname */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">직종 *</label>
              <select className={inputClass} value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="딜러">딜러</option>
                <option value="서빙">서빙</option>
              </select>
            </div>
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">닉네임 *</label>
              <input className={inputClass} value={form.nickname} onChange={e => set("nickname", e.target.value)} placeholder="닉네임을 입력하세요" />
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">경력 *</label>
            <input className={inputClass} value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="예: 딜러 2년, 신입" />
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

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">연락 방법 *</label>
              <select className={inputClass} value={form.contact_type} onChange={e => set("contact_type", e.target.value)}>
                <option value="카카오톡">카카오톡</option>
                <option value="텔레그램">텔레그램</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sub text-sm font-semibold block mb-2">연락처 (ID) *</label>
              <input className={inputClass} value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="카카오톡 또는 텔레그램 ID" />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">사진 URL <span className="text-muted font-normal">(선택)</span></label>
            <input className={inputClass} value={form.photo} onChange={e => set("photo", e.target.value)} placeholder="프로필 사진 URL (선택사항)" />
            {form.photo && (
              <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-border-custom">
                <img src={form.photo} alt="미리보기" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">자기소개 <span className="text-muted font-normal">(선택)</span></label>
            <textarea className={inputClass + " resize-none"} rows={4} value={form.message} onChange={e => set("message", e.target.value)} placeholder="간단한 자기소개를 작성해주세요" />
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
