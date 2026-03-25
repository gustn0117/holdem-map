import Link from "next/link";
import { Store } from "@/types";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/store/${store.id}`}>
      <div className="group bg-white rounded-2xl border border-border-custom hover:border-accent/50 hover:shadow-[0_2px_20px_rgba(3,199,90,0.08)] transition-all duration-200 cursor-pointer overflow-hidden">
        {store.is_recommended && <div className="h-[3px] bg-gradient-to-r from-accent to-emerald-400" />}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-surface font-bold text-[16px] truncate group-hover:text-accent transition-colors">{store.name}</h3>
            {store.is_recommended && <span className="text-[11px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full shrink-0">추천</span>}
            <span className="text-[12px] text-muted ml-auto shrink-0">{store.region}</span>
          </div>
          <p className="text-muted text-[13px] mb-3">{store.address}</p>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="flex items-center gap-1 text-accent font-medium"><span className="w-[6px] h-[6px] rounded-full bg-accent pulse-dot" />영업중</span>
            <span className="text-[#ddd]">·</span>
            <span className="text-sub">{store.hours}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {store.tags.slice(0, 3).map((tag) => (<span key={tag} className="px-2.5 py-[3px] rounded-full text-[11px] text-muted bg-bg border border-border-custom">#{tag}</span>))}
          </div>
        </div>
      </div>
    </Link>
  );
}
