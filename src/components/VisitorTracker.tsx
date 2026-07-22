"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const VISITOR_KEY = "hm_visitor_id";

/** 방문자 식별자 (개인정보 아님 · 브라우저 단위 임의 UUID) */
function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // 사파리 프라이빗 모드 등 localStorage 차단 환경
    return "anonymous";
  }
}

/** 통계에서 제외할 경로 (관리자 화면은 방문자 수에 포함하지 않음) */
function isExcluded(path: string): boolean {
  return path.startsWith("/admin") || path.startsWith("/api");
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || isExcluded(pathname)) return;
    // React Strict Mode 이중 실행 및 동일 경로 재기록 방지
    if (lastLogged.current === pathname) return;
    lastLogged.current = pathname;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    supabase
      .from("page_views")
      .insert({
        visitor_id: getVisitorId(),
        path: pathname,
        // 자기 사이트 내 이동은 유입 경로가 아니므로 제외
        referrer: referrer && !referrer.includes(location.host) ? referrer.slice(0, 500) : null,
      })
      .then(() => {});
  }, [pathname]);

  return null;
}
