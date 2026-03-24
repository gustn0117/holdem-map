"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", storeName: "", region: "서울", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass = "w-full bg-card border border-border-custom rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 gold-shine rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/25">
              <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">문의가 접수되었습니다</h1>
            <p className="text-sub text-sm mb-8 leading-relaxed">입력하신 연락처로 빠른 시일 내에 연락드리겠습니다.<br />감사합니다.</p>
            <Link href="/" className="gold-btn text-dark font-bold px-8 py-3 rounded-full inline-block shadow-lg shadow-accent/20">홈으로 돌아가기</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 gold-shine rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent/25">
            <svg className="w-7 h-7 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">매장 등록 문의</h1>
          <p className="text-sub text-sm">홀덤맵에 매장을 등록하고 전국 유저에게 홍보하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border-custom p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sub text-xs font-medium block mb-2">담당자명 *</label>
              <input className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} placeholder="홍길동" required />
            </div>
            <div>
              <label className="text-sub text-xs font-medium block mb-2">연락처 *</label>
              <input className={inputClass} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sub text-xs font-medium block mb-2">매장명 *</label>
              <input className={inputClass} value={form.storeName} onChange={e => set("storeName", e.target.value)} placeholder="매장명을 입력하세요" required />
            </div>
            <div>
              <label className="text-sub text-xs font-medium block mb-2">지역</label>
              <select className={inputClass} value={form.region} onChange={e => set("region", e.target.value)}>
                <option value="서울">서울</option>
                <option value="경기">경기</option>
                <option value="인천">인천</option>
                <option value="기타">기타 지역</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sub text-xs font-medium block mb-2">문의 내용</label>
            <textarea className={inputClass + " resize-none"} rows={5} value={form.message} onChange={e => set("message", e.target.value)} placeholder="매장 소개, 문의 사항 등을 자유롭게 작성해주세요" />
          </div>

          <button type="submit" className="w-full gold-btn text-dark font-bold py-3.5 rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all text-sm">
            문의 접수하기
          </button>

          <p className="text-muted text-[11px] text-center">접수 후 1~2 영업일 내 연락드립니다</p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
