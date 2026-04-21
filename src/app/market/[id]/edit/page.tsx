"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ImageUpload from "@/components/ImageUpload";
import { classifyContent, formatFilterMessage } from "@/lib/contentFilter";

const TYPES = ["매매", "대관", "단기운영"];
const REGIONS = ["서울", "경기", "인천", "충청", "전라", "경상", "강원", "제주"];
const STATUS_OPTIONS = ["모집중", "거래완료"];

interface FormState {
  type: string;
  title: string;
  region: string;
  address: string;
  price: string;
  description: string;
  images: string[];
  contact: string;
  status: string;
}

export default function MarketEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const listingId = id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null | undefined>(undefined);
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("market_listings").select("*").eq("id", listingId).single();
      if (!data) { setLoading(false); return; }
      setOwnerId(data.user_id);
      setForm({
        type: data.type || "매매",
        title: data.title || "",
        region: data.region || "서울",
        address: data.address || "",
        price: data.price || "",
        description: data.description || "",
        images: data.images || [],
        contact: data.contact || "",
        status: data.status || "모집중",
      });
      setLoading(false);
    })();
  }, [listingId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => prev ? { ...prev, [key]: value } : prev);

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!form) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
      <div className="flex-1 flex items-center justify-center text-center"><div>
        <h1 className="text-2xl font-bold text-surface mb-3">매물을 찾을 수 없습니다</h1>
        <Link href="/market" className="text-accent font-semibold">목록으로</Link>
      </div></div>
      <Footer />
    </div>
  );

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center bg-white rounded-2xl card-shadow p-8">
            <h2 className="text-surface text-xl font-black mb-2">로그인이 필요합니다</h2>
            <p className="text-muted text-[14px] mb-6">본인의 매물만 수정할 수 있습니다</p>
            <Link href="/login" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-[15px] block">로그인</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (ownerId !== user.id) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0"><Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center bg-white rounded-2xl card-shadow p-8">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" /></svg>
            </div>
            <h2 className="text-surface text-xl font-black mb-2">수정 권한이 없습니다</h2>
            <p className="text-muted text-[14px] mb-6">본인이 등록한 매물만 수정할 수 있습니다.</p>
            <Link href={`/market/${listingId}`} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-[15px] block">상세로 돌아가기</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.region) { alert("필수 항목을 모두 입력해주세요."); return; }
    const filter = classifyContent(`${form.title}\n${form.description}\n${form.address}`);
    if (filter.action === "block") { alert(formatFilterMessage(filter)); return; }
    setSaving(true);
    const { error } = await supabase.from("market_listings").update({
      type: form.type,
      title: form.title,
      region: form.region,
      address: form.address,
      price: form.price || "협의",
      description: form.description,
      images: form.images,
      contact: form.contact,
      status: form.status,
      updated_at: new Date().toISOString(),
    }).eq("id", listingId).eq("user_id", user.id);
    if (error) { alert("수정에 실패했습니다."); setSaving(false); return; }
    router.push(`/market/${listingId}`);
  };

  const handleDelete = async () => {
    if (!confirm("이 매물을 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    setSaving(true);
    const { error } = await supabase.from("market_listings").delete().eq("id", listingId).eq("user_id", user.id);
    if (error) { alert("삭제에 실패했습니다."); setSaving(false); return; }
    router.push("/market");
  };

  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-2xl mx-auto">
          <Link href={`/market/${listingId}`} className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            상세로 돌아가기
          </Link>

          <h1 className="text-2xl font-black text-surface mb-6">매물 수정</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">매물명 *</label>
              <input className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-semibold mb-2 block">지역 *</label>
                <select className={inputClass} value={form.region} onChange={e => set("region", e.target.value)}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sub text-sm font-semibold mb-2 block">상세 주소</label>
                <input className={inputClass} value={form.address} onChange={e => set("address", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-semibold mb-2 block">가격</label>
                <input className={inputClass} value={form.price} onChange={e => set("price", e.target.value)} placeholder="예: 권리금 3000만 / 1일 30만" />
              </div>
              <div>
                <label className="text-sub text-sm font-semibold mb-2 block">상태</label>
                <select className={inputClass} value={form.status} onChange={e => set("status", e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">상세 내용</label>
              <textarea className={inputClass + " resize-none"} rows={6} value={form.description} onChange={e => set("description", e.target.value)} />
            </div>

            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">매장 사진 <span className="text-muted font-normal">(최대 8장)</span></label>
              <div className="space-y-2">
                {form.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border-custom bg-bg">
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
                  <ImageUpload value="" onChange={v => v && set("images", [...form.images, v])} folder="market"
                    label={form.images.length === 0 ? "사진 업로드" : "사진 추가"} aspect="aspect-video" hint={`${form.images.length}/8`} />
                )}
              </div>
            </div>

            <div>
              <label className="text-sub text-sm font-semibold mb-2 block">연락처</label>
              <input className={inputClass} value={form.contact} onChange={e => set("contact", e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleDelete} disabled={saving}
                className="flex-1 bg-red-50 text-red-500 font-semibold py-3 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50">
                삭제
              </button>
              <button type="button" onClick={() => router.back()} disabled={saving}
                className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all disabled:opacity-50">
                취소
              </button>
              <button type="submit" disabled={saving}
                className="flex-[2] bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {saving ? "저장 중..." : "수정 완료"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
