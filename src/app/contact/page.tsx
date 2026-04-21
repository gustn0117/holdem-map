"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Select from "@/components/Select";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", storeName: "", storeAddress: "", region: "서울", message: "" });
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("inquiries").insert({
      name: form.name, phone: form.phone, store_name: form.storeName, store_address: form.storeAddress, region: form.region, message: form.message, store_images: images,
    });
    setSaving(false);
    if (error) { alert("문의 등록에 실패했습니다. 다시 시도해주세요."); return; }
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
            <h1 className="text-3xl font-extrabold text-surface mb-4">문의가 접수되었습니다</h1>
            <p className="text-sub text-lg mb-10 leading-relaxed">입력하신 연락처로 빠른 시일 내에<br />연락드리겠습니다. 감사합니다.</p>
            <Link href="/" className="bg-accent text-dark font-bold text-base px-10 py-4 rounded-full inline-block shadow-lg shadow-accent/25">홈으로 돌아가기</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-surface">매장 등록 문의</h1>
            <p className="text-muted text-[13px] mt-0.5">매장을 등록해 전국 유저에게 홍보하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border-custom p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sub text-[13px] font-semibold block mb-1.5">담당자명 *</label>
              <input className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} placeholder="홍길동" required />
            </div>
            <div>
              <label className="text-sub text-[13px] font-semibold block mb-1.5">연락처 *</label>
              <input className={inputClass} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="010-0000-0000" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sub text-[13px] font-semibold block mb-1.5">매장명 *</label>
              <input className={inputClass} value={form.storeName} onChange={e => set("storeName", e.target.value)} placeholder="매장명을 입력하세요" required />
            </div>
            <div>
              <label className="text-sub text-[13px] font-semibold block mb-1.5">지역</label>
              <Select value={form.region} onChange={v => set("region", v)} options={[
                { value: "서울", label: "서울" }, { value: "경기", label: "경기" }, { value: "인천", label: "인천" },
                { value: "충청", label: "충청" }, { value: "전라", label: "전라" }, { value: "경상", label: "경상" },
                { value: "강원", label: "강원" }, { value: "제주", label: "제주" }, { value: "기타", label: "기타 지역" },
              ]} />
            </div>
          </div>
          <div>
            <label className="text-sub text-[13px] font-semibold block mb-1.5">매장 주소 *</label>
            <input className={inputClass} value={form.storeAddress} onChange={e => set("storeAddress", e.target.value)} placeholder="예: 서울 강남구 테헤란로 123" required />
          </div>
          <div>
            <label className="text-sub text-[13px] font-semibold block mb-1.5">문의 내용</label>
            <textarea className={inputClass + " resize-none"} rows={3} value={form.message} onChange={e => set("message", e.target.value)} placeholder="매장 소개, 문의 사항 등을 자유롭게 작성해주세요" />
          </div>
          <div>
            <label className="text-sub text-[13px] font-semibold block mb-1.5">매장 사진 <span className="text-muted font-normal">(선택, 최대 5장)</span></label>
            <div className="space-y-2">
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border-custom bg-bg">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-all">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length < 5 && (
                <ImageUpload
                  value=""
                  onChange={v => { if (v) setImages(prev => [...prev, v]); }}
                  folder="inquiries"
                  label={images.length === 0 ? "사진 업로드" : "사진 추가"}
                  aspect="aspect-video"
                  hint={`${images.length}/5`}
                />
              )}
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-accent text-dark font-bold py-3 rounded-xl shadow-md shadow-accent/20 hover:shadow-accent/40 transition-all text-[15px] disabled:opacity-50">
            {saving ? "접수 중..." : "문의 접수하기"}
          </button>
          <p className="text-muted text-sm text-center">접수 후 1~2 영업일 내 연락드립니다</p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
