"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import { classifyContent, formatFilterMessage } from "@/lib/contentFilter";

const CATEGORIES = ["카드", "칩", "테이블", "악세서리", "기타"];
const CONDITIONS = ["새상품", "거의새것", "중고", "하자있음"];

export default function TradeWritePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "카드", price: "", condition: "중고",
    description: "", images: [] as string[], region: "", contact: "",
  });

  if (!user) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center bg-white rounded-2xl card-shadow p-8">
          <h2 className="text-surface text-xl font-black mb-2">회원 전용 기능입니다</h2>
          <p className="text-muted text-[14px] mb-6">상품을 등록하려면 회원가입이 필요합니다</p>
          <Link href="/register" className="w-full bg-accent text-white font-bold py-3 rounded-xl inline-block">회원가입</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price.trim()) { alert("제목과 가격을 입력하세요."); return; }
    const filter = classifyContent(`${form.title}\n${form.description}`);
    if (filter.action === "block") { alert(formatFilterMessage(filter)); return; }
    setSaving(true);
    const { error } = await supabase.from("trade_items").insert({
      user_id: user.id, nickname: profile?.nickname || "익명",
      title: form.title, category: form.category, price: form.price, condition: form.condition,
      description: form.description, images: form.images, region: form.region, contact: form.contact,
      status: "판매중",
    });
    if (error) { alert("등록 실패"); setSaving(false); return; }
    router.push("/trade");
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-2xl mx-auto">
          <Link href="/trade" className="text-muted hover:text-accent text-sm mb-6 inline-block">← 목록으로</Link>
          <h1 className="text-2xl font-black text-surface mb-6">상품 등록</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sub text-sm font-semibold mb-1.5 block">제목 *</label>
              <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} placeholder="예: 포커 카드 2덱" required /></div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sub text-sm font-semibold mb-1.5 block">카테고리</label>
                <div className="flex gap-1 flex-wrap">{CATEGORIES.map(c => (
                  <button key={c} type="button" onClick={() => set("category", c)}
                    className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all ${form.category === c ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>{c}</button>
                ))}</div>
              </div>
              <div><label className="text-sub text-sm font-semibold mb-1.5 block">상태</label>
                <div className="flex gap-1 flex-wrap">{CONDITIONS.map(c => (
                  <button key={c} type="button" onClick={() => set("condition", c)}
                    className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all ${form.condition === c ? "bg-accent text-white border-accent" : "border-border-custom text-sub"}`}>{c}</button>
                ))}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sub text-sm font-semibold mb-1.5 block">가격 *</label>
                <input className={inputClass} value={form.price} onChange={e => set("price", e.target.value)} placeholder="30,000원 또는 협의" required /></div>
              <div><label className="text-sub text-sm font-semibold mb-1.5 block">거래 지역</label>
                <input className={inputClass} value={form.region} onChange={e => set("region", e.target.value)} placeholder="서울 강남" /></div>
            </div>

            <div><label className="text-sub text-sm font-semibold mb-1.5 block">상세 설명</label>
              <textarea className={inputClass + " resize-none"} rows={5} value={form.description} onChange={e => set("description", e.target.value)} placeholder="상품 상태, 구매 시기 등" /></div>

            <div>
              <label className="text-sub text-sm font-semibold mb-1.5 block">상품 사진 <span className="text-muted font-normal">(최대 8장)</span></label>
              <div className="space-y-2">
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border-custom bg-bg">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-90 hover:opacity-100 hover:bg-red-600 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        {i === 0 && <span className="absolute bottom-1.5 left-1.5 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded">대표</span>}
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length < 8 && (
                  <ImageUpload value="" onChange={v => v && set("images", [...form.images, v])} folder="trade"
                    label={form.images.length === 0 ? "사진 업로드" : "사진 추가"} aspect="aspect-square" hint={`${form.images.length}/8`} />
                )}
              </div>
            </div>

            <div><label className="text-sub text-sm font-semibold mb-1.5 block">연락처</label>
              <input className={inputClass} value={form.contact} onChange={e => set("contact", e.target.value)} placeholder="카톡 ID 또는 전화번호" /></div>

            <div className="flex gap-3">
              <button type="button" onClick={() => router.back()} className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl">취소</button>
              <button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">{saving ? "등록 중..." : "등록"}</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
