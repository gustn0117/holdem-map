"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { listOrders } from "@/lib/pointshop";
import type { PointshopOrder, PointshopOrderStatus } from "@/types";

const STATUS_META: Record<PointshopOrderStatus, { label: string; color: string; step: number }> = {
  pending:   { label: "신청 접수",   color: "bg-amber-100 text-amber-700",     step: 1 },
  approved:  { label: "승인 완료",   color: "bg-blue-100 text-blue-700",       step: 2 },
  shipped:   { label: "발송 완료",   color: "bg-purple-100 text-purple-700",   step: 3 },
  completed: { label: "수령 완료",   color: "bg-emerald-100 text-emerald-700", step: 4 },
  cancelled: { label: "주문 취소",   color: "bg-gray-100 text-gray-600",       step: 0 },
};

const STEPS = ["신청 접수", "관리자 승인", "발송", "수령 완료"];

const FILTER_TABS: { key: PointshopOrderStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "신청 접수" },
  { key: "approved", label: "승인 완료" },
  { key: "shipped", label: "발송 중" },
  { key: "completed", label: "수령 완료" },
  { key: "cancelled", label: "취소됨" },
];

export default function PointshopOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PointshopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PointshopOrderStatus | "all">("all");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    listOrders({ userId: user.id }).then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => filter === "all" ? orders : orders.filter(o => o.status === filter), [orders, filter]);

  const stats = useMemo(() => {
    const s = { total: orders.length, pending: 0, approved: 0, shipped: 0, completed: 0, cancelled: 0 };
    orders.forEach(o => { s[o.status] += 1; });
    return s;
  }, [orders]);

  if (!user) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-secondary">
      <Header />
      <div className="flex-1 flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-xl font-bold text-surface mb-3">로그인이 필요합니다</h1>
          <Link href="/login" className="text-accent font-semibold">로그인 →</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0 bg-secondary">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-6 md:py-8 flex-1 max-w-350">
        <nav className="flex items-center gap-2 text-[12px] mb-5">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/pointshop" className="text-muted hover:text-accent">포인트샵</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold">주문 내역</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-surface mb-1">주문 내역</h1>
            <p className="text-muted text-[13px]">주문 진행 상태와 배송 정보를 확인하세요.</p>
          </div>
          <Link href="/pointshop" className="inline-flex items-center gap-1.5 text-accent font-bold text-[13px] hover:underline">
            포인트샵으로 돌아가기 →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 mb-6">
          {(["pending", "approved", "shipped", "completed", "cancelled"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`bg-white rounded-2xl border p-3 md:p-4 text-left transition-all ${filter === s ? "border-accent bg-accent/5" : "border-border-custom hover:border-muted"}`}>
              <p className="text-muted text-[10px] md:text-[11px] font-semibold mb-0.5">{STATUS_META[s].label}</p>
              <p className="text-surface text-lg md:text-xl font-black">{stats[s]}<span className="text-[11px] text-muted font-normal ml-0.5">건</span></p>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${filter === t.key ? "bg-surface text-white" : "bg-white border border-border-custom text-sub hover:border-accent"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border-custom rounded-2xl py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-bg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-7 h-7 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <p className="text-muted text-[15px]">주문 내역이 없습니다</p>
            <Link href="/pointshop" className="inline-block text-accent font-semibold text-[13px] mt-3 hover:underline">포인트샵으로 이동 →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const meta = STATUS_META[o.status];
              return (
                <div key={o.id} className="bg-white border border-border-custom rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      {o.product_image ? (
                        <img src={o.product_image} alt={o.product_name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-bg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                          <span className="text-[11px] text-muted">주문 #{o.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="text-surface font-bold text-[15px] mb-0.5 line-clamp-1">{o.product_name}</h3>
                        <p className="text-muted text-[12px]">
                          {o.quantity}개 · <span className="text-accent font-bold">{o.total_price.toLocaleString()} pt</span> · {o.created_at ? new Date(o.created_at).toLocaleDateString("ko-KR") : ""}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar (취소가 아닐 때만) */}
                    {o.status !== "cancelled" && (
                      <div className="mt-5">
                        <div className="flex items-center">
                          {STEPS.map((label, i) => {
                            const stepNum = i + 1;
                            const active = meta.step >= stepNum;
                            const done = meta.step > stepNum;
                            return (
                              <div key={label} className="flex-1 flex items-center">
                                <div className="flex flex-col items-center gap-1.5 shrink-0">
                                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-[12px] font-black transition-colors ${done ? "bg-accent text-white" : active ? "bg-accent text-white ring-4 ring-accent/20" : "bg-bg text-muted"}`}>
                                    {done ? (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                    ) : stepNum}
                                  </div>
                                  <span className={`text-[10px] md:text-[11px] font-semibold text-center whitespace-nowrap ${active ? "text-surface" : "text-muted"}`}>{label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-1 md:mx-2 mb-5 ${done ? "bg-accent" : "bg-border-custom"}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recipient */}
                    {(o.recipient_name || o.recipient_address) && (
                      <div className="mt-4 pt-4 border-t border-border-custom">
                        <p className="text-[11px] font-bold text-muted mb-1.5">배송지</p>
                        <p className="text-sub text-[13px] font-semibold">{o.recipient_name} · {o.recipient_phone}</p>
                        <p className="text-sub text-[12px] mt-0.5">{o.recipient_address}</p>
                        {o.memo && <p className="text-muted text-[12px] mt-1">요청: {o.memo}</p>}
                      </div>
                    )}

                    {/* Tracking / admin memo */}
                    {(o.tracking_number || o.admin_memo) && (
                      <div className="mt-3 space-y-1.5">
                        {o.tracking_number && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-[12px] flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
                            <span className="text-blue-700 font-bold">송장 번호</span>
                            <span className="text-blue-900 font-mono">{o.tracking_number}</span>
                          </div>
                        )}
                        {o.admin_memo && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-[12px] text-emerald-800 flex items-start gap-1.5">
                            <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            <span><span className="font-bold">관리자 메시지:</span> {o.admin_memo}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
