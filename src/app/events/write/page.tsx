"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { classifyContent, formatFilterMessage } from "@/lib/contentFilter";

const DEFAULT_NOTICE = `※ 본 페이지는 이벤트 정보 안내용이며, 실제 진행 및 참여는 각 업장에서 개별적으로 이루어집니다.
※ 본 사이트는 운영·모집·정산 등에 관여하지 않으며, 이용은 업장 기준에 따릅니다.
※ 관련 법령에 위반될 수 있는 행위는 지원하지 않습니다.`;

export default function EventWritePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    end_date: "",
    time: "",
    prize: "",
    buy_in: "",
    image: "",
    description: "",
    details: DEFAULT_NOTICE,
    is_international: false,
  });

  const set = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center bg-white rounded-2xl card-shadow p-8">
            <h2 className="text-surface text-xl font-black mb-2">회원 전용 기능입니다</h2>
            <p className="text-muted text-[14px] mb-6">대회를 등록하려면 로그인이 필요합니다</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/register" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-[15px]">회원가입</Link>
              <Link href="/login" className="w-full border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-bg transition-all text-[14px]">로그인</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.title.trim()) missing.push("제목");
    if (!form.location.trim()) missing.push("장소");
    if (!form.date) missing.push("시작일");
    if (!form.time) missing.push("시간");
    if (missing.length > 0) {
      alert(`다음 항목을 입력해주세요: ${missing.join(", ")}`);
      return;
    }
    const filter = classifyContent(`${form.title}\n${form.location}\n${form.description}\n${form.details}`);
    if (filter.action === "block") {
      alert(formatFilterMessage(filter));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("events").insert({
      title: form.title,
      location: form.location,
      store_name: form.location,
      store_id: null,
      date: form.date,
      end_date: form.end_date || null,
      time: form.time,
      prize: form.prize || null,
      buy_in: form.buy_in || null,
      image: form.image || null,
      description: form.description || null,
      details: form.details || null,
      is_international: form.is_international,
      status: "pending",
      submitted_by: user.id,
      submitter_nickname: profile?.nickname || "",
    });
    setSaving(false);
    if (error) { alert("등록에 실패했습니다. 다시 시도해주세요."); return; }
    setSubmitted(true);
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-accent/25">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-black text-surface mb-3">대회 등록 요청 완료</h1>
            <p className="text-sub text-[15px] mb-8 leading-relaxed">
              관리자 검토 후 승인되면<br />대회 목록에 노출됩니다. 감사합니다.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/events" className="bg-accent text-white font-bold px-6 py-3 rounded-xl transition-all">대회 목록 보기</Link>
              <Link href="/" className="border border-border-custom text-sub font-semibold px-6 py-3 rounded-xl hover:bg-bg transition-all">홈으로</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-bg">
      <Header />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 w-full">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/events" className="text-muted hover:text-accent transition-colors">대회</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub">등록 요청</span>
        </div>

        <h1 className="text-2xl font-black text-surface mb-2">대회 / 이벤트 등록</h1>
        <p className="text-muted text-sm mb-2">정보를 입력하면 관리자 검토 후 승인됩니다.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8">
          <p className="text-amber-800 text-[13px] font-semibold">⚠️ 검토 기간은 영업일 기준 1~2일 소요됩니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border-custom p-6 md:p-8 space-y-5">
          <div>
            <label className="text-sub text-sm font-semibold block mb-2">대회 제목 *</label>
            <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} placeholder="예: 2026 봄 홀덤 챔피언십" />
          </div>

          <div>
            <label className="text-sub text-sm font-semibold block mb-2">국내/해외 *</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => set("is_international", false)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${!form.is_international ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                🇰🇷 국내
              </button>
              <button type="button" onClick={() => set("is_international", true)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-all ${form.is_international ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                🌏 해외
              </button>
            </div>
          </div>

          <div>
            <label className="text-sub text-sm font-semibold block mb-2">장소 *</label>
            <input className={inputClass} value={form.location} onChange={e => set("location", e.target.value)} placeholder="예: OO호텔 그랜드볼룸, 서울 강남구 ○○로 123" />
            <p className="text-muted text-xs mt-1.5">매장명·호텔명·주소 등 대회가 열리는 장소</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">시작일 *</label>
              <input className={inputClass} type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">종료일 <span className="text-muted font-normal">(선택)</span></label>
              <input className={inputClass} type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </div>
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">시작 시간 *</label>
              <input className={inputClass} type="time" value={form.time} onChange={e => set("time", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">상금 <span className="text-muted font-normal">(선택)</span></label>
              <input className={inputClass} value={form.prize} onChange={e => set("prize", e.target.value)} placeholder="예: GTD 300만원" />
            </div>
            <div>
              <label className="text-sub text-sm font-semibold block mb-2">바이인 <span className="text-muted font-normal">(선택)</span></label>
              <input className={inputClass} value={form.buy_in} onChange={e => set("buy_in", e.target.value)} placeholder="예: 50,000원" />
            </div>
          </div>

          <ImageUpload value={form.image} onChange={v => set("image", v)} folder="events" label="대회 포스터/이미지" hint="선택, 가로형 권장" />

          <div>
            <label className="text-sub text-sm font-semibold block mb-2">간단 설명 <span className="text-muted font-normal">(선택)</span></label>
            <textarea className={inputClass + " resize-none"} rows={3} value={form.description} onChange={e => set("description", e.target.value)} placeholder="대회 간략 소개" />
          </div>

          <div>
            <label className="text-sub text-sm font-semibold block mb-2">상세 정보 / 유의사항</label>
            <p className="text-muted text-xs mb-2">아래 안내 문구는 자동 삽입되어 있습니다. 내용을 추가하거나 위쪽에 룰/시간표/문의처 등을 적어주세요.</p>
            <textarea className={inputClass + " resize-none"} rows={8} value={form.details} onChange={e => set("details", e.target.value)} placeholder="룰, 시간표, 참가 방법, 문의처 등" />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/events" className="flex-1 text-center bg-gray-100 text-muted hover:text-surface py-3.5 rounded-xl text-base font-medium transition-colors">
              취소
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-50">
              {saving ? "등록 요청 중..." : "등록 요청하기"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
