import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className="group relative bg-card rounded-2xl p-5 border border-white/5 hover:border-accent/30 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 cursor-pointer gradient-border overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            store.isRecommended
              ? "bg-linear-to-br from-gold/25 to-gold/5"
              : "bg-linear-to-br from-accent/20 to-accent/5"
          }`}>
            {store.isRecommended ? (
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-surface font-semibold text-[15px] truncate group-hover:text-white transition-colors">
                {store.name}
              </h3>
              {store.isRecommended && (
                <span className="bg-gold/15 text-gold text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
                  추천
                </span>
              )}
            </div>

            <p className="text-muted/70 text-xs truncate mb-2.5">{store.address}</p>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-green/80">
                <span className="w-1.5 h-1.5 rounded-full bg-green/80 pulse-dot" />
                영업중
              </span>
              <span className="text-white/10">|</span>
              <span className="text-muted/60">{store.hours}</span>
              <span className="text-white/10">|</span>
              <span className="text-muted/60">{store.region}</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2.5">
              {store.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-muted/80 border border-white/[0.04]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors mt-1">
            <svg className="w-3.5 h-3.5 text-muted/30 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
