"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import RichEditor from "@/components/RichEditor";
import { sanitizeHtml } from "@/lib/sanitize";
import { listProducts, createProduct, updateProduct, deleteProduct, listOrders, updateOrderStatus, refundOrder } from "@/lib/pointshop";
import type { PointshopProduct, PointshopOrder, PointshopOrderStatus } from "@/types";

import { ADMIN_PASSWORD } from "@/lib/admin";
const CATEGORIES = ["굿즈", "기프티콘", "제휴", "이벤트", "기타"];
const STATUS_OPTIONS: { value: PointshopOrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "신청 대기", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "승인됨", color: "bg-blue-100 text-blue-700" },
  { value: "shipped", label: "발송 완료", color: "bg-purple-100 text-purple-700" },
  { value: "completed", label: "수령 완료", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "취소됨", color: "bg-gray-100 text-gray-600" },
];

const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

type ProductForm = Omit<PointshopProduct, "id" | "created_at" | "updated_at">;
const emptyProduct = (): ProductForm => ({
  name: "", description: "", image: "", images: [], price: 1000, stock: 10,
  category: "", active: true, sort_order: 0,
});

type Tab = "products" | "orders";

export default function AdminPointshopPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("hm_admin") === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]">
        <form onSubmit={e => { e.preventDefault(); if (pw === ADMIN_PASSWORD) { setAuthed(true); try { sessionStorage.setItem("hm_admin", ADMIN_PASSWORD); } catch {} } else { alert("비밀번호 오류"); } }} className="bg-white rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">관리자 비밀번호</h1>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} className={inputClass} autoFocus />
          <button type="submit" className="w-full bg-accent text-white py-3 rounded-xl font-bold mt-4">로그인</button>
          <Link href="/admin" className="block text-center text-muted text-sm mt-4">← 관리자 대시보드</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white border-b border-border-custom sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted hover:text-accent text-sm">← 관리자</Link>
            <span className="text-border-custom">|</span>
            <h1 className="text-surface font-bold">포인트샵 관리</h1>
          </div>
          <Link href="/pointshop" target="_blank" className="text-muted hover:text-accent text-sm">사이트 미리보기 →</Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-4 border-t border-border-custom">
          <button onClick={() => setTab("products")} className={`py-3 text-sm font-semibold border-b-2 ${tab === "products" ? "border-accent text-accent" : "border-transparent text-muted"}`}>상품 관리</button>
          <button onClick={() => setTab("orders")} className={`py-3 text-sm font-semibold border-b-2 ${tab === "orders" ? "border-accent text-accent" : "border-transparent text-muted"}`}>주문 관리</button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "products" ? <ProductsTab /> : <OrdersTab />}
      </main>
    </div>
  );
}

// ─── Products Tab ───
function ProductsTab() {
  const [products, setProducts] = useState<PointshopProduct[]>([]);
  const [editing, setEditing] = useState<PointshopProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct());
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try { setProducts(await listProducts(true)); } catch (e) { console.error(e); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const startCreate = () => { setEditing(null); setForm(emptyProduct()); };
  const startEdit = (p: PointshopProduct) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "", image: p.image || "",
      images: p.images || [], price: p.price, stock: p.stock,
      category: p.category || "", active: p.active, sort_order: p.sort_order || 0,
    });
  };

  const save = async () => {
    if (!form.name.trim() || form.price < 0) { alert("상품명과 가격은 필수입니다."); return; }
    setSaving(true);
    try {
      const payload = { ...form, description: sanitizeHtml(form.description || "") };
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
      alert("저장 완료");
      setEditing(null); setForm(emptyProduct());
      await refresh();
    } catch (e) {
      alert("저장 실패: " + (e instanceof Error ? e.message : JSON.stringify(e)));
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try { await deleteProduct(id); if (editing?.id === id) { setEditing(null); setForm(emptyProduct()); } await refresh(); }
    catch (e) { alert("삭제 실패: " + (e instanceof Error ? e.message : JSON.stringify(e))); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      <aside className="bg-white rounded-2xl border border-border-custom p-4 max-h-[calc(100vh-160px)] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-muted text-sm">등록 상품 {products.length}개</p>
          <button onClick={startCreate} className="text-accent border border-accent hover:bg-accent hover:text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all">+ 새 상품</button>
        </div>
        {products.length === 0 ? (
          <p className="text-muted text-sm py-8 text-center">등록된 상품이 없습니다</p>
        ) : (
          <ul className="space-y-2">
            {products.map(p => (
              <li key={p.id}>
                <button onClick={() => startEdit(p)} className={`w-full text-left p-3 rounded-xl border transition-all ${editing?.id === p.id ? "border-accent bg-accent/5" : "border-border-custom hover:border-accent/50"}`}>
                  <div className="flex items-center gap-3">
                    {p.image ? <img src={p.image} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 rounded-lg bg-bg" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {p.category && <span className="text-[10px] font-bold text-accent bg-accent-light px-1.5 py-0.5 rounded">{p.category}</span>}
                        {!p.active && <span className="text-[10px] font-bold text-white bg-gray-400 px-1.5 py-0.5 rounded">비공개</span>}
                        {p.stock === 0 && <span className="text-[10px] font-bold text-white bg-red-400 px-1.5 py-0.5 rounded">품절</span>}
                      </div>
                      <p className="text-surface text-[13px] font-semibold truncate">{p.name}</p>
                      <p className="text-muted text-[11px]">{p.price.toLocaleString()}pt · 재고 {p.stock === -1 ? "무제한" : p.stock}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="bg-white rounded-2xl border border-border-custom p-6">
        <h2 className="text-xl font-bold text-surface mb-6">{editing ? `편집: ${editing.name}` : "새 상품 등록"}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">상품명 *</label>
              <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 홀덤 카드 세트" />
            </div>
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">카테고리</label>
              <select className={inputClass} value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="">선택 안 함</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">가격 (포인트) *</label>
              <input type="number" min={0} className={inputClass} value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">재고 (-1: 무제한)</label>
              <input type="number" min={-1} className={inputClass} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">정렬 (숫자 클수록 위)</label>
              <input type="number" className={inputClass} value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) || 0 }))} />
            </div>
          </div>
          <ImageUpload value={form.image || ""} onChange={v => setForm(f => ({ ...f, image: v }))} folder="pointshop" label="대표 이미지" aspect="aspect-square" />
          <div>
            <label className="text-sm font-semibold text-sub block mb-1.5">추가 이미지 (선택, 최대 5장)</label>
            <div className="space-y-2">
              {(form.images || []).map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <img src={img} className="w-16 h-16 rounded-lg object-cover" alt="" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, images: (f.images || []).filter((_, j) => j !== i) }))} className="text-red-400 text-xs font-semibold hover:text-red-500">삭제</button>
                </div>
              ))}
              {(form.images || []).length < 5 && (
                <ImageUpload value="" onChange={v => v && setForm(f => ({ ...f, images: [...(f.images || []), v] }))} folder="pointshop" label="이미지 추가" />
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-sub block mb-1.5">상세 설명</label>
            <RichEditor value={form.description || ""} onChange={v => setForm(f => ({ ...f, description: v }))} storageFolder="pointshop" minHeight={220} maxChars={10000} placeholder="상품 상세 설명 · 사용법 · 유의사항 등" />
          </div>
          <label className="inline-flex items-center gap-2 text-sub">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
            <span className="text-sm">판매 활성화 (해제 시 사이트에서 숨김)</span>
          </label>
          <div className="flex gap-3 pt-4 border-t border-border-custom">
            {editing && <button onClick={() => remove(editing.id)} className="border border-red-300 text-red-500 hover:bg-red-50 font-bold px-4 py-3 rounded-xl text-sm">삭제</button>}
            <button onClick={save} disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">
              {saving ? "저장 중..." : editing ? "수정 저장" : "새 상품 등록"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Orders Tab ───
function OrdersTab() {
  const [orders, setOrders] = useState<PointshopOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<PointshopOrderStatus | "all">("pending");
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try { setOrders(await listOrders(statusFilter === "all" ? {} : { status: statusFilter })); } catch (e) { console.error(e); }
  }, [statusFilter]);
  useEffect(() => { refresh(); }, [refresh]);

  const setStatus = async (order: PointshopOrder, newStatus: PointshopOrderStatus, extra?: { admin_memo?: string; tracking_number?: string }) => {
    setSaving(order.id);
    try {
      if (newStatus === "cancelled" && order.status !== "cancelled") {
        await refundOrder(order);
      } else {
        await updateOrderStatus(order.id, newStatus, extra);
      }
      await refresh();
    } catch (e) {
      alert("변경 실패: " + (e instanceof Error ? e.message : JSON.stringify(e)));
    } finally { setSaving(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusFilter === "all" ? "bg-accent text-white" : "bg-white border border-border-custom text-sub"}`}>전체</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusFilter === s.value ? "bg-accent text-white" : "bg-white border border-border-custom text-sub"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-border-custom rounded-2xl py-16 text-center text-muted">주문이 없습니다</div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const status = STATUS_OPTIONS.find(s => s.value === o.status)!;
            return (
              <div key={o.id} className="bg-white border border-border-custom rounded-2xl p-5">
                <div className="flex items-start gap-4 mb-3">
                  {o.product_image ? <img src={o.product_image} className="w-20 h-20 rounded-xl object-cover shrink-0" alt="" /> : <div className="w-20 h-20 rounded-xl bg-bg shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      <span className="text-[11px] text-muted">{o.created_at ? new Date(o.created_at).toLocaleString("ko-KR") : ""}</span>
                    </div>
                    <h3 className="text-surface font-bold text-[15px]">{o.product_name} × {o.quantity}</h3>
                    <p className="text-muted text-[12px]">{o.total_price.toLocaleString()}pt · {o.user_nickname || o.user_id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-[13px]">
                  <div className="bg-bg rounded-xl p-3">
                    <p className="text-muted text-[11px] font-semibold mb-1">받는 분</p>
                    <p className="text-surface font-semibold">{o.recipient_name || "-"} · {o.recipient_phone || "-"}</p>
                    <p className="text-sub text-[12px] mt-1">{o.recipient_address || "-"}</p>
                    {o.memo && <p className="text-muted text-[12px] mt-1">요청: {o.memo}</p>}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-muted block mb-1">송장 번호</label>
                      <input className={inputClass + " !py-2 !text-[13px]"} defaultValue={o.tracking_number || ""}
                        onBlur={e => { if (e.target.value !== (o.tracking_number || "")) setStatus(o, o.status, { tracking_number: e.target.value }); }} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted block mb-1">관리자 메모 (사용자에게 노출)</label>
                      <input className={inputClass + " !py-2 !text-[13px]"} defaultValue={o.admin_memo || ""}
                        onBlur={e => { if (e.target.value !== (o.admin_memo || "")) setStatus(o, o.status, { admin_memo: e.target.value }); }} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border-custom">
                  {STATUS_OPTIONS.filter(s => s.value !== "cancelled").map(s => (
                    <button key={s.value} onClick={() => setStatus(o, s.value)} disabled={saving === o.id || o.status === s.value}
                      className={`text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all ${o.status === s.value ? "bg-gray-200 text-gray-500 cursor-not-allowed" : `${s.color} hover:opacity-80`}`}>
                      {s.label}
                    </button>
                  ))}
                  <button onClick={() => { if (confirm("주문을 취소하고 포인트를 환불하시겠습니까?")) setStatus(o, "cancelled"); }}
                    disabled={saving === o.id || o.status === "cancelled"}
                    className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:opacity-80 disabled:opacity-40 ml-auto">
                    취소 + 환불
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
