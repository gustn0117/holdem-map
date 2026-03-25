import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className="group bg-white rounded-xl border border-border-custom hover:border-accent/40 hover:shadow-md transition-all cursor-pointer overflow-hidden">
        {store.is_recommended && <div className="h-0.5 bg-accent" />}
        <div className="p-4 md:p-5">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${store.is_recommended ? "bg-accent text-white" : "bg-bg text-muted"}`}>
              {store.is_recommended ? "★" : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-surface font-bold text-base truncate group-hover:text-accent transition-colors">{store.name}</h3>
                {store.is_recommended && <span className="text-accent text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-light shrink-0">추천</span>}
              </div>
              <p className="text-muted text-sm mb-2.5">{store.address}</p>
              <div className="flex items-center gap-2.5 text-sm">
                <span className="flex items-center gap-1.5 text-accent font-medium"><span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />영업중</span>
                <span className="text-border-custom">|</span>
                <span className="text-muted">{store.hours}</span>
                <span className="text-border-custom">|</span>
                <span className="text-muted">{store.region}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {store.tags.slice(0, 3).map((tag) => (<span key={tag} className="px-2 py-0.5 rounded text-xs bg-bg text-muted">#{tag}</span>))}
              </div>
            </div>
            <svg className="w-4 h-4 text-border-custom group-hover:text-accent shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
