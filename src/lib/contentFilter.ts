/**
 * 콘텐츠 자동 필터 — 금지 문구/연락처/외부 링크 차단
 *
 * 정책:
 *  - 연락처/메신저 ID/외부 링크 포함 → BLOCK (등록 차단)
 *  - 위험 키워드 포함 → BLOCK (등록 차단, "작성 안되도록" 정책)
 *  - 둘 다 아니면 ALLOW
 *
 * 공개 본문(제목·내용·소개·설명)에 호출. 전용 연락처 필드에는 적용하지 않음.
 */

export const RISK_KEYWORDS: string[] = [
  // 현금·환전·계좌 관련
  "현금", "환전", "계좌", "입금", "출금",
  // 수익/배팅
  "수익 보장", "수익보장", "베팅", "판돈",
  // 게임 운영 용어 (오용 방지)
  "바이인", "리바이", "상금 지급", "상금지급",
  "모집 마감 임박", "모집마감임박",
  // 외부 채널 유도
  "오픈채팅", "오픈 채팅", "오픈카톡",
  // 대리/수수료/픽업
  "수수료 지급", "수수료지급", "대리 참가", "대리참가",
  "픽업 가능", "픽업가능",
  // 꽁머니·프로모션 유도
  "꽁머니", "꽁 머니",
];

// 전화번호 / 메신저 ID / 외부 URL
const CONTACT_REGEXES: { re: RegExp; label: string }[] = [
  { re: /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/, label: "전화번호" },
  { re: /\b(카톡|카카오톡|kakao|kakaotalk)\b[^\n]{0,10}?[a-zA-Z0-9._\-]{3,}/i, label: "카카오톡 ID" },
  { re: /\b(텔레|텔레그램|telegram|tg)\b[^\n]{0,10}?[a-zA-Z0-9._\-]{3,}/i, label: "텔레그램 ID" },
  { re: /open\.kakao\.com\//i, label: "오픈채팅 링크" },
  { re: /t\.me\//i, label: "텔레그램 링크" },
];

const URL_REGEX = /https?:\/\/[^\s]+/i;

export type FilterAction = "allow" | "block";

export interface FilterResult {
  action: FilterAction;
  reasons: string[];
  hits?: string[];
}

export function classifyContent(text: string): FilterResult {
  if (!text || !text.trim()) return { action: "allow", reasons: [] };

  const reasons: string[] = [];
  const hits: string[] = [];

  // 1) 연락처·메신저·외부 링크 — 즉시 차단
  for (const { re, label } of CONTACT_REGEXES) {
    if (re.test(text)) {
      reasons.push(`${label}는(은) 본문에 입력할 수 없습니다. 전용 연락처 필드를 이용해주세요.`);
      hits.push(label);
    }
  }
  if (URL_REGEX.test(text)) {
    reasons.push("외부 링크는 입력할 수 없습니다.");
    hits.push("외부 링크");
  }

  // 2) 위험 키워드 — 즉시 차단
  const lower = text.toLowerCase();
  const keywordHits: string[] = [];
  for (const kw of RISK_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      keywordHits.push(kw);
    }
  }
  if (keywordHits.length > 0) {
    reasons.push(
      `금지 키워드가 포함되어 있습니다: ${keywordHits.slice(0, 5).join(", ")}${keywordHits.length > 5 ? " 외" : ""}`
    );
    hits.push(...keywordHits);
  }

  if (reasons.length > 0) {
    return { action: "block", reasons, hits };
  }

  return { action: "allow", reasons: [] };
}

/** 여러 필드를 합쳐 한 번에 검사. 하나라도 block 이면 block. */
export function classifyFields(fields: Record<string, string>): FilterResult {
  const joined = Object.values(fields).filter(Boolean).join("\n");
  return classifyContent(joined);
}

/** alert 에 사용할 사람이 읽기 쉬운 메시지. */
export function formatFilterMessage(result: FilterResult): string {
  if (result.action === "allow") return "";
  // alert() 텍스트라 SVG 불가 → 텍스트로 표기
  return "[차단] 게시가 차단되었습니다.\n\n" + result.reasons.join("\n") + "\n\n수정 후 다시 등록해주세요.";
}
