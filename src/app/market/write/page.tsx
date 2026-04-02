"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";

const TYPES = ["매매", "대관", "단기운영"];
const REGIONS = ["서울", "경기", "인천"];

export default function MarketWritePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "매매",
    title: "",
    region: "서울",
    address: "",
    price: "",
    description: "",
    images: [] as string[],
    contact: "",
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

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
            <p className="text-muted text-[14px] mb-6">매물을 등록하려면 회원가입이 필요합니다</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/register" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-[15px]">회원가입</Link>
              <Link href="/login" className="w-full border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all text-[14px]">이미 계정이 있어요</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.region) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("market_listings").insert({
      user_id: user.id,
      type: form.type,
      title: form.title,
      region: form.region,
      address: form.address,
      price: form.price || "협의",
      description: form.description,
      images: form.images,
      contact: form.contact || profile?.contact_phone || profile?.contact_kakao || "",
    });
    if (error) {
      alert("등록에 실패했습니다.");
      setSaving(false);
    } else {
      router.push("/market");
    }
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-2xl mx-auto">
          <Link href="/market" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로
          </Link>

          <h1 className="text-2xl font-black text-surface mb-6">매물 등록</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">거래 유형 *</label>
              <div className="flex gap-2">
                {TYPES.map(t => (
                  <button key={t} type="button" onClick={() => set("type", t)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all border ${form.type === t ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">매물명 *</label>
              <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} placeholder="예: 강남 홀덤펍 매매" required />
            </div>

            {/* Region + Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-semibold mb-2 block">지역 *</label>
                <select className={inputClass} value={form.region} onChange={e => set("region", e.target.value)}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sub text-sm font-semibold mb-2 block">상세 주소</label>
                <input className={inputClass} value={form.address} onChange={e => set("address", e.target.value)} placeholder="예: 강남구 역삼동" />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">가격</label>
              <input className={inputClass} value={form.price} onChange={e => set("price", e.target.value)} placeholder="예: 권리금 3000만 / 1일 30만 / 협의" />
            </div>

            {/* Description */}
            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">상세 내용</label>
              <textarea className={inputClass + " resize-none"} rows={6} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="매장 규모, 시설 현황, 운영 가능 시간 등 상세 정보를 입력하세요" />
            </div>

            {/* Images */}
            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">사진</label>
              <ImageUpload value={form.images[0] || ""} onChange={v => set("images", v ? [v] : [])} folder="market" label="매장 사진" />
            </div>

            {/* Contact */}
            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">연락처</label>
              <input className={inputClass} value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="카카오톡 ID 또는 전화번호" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()} className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all">취소</button>
              <button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {saving ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
