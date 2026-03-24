import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store, compact }: { store: Store; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/store/${store.id}`} className="block group">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-all">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            store.is_recommended ? "bg-gold/10" : "bg-accent/10"
          }`}>
            <svg className={`w-4 h-4 ${store.is_recommended ? "text-gold" : "text-accent/70"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-surface text-sm font-semibold truncate group-hover:text-white transition-colors">{store.name}</p>
            <p className="text-muted/40 text-[11px] mt-0.5">{store.region} · {store.hours}</p>
          </div>
          <svg className="w-3.5 h-3.5 text-white/10 group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/store/${store.id}`}>
      <div className="group relative bg-card rounded-2xl border border-white/[0.04] hover:border-accent/25 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/[0.04] cursor-pointer overflow-hidden glow-border">
        <div className="absolute inset-0 bg-linear-to-br from-accent/[0.015] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              store.is_recommended
                ? "bg-linear-to-br from-gold/20 to-gold/5"
                : "bg-linear-to-br from-accent/15 to-accent/5"
            }`}>
              {store.is_recommended ? (
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-surface font-semibold text-[15px] truncate group-hover:text-white transition-colors">{store.name}</h3>
                {store.is_recommended && (
                  <span className="bg-gold/12 text-gold text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">추천</span>
                )}
              </div>
              <p className="text-muted/50 text-xs truncate mb-2">{store.address}</p>

              <div className="flex items-center gap-2 text-[11px] mb-2.5">
                <span className="flex items-center gap-1 text-green/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-green/70 pulse-dot" />
                  영업중
                </span>
                <span className="w-px h-3 bg-white/[0.06]" />
                <span className="text-muted/40">{store.hours}</span>
                <span className="w-px h-3 bg-white/[0.06]" />
                <span className="text-muted/40">{store.region}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {store.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] text-muted/50 border border-white/[0.03]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="w-7 h-7 rounded-lg bg-white/[0.02] group-hover:bg-accent/10 flex items-center justify-center shrink-0 transition-colors mt-0.5">
              <svg className="w-3.5 h-3.5 text-white/10 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
