import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className="bg-card rounded-xl p-5 border border-border-custom hover:border-accent/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-surface font-semibold text-base">
                {store.name}
              </h3>
              {store.isRecommended && (
                <span className="bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold/30">
                  추천
                </span>
              )}
            </div>
            <p className="text-muted text-sm mt-1">{store.address}</p>
          </div>
          <span className="text-accent text-xs bg-accent/10 px-2 py-1 rounded-md font-medium shrink-0 ml-2">
            {store.region}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {store.hours}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {store.phone}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {store.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
