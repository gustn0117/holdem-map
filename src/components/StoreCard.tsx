import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store, compact }: { store: Store; compact?: boolean }) {
  if (compact) {
    return (
      <Link href={`/store/${store.id}`} className="block group">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-border-custom hover:border-accent/30 transition-all">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${store.is_recommended ? "gold-shine" : "bg-card border border-border-custom"}`}>
            {store.is_recommended ? <span className="text-dark text-sm font-bold">★</span> : <svg className="w-4.5 h-4.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[15px] font-semibold truncate group-hover:text-accent transition-colors">{store.name}</p>
            <p className="text-muted text-sm mt-0.5">{store.region} · {store.hours}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/store/${store.id}`}>
      <div className="group bg-card rounded-2xl border border-border-custom hover:border-accent/40 transition-all duration-200 hover:shadow-lg hover:shadow-accent/8 cursor-pointer overflow-hidden">
        {store.is_recommended && <div className="gold-shine h-[2px]" />}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${store.is_recommended ? "gold-shine shadow-lg shadow-accent/25" : "bg-card border border-border-custom"}`}>
              {store.is_recommended ? <span className="text-dark text-base font-bold drop-shadow-sm">★</span> : <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-base truncate group-hover:text-accent transition-colors">{store.name}</h3>
                {store.is_recommended && <span className="gold-text-shine text-[10px] font-bold px-2 py-0.5 rounded bg-accent/10 shrink-0">추천</span>}
              </div>
              <p className="text-muted text-sm mb-3">{store.address}</p>

              <div className="flex items-center gap-2.5 text-sm mb-3">
                <span className="flex items-center gap-1.5 text-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
                  영업중
                </span>
                <span className="w-px h-3.5 bg-border-custom" />
                <span className="text-sub">{store.hours}</span>
                <span className="w-px h-3.5 bg-border-custom" />
                <span className="text-sub">{store.region}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {store.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-md text-xs bg-white/5 text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <svg className="w-5 h-5 text-border-custom group-hover:text-accent shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
