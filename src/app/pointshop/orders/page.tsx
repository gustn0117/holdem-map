"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { listOrders } from "@/lib/pointshop";
import type { PointshopOrder, PointshopOrderStatus } from "@/types";

const STATUS_LABEL: Record<PointshopOrderStatus, { label: string; color: string }> = {
  pending: { label: "신청 대기", color: "bg-amber-100 text-amber-700" },
  approved: { label: "승인됨", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "발송 완료", color: "bg-purple-100 text-purple-700" },
  completed: { label: "수령 완료", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "취소됨", color: "bg-gray-100 text-gray-600" },
};

export default function PointshopOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PointshopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    listOrders({ userId: user.id }).then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [user]);

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
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1000px" }}>
        <nav className="flex items-center gap-2 text-[13px] mb-6">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/pointshop" className="text-muted hover:text-accent">포인트샵</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold">내 주문 내역</span>
        </nav>

        <h1 className="text-2xl font-black text-surface mb-6">내 주문 내역</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-border-custom rounded-2xl py-16 text-center">
            <p className="text-muted text-[15px]">주문 내역이 없습니다</p>
            <Link href="/pointshop" className="inline-block text-accent font-semibold text-[13px] mt-3">포인트샵으로 이동 →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => {
              const s = STATUS_LABEL[o.status];
              return (
                <div key={o.id} className="bg-white border border-border-custom rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    {o.product_image ? (
                      <img src={o.product_image} alt={o.product_name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-bg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                        {o.tracking_number && <span className="text-[11px] text-muted">송장: {o.tracking_number}</span>}
                      </div>
                      <h3 className="text-surface font-bold text-[15px] mb-1">{o.product_name}</h3>
                      <p className="text-muted text-[12px]">
                        {o.quantity}개 · {o.total_price.toLocaleString()}pt · {o.created_at ? new Date(o.created_at).toLocaleString("ko-KR") : ""}
                      </p>
                    </div>
                  </div>
                  {(o.recipient_name || o.recipient_address) && (
                    <div className="mt-3 pt-3 border-t border-border-custom text-[12px] text-sub space-y-0.5">
                      <p>받는 분: {o.recipient_name} · {o.recipient_phone}</p>
                      <p>주소: {o.recipient_address}</p>
                      {o.memo && <p className="text-muted">요청: {o.memo}</p>}
                    </div>
                  )}
                  {o.admin_memo && (
                    <div className="mt-3 pt-3 border-t border-border-custom text-[12px] text-accent">
                      관리자 메시지: {o.admin_memo}
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
