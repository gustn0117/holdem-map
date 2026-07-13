"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const BOARD_TABS = [
  { href: "/board", label: "자유게시판", desc: "자유롭게 소통하세요" },
  { href: "/board/strategy", label: "전략게시판", desc: "홀덤 전략·팁·후기" },
] as const;

export default function BoardSubNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-4 md:gap-6 border-b border-border-custom mb-5 overflow-x-auto hide-scrollbar">
      {BOARD_TABS.map(t => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href}
            className={`shrink-0 pb-3 -mb-px text-[14px] md:text-[15px] font-bold transition-colors relative ${active ? "text-surface" : "text-muted hover:text-sub"}`}>
            {t.label}
            {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent" />}
          </Link>
        );
      })}
    </div>
  );
}
