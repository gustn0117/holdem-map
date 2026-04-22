import { Rank } from "@/lib/rank";

export default function RankInsignia({ rank, size = "sm" }: { rank: Rank; size?: "xs" | "sm" | "md" }) {
  const barW = size === "xs" ? "w-3" : size === "md" ? "w-5" : "w-4";
  const barH = size === "xs" ? "h-[2px]" : size === "md" ? "h-[3px]" : "h-[2.5px]";
  const chevronSize = size === "xs" ? 10 : size === "md" ? 14 : 12;
  const starEm = size === "xs" ? "text-[10px]" : size === "md" ? "text-sm" : "text-[11px]";

  if (rank.tier === "enlisted") {
    return (
      <span className="inline-flex flex-col gap-[2px] justify-center leading-none" aria-label={`${rank.name} 휘장`}>
        {Array.from({ length: rank.count }).map((_, i) => (
          <span key={i} className={`${barW} ${barH} bg-current rounded-full`} />
        ))}
      </span>
    );
  }

  if (rank.tier === "nco") {
    return (
      <span className="inline-flex flex-col gap-[1px] items-center justify-center leading-none" aria-label={`${rank.name} 휘장`}>
        {Array.from({ length: rank.count }).map((_, i) => (
          <svg key={i} viewBox="0 0 12 4" width={chevronSize} height={chevronSize / 3} className="block">
            <polyline points="1,3 6,1 11,3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </span>
    );
  }

  if (rank.tier === "field") {
    return (
      <span className={`inline-flex items-center gap-[1px] leading-none ${starEm}`} aria-label={`${rank.name} 휘장`}>
        {Array.from({ length: rank.count }).map((_, i) => (
          <span key={i}>❀</span>
        ))}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-[1px] leading-none ${starEm}`} aria-label={`${rank.name} 휘장`}>
      {Array.from({ length: rank.count }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </span>
  );
}
