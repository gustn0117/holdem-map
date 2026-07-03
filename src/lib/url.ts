/**
 * 사용자가 입력한 링크에 스킴이 없으면 https:// 를 붙여준다.
 * 관리자가 "미소여행.com" 처럼 입력해도 클릭 시 정상 이동하도록 하는 안전판.
 * mailto: / tel: / //example.com / 내부 경로(/, #) 등은 그대로 통과.
 */
export function normalizeExternalUrl(u: string | null | undefined): string {
  const s = (u || "").trim();
  if (!s) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  if (s.startsWith("/") || s.startsWith("#")) return s;
  if (s.startsWith("//")) return "https:" + s;
  return "https://" + s;
}
