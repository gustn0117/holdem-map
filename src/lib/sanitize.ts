import DOMPurify from "isomorphic-dompurify";

const CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: ["p","br","b","strong","i","em","u","s","strike","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","code","pre","a","img","span","div"],
  ALLOWED_ATTR: ["href","src","alt","title","class","style","target","rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/(?:png|jpe?g|gif|webp);base64,)|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, CONFIG) as unknown as string;
}

export function isHtml(s: string | null | undefined): boolean {
  if (!s) return false;
  return /<\/?[a-z][\s\S]*?>/i.test(s);
}

/** HTML 태그·엔티티를 제거해 목록 미리보기용 순수 텍스트로 변환 */
export function stripHtml(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextToHtml(s: string): string {
  return s.split("\n").map(line => `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "<br>"}</p>`).join("");
}
