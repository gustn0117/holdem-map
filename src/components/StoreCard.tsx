import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className="group bg-card rounded-2xl p-5 border border-border-custom hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 cursor-pointer">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            store.isRecommended
              ? "bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20"
              : "bg-accent/10 border border-accent/10"
          }`}>
            <svg className={`w-5 h-5 ${store.isRecommended ? "text-gold" : "text-accent"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-surface font-semibold text-[15px] truncate group-hover:text-white transition-colors">
                {store.name}
              </h3>
              {store.isRecommended && (
                <span className="bg-gold/15 text-gold text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                  추천
                </span>
              )}
            </div>
            <p className="text-muted text-xs truncate">{store.address}</p>

            <div className="flex items-center gap-3 mt-2.5 text-xs text-muted">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {store.hours}
              </span>
              <span className="text-border-custom">|</span>
              <span>{store.region}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {store.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-muted border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <svg className="w-4 h-4 text-muted/50 group-hover:text-accent shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
