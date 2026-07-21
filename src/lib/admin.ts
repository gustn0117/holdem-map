import { useSyncExternalStore } from "react";

// 관리자 세션 판별 (기존 admin 페이지들의 sessionStorage 게이트와 동일 규칙)
export const ADMIN_PASSWORD = "1234Qwer!!";

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem("hm_admin") === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

// 세션값은 페이지 수명 동안 바뀌지 않으므로 구독은 no-op.
// 서버 스냅샷을 false로 고정해 hydration mismatch를 방지한다.
const subscribe = () => () => {};

export function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribe, isAdminSession, () => false);
}
