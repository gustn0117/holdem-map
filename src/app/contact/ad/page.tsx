"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const AD_TYPES = ["메인 배너", "사이드 배너", "포인트샵 제휴 상품", "기획 제휴", "기타"];

export default function AdInquiryPage() {
  const [form, setForm] = useState({
    company: "", name: "", phone: "", email: "",
    adType: AD_TYPES[0], budget: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      alert("담당자명, 연락처, 문의 내용은 필수입니다.");
      return;
    }
    setSaving(true);
    const composed = [
      `[광고 문의] ${form.adType}`,
      form.company ? `회사/브랜드: ${form.company}` : null,
      form.email ? `이메일: ${form.email}` : null,
      form.budget ? `예산: ${form.budget}` : null,
      "",
      form.message,
    ].filter(Boolean).join("\n");
    const { error } = await supabase.from("inquiries").insert({
      name: form.name, phone: form.phone, message: composed,
      store_name: form.company || "(광고주)",
      store_address: "", region: "광고 문의", store_images: [],
    });
    setSaving(false);
    if (error) { alert("문의 등록 실패: " + (error.message || "다시 시도해주세요.")); return; }
    setSubmitted(true);
  };

  const inputClass = "w-full bg-card border border-border-custom rounded-xl px-5 py-4 text-base text-surface focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-accent rounded-xl flex items-center justify-center mx-auto mb-8 shadow-md shadow-accent/25">
              <svg className="w-10 h-10 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-surface mb-4">광고 문의가 접수되었습니다</h1>
            <p className="text-sub text-lg mb-10 leading-relaxed">입력하신 연락처로 빠른 시일 내에<br />담당자가 연락드리겠습니다.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/" className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-xl">홈으로</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 w-full mx-auto px-4 md:px-6 py-10 max-w-2xl">
        <div className="mb-8">
          <p className="text-muted text-[11px] font-black tracking-widest uppercase mb-2">Advertisement Inquiry</p>
          <h1 className="text-2xl md:text-3xl font-black text-surface mb-2">광고 문의</h1>
          <p className="text-sub text-[14px] leading-relaxed">
            메인/사이드 배너, 포인트샵 제휴 상품, 기획 제휴 등 홀덤맵코리아를 통한 광고를 문의하실 수 있습니다.<br/>
            문의 접수 후 담당자가 1~2 영업일 내에 연락드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-surface text-sm font-semibold mb-1.5 block">회사 / 브랜드명</label>
            <input className={inputClass} value={form.company} onChange={e => set("company", e.target.value)} placeholder="예: 스타벅스 코리아" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">담당자명 <span className="text-red-500">*</span></label>
              <input className={inputClass} required value={form.name} onChange={e => set("name", e.target.value)} placeholder="홍길동" />
            </div>
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">연락처 <span className="text-red-500">*</span></label>
              <input className={inputClass} type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" />
            </div>
          </div>
          <div>
            <label className="text-surface text-sm font-semibold mb-1.5 block">이메일</label>
            <input className={inputClass} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="ad@example.com" />
          </div>
          <div>
            <label className="text-surface text-sm font-semibold mb-1.5 block">희망 광고 종류</label>
            <select className={inputClass} value={form.adType} onChange={e => set("adType", e.target.value)}>
              {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-surface text-sm font-semibold mb-1.5 block">예상 예산 <span className="text-muted font-normal">(선택)</span></label>
            <input className={inputClass} value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="예: 월 100만원" />
          </div>
          <div>
            <label className="text-surface text-sm font-semibold mb-1.5 block">문의 내용 <span className="text-red-500">*</span></label>
            <textarea className={inputClass + " resize-none"} rows={5} required value={form.message} onChange={e => set("message", e.target.value)}
              placeholder="광고 목적, 노출 희망 위치, 기간, 그 외 요청사항을 자유롭게 작성해주세요." />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl text-[15px] transition-all disabled:opacity-50">
            {saving ? "접수 중..." : "광고 문의 접수"}
          </button>
        </form>

        <p className="text-center text-muted text-[12px] mt-6">
          매장 등록 문의는 <Link href="/contact" className="text-accent underline">이쪽</Link>을 이용해주세요.
        </p>
      </main>
      <Footer />
    </div>
  );
}
