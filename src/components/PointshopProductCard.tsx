import Link from "next/link";
import type { PointshopProduct } from "@/types";

export default function PointshopProductCard({ product, size = "md" }: { product: PointshopProduct; size?: "sm" | "md" | "lg" }) {
  const isNew = product.created_at ? (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 : false;
  const isHot = (product.sort_order || 0) >= 100;
  const isBest = (product.sort_order || 0) >= 50 && !isHot;
  const soldOut = product.stock === 0;

  const titleClass = size === "sm" ? "text-[13px]" : size === "lg" ? "text-[15px] md:text-[16px]" : "text-[14px]";
  const priceClass = size === "sm" ? "text-[14px]" : size === "lg" ? "text-[18px]" : "text-[16px]";

  return (
    <Link href={`/pointshop/${product.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-border-custom hover:border-accent hover:card-shadow-hover transition-all">
      <div className="aspect-square bg-bg overflow-hidden relative">
        {product.image || product.images?.[0] ? (
          <img src={product.image || product.images?.[0]} alt={product.name} loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ${soldOut ? "grayscale opacity-60" : "group-hover:scale-105"}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {isHot && <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-md shadow-md">🔥 HOT</span>}
          {isBest && <span className="text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-md shadow-md">BEST</span>}
          {isNew && <span className="text-[10px] font-black text-white bg-emerald-500 px-2 py-0.5 rounded-md shadow-md">NEW</span>}
        </div>

        {/* Category top-right */}
        {product.category && !soldOut && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-sub bg-white/95 backdrop-blur px-2 py-0.5 rounded-full">{product.category}</span>
        )}

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-black text-lg tracking-widest">SOLD OUT</span>
          </div>
        )}

        {/* Low stock */}
        {!soldOut && product.stock !== -1 && product.stock <= 3 && (
          <div className="absolute bottom-2.5 left-2.5 bg-red-500/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            품절 임박 (남은 수량 {product.stock})
          </div>
        )}
      </div>

      <div className="p-3 md:p-4">
        <h3 className={`text-surface font-bold ${titleClass} line-clamp-2 min-h-[2.6em] group-hover:text-accent transition-colors`}>{product.name}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-accent font-black ${priceClass}`}>{product.price.toLocaleString()}</span>
          <span className="text-muted text-[11px] font-semibold">pt</span>
        </div>
        {product.stock !== -1 && !soldOut && product.stock > 3 && (
          <p className="text-muted text-[11px] mt-1">재고 {product.stock}개</p>
        )}
      </div>
    </Link>
  );
}
