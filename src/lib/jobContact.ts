export interface JobContact {
  phone: string;
  kakao: string;
  telegram: string;
}

/**
 * 구인구직 연락처 파싱.
 * 두 가지 저장 형식을 모두 처리한다.
 *  1) 사용자 작성폼: "전화: 010-... / 카카오톡: id / 텔레그램: id" (접두사 형식, contact_type="복수")
 *  2) 어드민 등록:   contact="010-..." + contact_type="전화|카카오톡|텔레그램" (접두사 없는 원본)
 */
export function parseJobContact(contact?: string | null, contactType?: string | null): JobContact {
  const c = (contact || "").trim();
  const result: JobContact = { phone: "", kakao: "", telegram: "" };
  if (!c) return result;

  // 1) 접두사가 있으면 접두사 기준으로 파싱
  if (/(카카오톡|텔레그램|전화)\s*:/.test(c)) {
    result.kakao = c.match(/카카오톡:\s*([^/\n]+?)(?:\s*\/|$)/)?.[1]?.trim() || "";
    result.telegram = c.match(/텔레그램:\s*([^/\n]+?)(?:\s*\/|$)/)?.[1]?.trim() || "";
    result.phone = c.match(/전화:\s*([^/\n]+?)(?:\s*\/|$)/)?.[1]?.trim() || "";
    return result;
  }

  // 2) 접두사 없는 원본 — contact_type으로 종류 판별
  const t = (contactType || "").trim().toLowerCase();
  if (t.includes("카카오") || t.includes("kakao")) result.kakao = c;
  else if (t.includes("텔레") || t.includes("tele")) result.telegram = c;
  else if (t.includes("전화") || t.includes("phone") || /^[\d+\-\s().]+$/.test(c)) result.phone = c;
  else result.phone = c; // 판별 불가 시 전화로 간주
  return result;
}
