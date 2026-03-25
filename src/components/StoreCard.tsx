import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className="group bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-200 cursor-pointer overflow-hidden border border-transparent hover:border-accent/20">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-surface font-bold text-[15px] truncate group-hover:text-accent transition-colors">{store.name}</h3>
                {store.is_recommended && <span className="shrink-0 text-[10px] font-bold text-white bg-accent px-2 py-[2px] rounded-full">추천</span>}
              </div>
              <p className="text-muted text-[13px] mt-1">{store.address}</p>
            </div>
            <span className="shrink-0 ml-3 text-[12px] font-semibold text-accent bg-accent-light px-2.5 py-1 rounded-full">{store.region}</span>
          </div>

          <div className="flex items-center gap-2 text-[13px] mb-3">
            <span className="inline-flex items-center gap-1.5 text-accent font-semibold">
              <span className="w-[5px] h-[5px] rounded-full bg-accent pulse-dot" />
              영업중
            </span>
            <span className="text-border-custom">|</span>
            <span className="text-sub">{store.hours}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {store.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-[2px] rounded text-[11px] text-muted bg-bg">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
