import { Rank } from "@/lib/rank";

export default function RankInsignia({ rank, size = "sm" }: { rank: Rank; size?: "xs" | "sm" | "md" }) {
  const barW = size === "xs" ? "w-3" : size === "md" ? "w-5" : "w-4";
  const barH = size === "xs" ? "h-[2px]" : size === "md" ? "h-[3px]" : "h-[2.5px]";
  const chevronSize = size === "xs" ? 10 : size === "md" ? 14 : 12;
  const iconSize = size === "xs" ? 10 : size === "md" ? 14 : 12;

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
      <span className="inline-flex flex-col gap-px items-center justify-center leading-none" aria-label={`${rank.name} 휘장`}>
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
      <span className="inline-flex items-center gap-px leading-none" aria-label={`${rank.name} 휘장`}>
        {Array.from({ length: rank.count }).map((_, i) => (
          <svg key={i} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="block">
            <path d="M12 2c-1.1 0-2 .9-2 2 0 .35.09.68.25.97A3 3 0 008 7c0 .35.06.69.18 1A3 3 0 005 11c0 1.66 1.34 3 3 3 .15 0 .29-.01.43-.03A3 3 0 0012 17a3 3 0 003.57-3.03c.14.02.28.03.43.03 1.66 0 3-1.34 3-3a3 3 0 00-3.18-2.99c.12-.31.18-.65.18-1a3 3 0 00-2.25-2.91A2 2 0 0014 4c0-1.1-.9-2-2-2zm0 7a2 2 0 11-2 2 2 2 0 012-2z" />
          </svg>
        ))}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-px leading-none" aria-label={`${rank.name} 휘장`}>
      {Array.from({ length: rank.count }).map((_, i) => (
        <svg key={i} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="block">
          <path d="M12 2l2.6 7.6h7.9l-6.4 4.7 2.4 7.7L12 17.3 5.5 22l2.4-7.7-6.4-4.7h7.9z" />
        </svg>
      ))}
    </span>
  );
}
