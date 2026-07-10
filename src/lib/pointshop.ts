import { supabase } from "@/lib/supabase";
import type { PointshopProduct, PointshopOrder, PointshopOrderStatus } from "@/types";

export const POINTSHOP_MIN_POINTS = 10_000;
export const POINTSHOP_MIN_DAYS = 14;

export interface EligibilityCheck {
  eligible: boolean;
  reasons: string[];
  points: number;
  daysSinceSignup: number;
}

export function checkEligibility(profile: { points?: number | null; created_at?: string | null } | null): EligibilityCheck {
  const points = profile?.points || 0;
  const reasons: string[] = [];
  const now = Date.now();
  const created = profile?.created_at ? new Date(profile.created_at).getTime() : now;
  const daysSinceSignup = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  if (points < POINTSHOP_MIN_POINTS) {
    reasons.push(`포인트 ${POINTSHOP_MIN_POINTS.toLocaleString()}점 이상이 필요합니다 (현재 ${points.toLocaleString()}점)`);
  }
  if (daysSinceSignup < POINTSHOP_MIN_DAYS) {
    reasons.push(`회원가입 후 ${POINTSHOP_MIN_DAYS}일이 지나야 이용할 수 있습니다 (가입 후 ${daysSinceSignup}일 경과)`);
  }

  return { eligible: reasons.length === 0, reasons, points, daysSinceSignup };
}

// ─── Products ───
export async function listProducts(includeInactive = false): Promise<PointshopProduct[]> {
  const q = supabase.from("pointshop_products").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (!includeInactive) q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as PointshopProduct[];
}

export async function getProduct(id: string): Promise<PointshopProduct | null> {
  const { data, error } = await supabase.from("pointshop_products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as PointshopProduct) || null;
}

export async function createProduct(product: Omit<PointshopProduct, "id" | "created_at" | "updated_at">): Promise<PointshopProduct> {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const { data, error } = await supabase.from("pointshop_products").insert({ id, ...product }).select().single();
  if (error) throw error;
  return data as PointshopProduct;
}

export async function updateProduct(id: string, updates: Partial<PointshopProduct>): Promise<PointshopProduct> {
  const { data, error } = await supabase.from("pointshop_products").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data as PointshopProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("pointshop_products").delete().eq("id", id);
  if (error) throw error;
}

// ─── Orders ───
export interface PurchaseInput {
  productId: string;
  quantity: number;
  userId: string;
  userNickname?: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  memo?: string;
}

export async function purchaseProduct(input: PurchaseInput): Promise<PointshopOrder> {
  const product = await getProduct(input.productId);
  if (!product) throw new Error("상품을 찾을 수 없습니다.");
  if (!product.active) throw new Error("판매 중지된 상품입니다.");
  if (product.stock !== -1 && product.stock < input.quantity) throw new Error("재고가 부족합니다.");

  const totalPrice = product.price * input.quantity;

  const { data: profile, error: pErr } = await supabase.from("profiles").select("points, nickname").eq("id", input.userId).maybeSingle();
  if (pErr) throw pErr;
  if (!profile) throw new Error("프로필을 찾을 수 없습니다.");
  const currentPoints = profile.points || 0;
  if (currentPoints < totalPrice) throw new Error(`포인트가 부족합니다. (필요: ${totalPrice.toLocaleString()}pt, 보유: ${currentPoints.toLocaleString()}pt)`);

  // 포인트 차감
  const { error: deductErr } = await supabase.from("profiles").update({ points: currentPoints - totalPrice }).eq("id", input.userId);
  if (deductErr) throw deductErr;

  // 재고 차감
  if (product.stock !== -1) {
    await supabase.from("pointshop_products").update({ stock: product.stock - input.quantity }).eq("id", product.id);
  }

  // 주문 생성
  const orderId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const { data: order, error: oErr } = await supabase.from("pointshop_orders").insert({
    id: orderId,
    user_id: input.userId,
    user_nickname: input.userNickname || profile.nickname || null,
    product_id: product.id,
    product_name: product.name,
    product_image: product.image || product.images?.[0] || null,
    price: product.price,
    quantity: input.quantity,
    total_price: totalPrice,
    status: "pending",
    recipient_name: input.recipientName,
    recipient_phone: input.recipientPhone,
    recipient_address: input.recipientAddress,
    memo: input.memo || null,
  }).select().single();

  if (oErr) {
    // rollback points
    await supabase.from("profiles").update({ points: currentPoints }).eq("id", input.userId);
    if (product.stock !== -1) {
      await supabase.from("pointshop_products").update({ stock: product.stock }).eq("id", product.id);
    }
    throw oErr;
  }

  return order as PointshopOrder;
}

export async function listOrders(filters: { userId?: string; status?: PointshopOrderStatus } = {}): Promise<PointshopOrder[]> {
  const q = supabase.from("pointshop_orders").select("*").order("created_at", { ascending: false }).limit(500);
  if (filters.userId) q.eq("user_id", filters.userId);
  if (filters.status) q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as PointshopOrder[];
}

export async function updateOrderStatus(id: string, status: PointshopOrderStatus, extras?: { admin_memo?: string; tracking_number?: string }): Promise<PointshopOrder> {
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (extras?.admin_memo !== undefined) payload.admin_memo = extras.admin_memo;
  if (extras?.tracking_number !== undefined) payload.tracking_number = extras.tracking_number;
  const { data, error } = await supabase.from("pointshop_orders").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as PointshopOrder;
}

export async function refundOrder(order: PointshopOrder): Promise<void> {
  // 취소 처리: 상태 변경 + 포인트 환불 + 재고 복원
  const { data: profile } = await supabase.from("profiles").select("points").eq("id", order.user_id).maybeSingle();
  const currentPoints = profile?.points || 0;
  await supabase.from("profiles").update({ points: currentPoints + order.total_price }).eq("id", order.user_id);
  const { data: prod } = await supabase.from("pointshop_products").select("stock").eq("id", order.product_id).maybeSingle();
  if (prod && prod.stock !== -1) {
    await supabase.from("pointshop_products").update({ stock: prod.stock + order.quantity }).eq("id", order.product_id);
  }
  await supabase.from("pointshop_orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", order.id);
}
