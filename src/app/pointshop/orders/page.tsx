"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { listOrders } from "@/lib/pointshop";
import type { PointshopOrder, PointshopOrderStatus } from "@/types";

const STATUS_META: Record<PointshopOrderStatus, { label: string; color: string; step: number }> = {
  pending:   { label: "신청 접수",   color: "text-amber-600 border-amber-400",     step: 1 },
  approved:  { label: "승인 완료",   color: "text-blue-600 border-blue-400",       step: 2 },
  shipped:   { label: "발송 완료",   color: "text-purple-600 border-purple-400",   step: 3 },
  completed: { label: "수령 완료",   color: "text-emerald-600 border-emerald-400", step: 4 },
  cancelled: { label: "주문 취소",   color: "text-gray-500 border-gray-300",       step: 0 },
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
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
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
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 md:py-12 flex-1 max-w-350">
        <nav className="flex items-center gap-2 text-[12px] mb-8">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <svg className="w-3 h-3 text-border-custom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
          <Link href="/pointshop" className="text-muted hover:text-accent">포인트샵</Link>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-muted text-[11px] font-black tracking-widest uppercase mb-2">Orders</p>
            <h1 className="text-3xl md:text-4xl font-black text-surface leading-tight">주문 내역</h1>
            <p className="text-muted text-[13px] mt-2">주문 진행 상태와 배송 정보를 확인하세요.</p>
          </div>
          <Link href="/pointshop" className="inline-flex items-center gap-1.5 text-sub hover:text-accent font-bold text-[13px] border-b border-border-custom hover:border-accent pb-0.5 self-start md:self-auto transition-colors">
            포인트샵으로 돌아가기
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Stats — 큰 숫자, 오픈 */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-0 mb-10">
          {(["pending", "approved", "shipped", "completed", "cancelled"] as const).map((s, i, arr) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-left py-4 md:py-6 md:px-6 ${i < arr.length - 1 ? "md:border-r md:border-border-custom" : ""} ${filter === s ? "bg-bg" : "hover:bg-bg/50"} transition-colors`}>
              <p className="text-muted text-[10px] md:text-[11px] font-black tracking-widest uppercase mb-1">{STATUS_META[s].label}</p>
              <p className={`font-black text-2xl md:text-3xl ${filter === s ? "text-surface" : "text-sub"}`}>
                {stats[s]}<span className="text-[11px] text-muted font-normal ml-0.5">건</span>
              </p>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-6 md:gap-8 border-b border-border-custom mb-8 overflow-x-auto hide-scrollbar">
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`shrink-0 pb-3 -mb-px text-[13px] md:text-[14px] font-bold transition-colors relative ${filter === t.key ? "text-surface" : "text-muted hover:text-sub"}`}>
              {t.label}
              {filter === t.key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-surface" />}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted text-[15px]">주문 내역이 없습니다</p>
            <Link href="/pointshop" className="inline-block text-accent font-semibold text-[13px] mt-3 hover:underline">포인트샵으로 이동 →</Link>
          </div>
        ) : (
          <div className="divide-y divide-border-custom">
            {filtered.map(o => {
              const meta = STATUS_META[o.status];
              return (
                <div key={o.id} className="py-8 first:pt-0">
                  <div className="flex items-start gap-5 mb-4">
                    {o.product_image ? (
                      <img src={o.product_image} alt={o.product_name} className="w-20 h-20 md:w-24 md:h-24 object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 hatch-bg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[11px] font-black px-2 py-0.5 border ${meta.color}`}>{meta.label}</span>
                        <span className="text-[11px] text-muted">주문 #{o.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-surface font-bold text-[16px] mb-1 line-clamp-1">{o.product_name}</h3>
                      <p className="text-muted text-[12px]">
                        {o.quantity}개 · <span className="text-surface font-bold">{o.total_price.toLocaleString()} pt</span> · {o.created_at ? new Date(o.created_at).toLocaleDateString("ko-KR") : ""}
                      </p>
                    </div>
                  </div>

                  {o.status !== "cancelled" && (
                    <div className="my-6">
                      <div className="flex items-center">
                        {STEPS.map((label, i) => {
                          const stepNum = i + 1;
                          const active = meta.step >= stepNum;
                          const done = meta.step > stepNum;
                          return (
                            <div key={label} className="flex-1 flex items-center">
                              <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[11px] md:text-[12px] font-black transition-colors ${done ? "bg-surface text-white" : active ? "bg-surface text-white" : "bg-bg text-muted"}`}>
                                  {done ? (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                  ) : stepNum}
                                </div>
                                <span className={`text-[10px] md:text-[11px] font-semibold text-center whitespace-nowrap ${active ? "text-surface" : "text-muted"}`}>{label}</span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-1 md:mx-2 mb-5 ${done ? "bg-surface" : "bg-border-custom"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(o.recipient_name || o.recipient_address) && (
                    <div className="mt-4 flex gap-6 md:gap-10 text-[12px] md:text-[13px]">
                      <div>
                        <p className="text-muted text-[10px] font-black tracking-widest uppercase mb-1">배송지</p>
                        <p className="text-sub font-semibold">{o.recipient_name} · {o.recipient_phone}</p>
                        <p className="text-sub mt-0.5">{o.recipient_address}</p>
                        {o.memo && <p className="text-muted text-[11px] mt-1">요청: {o.memo}</p>}
                      </div>
                    </div>
                  )}

                  {(o.tracking_number || o.admin_memo) && (
                    <div className="mt-4 flex flex-col gap-2 text-[12px]">
                      {o.tracking_number && (
                        <p className="text-sub inline-flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
                          <span className="text-muted font-bold">송장 번호</span>
                          <span className="text-surface font-mono">{o.tracking_number}</span>
                        </p>
                      )}
                      {o.admin_memo && (
                        <p className="text-sub inline-flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                          <span><span className="text-muted font-bold">관리자 메시지:</span> {o.admin_memo}</span>
                        </p>
                      )}
                    </div>
                  )}
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
