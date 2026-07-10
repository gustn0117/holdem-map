import Link from "next/link";
import type { PointshopProduct } from "@/types";

export default function PointshopProductCard({ product }: { product: PointshopProduct }) {
  const isNew = product.created_at ? (Date.now() - new Date(product.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000 : false;
  const isHot = (product.sort_order || 0) >= 100;
  const isBest = (product.sort_order || 0) >= 50 && !isHot;
  const soldOut = product.stock === 0;

  return (
    <Link href={`/pointshop/${product.id}`} className="group block">
      <div className="aspect-square hatch-bg overflow-hidden relative">
        {product.image || product.images?.[0] ? (
          <img src={product.image || product.images?.[0]} alt={product.name} loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 ${soldOut ? "grayscale opacity-60" : "group-hover:scale-105"}`} />
        ) : (
          <div className="w-full h-full" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isHot && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-white bg-red-500 px-1.5 py-0.5">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2s1 4 4 6c2 1.3 3 3.5 3 6 0 3.9-3.1 7-7 7s-7-3.1-7-7c0-2 1-4 3-5-1 4 1 6 2 6-1-3 1-7 2-9 0 3 2 4 3 5 0-3-3-6-3-9z"/></svg>
              HOT
            </span>
          )}
          {isBest && <span className="text-[10px] font-black text-white bg-orange-500 px-1.5 py-0.5">BEST</span>}
          {isNew && <span className="text-[10px] font-black text-white bg-emerald-500 px-1.5 py-0.5">NEW</span>}
        </div>

        {product.category && !soldOut && (
          <span className="absolute top-3 right-3 text-[10px] font-bold text-sub bg-white/95 backdrop-blur px-2 py-0.5">{product.category}</span>
        )}

        {soldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-black text-lg tracking-widest">SOLD OUT</span>
          </div>
        )}

        {!soldOut && product.stock !== -1 && product.stock <= 3 && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
            품절 임박 · 남은 {product.stock}
          </div>
        )}
      </div>

      <div className="pt-3 pb-1">
        <h3 className="text-surface font-bold text-[14px] leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-accent transition-colors">{product.name}</h3>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="text-surface font-black text-[16px]">{product.price.toLocaleString()}</span>
          <span className="text-muted text-[11px]">pt</span>
        </div>
        {product.stock !== -1 && !soldOut && product.stock > 3 && (
          <p className="text-muted text-[11px] mt-0.5">재고 {product.stock}개</p>
        )}
      </div>
    </Link>
  );
}
