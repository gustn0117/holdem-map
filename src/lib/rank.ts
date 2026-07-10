export type RankTier = "enlisted" | "nco" | "field" | "general";

export interface Rank {
  name: string;
  min: number;
  max: number;
  color: string;
  border: string;
  tier: RankTier;
  count: number;
}

export const RANKS: Rank[] = [
  { name: "이등병", min: 0, max: 999, color: "bg-gray-100 text-gray-600", border: "border-gray-200", tier: "enlisted", count: 1 },
  { name: "일병", min: 1000, max: 1999, color: "bg-gray-100 text-gray-700", border: "border-gray-200", tier: "enlisted", count: 2 },
  { name: "상병", min: 2000, max: 2999, color: "bg-gray-200 text-gray-800", border: "border-gray-300", tier: "enlisted", count: 3 },
  { name: "병장", min: 3000, max: 3999, color: "bg-slate-200 text-slate-800", border: "border-slate-300", tier: "enlisted", count: 4 },
  { name: "하사", min: 4000, max: 5999, color: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", tier: "nco", count: 1 },
  { name: "중사", min: 6000, max: 7999, color: "bg-emerald-100 text-emerald-700", border: "border-emerald-300", tier: "nco", count: 2 },
  { name: "상사", min: 8000, max: 9999, color: "bg-emerald-200 text-emerald-800", border: "border-emerald-400", tier: "nco", count: 3 },
  { name: "소령", min: 10000, max: 12999, color: "bg-blue-100 text-blue-700", border: "border-blue-200", tier: "field", count: 1 },
  { name: "중령", min: 13000, max: 15999, color: "bg-blue-200 text-blue-800", border: "border-blue-300", tier: "field", count: 2 },
  { name: "대령", min: 16000, max: 19999, color: "bg-blue-300 text-blue-900", border: "border-blue-400", tier: "field", count: 3 },
  { name: "준장", min: 20000, max: 39999, color: "bg-amber-100 text-amber-700", border: "border-amber-200", tier: "general", count: 1 },
  { name: "소장", min: 40000, max: 59999, color: "bg-amber-200 text-amber-800", border: "border-amber-300", tier: "general", count: 2 },
  { name: "중장", min: 60000, max: 79999, color: "bg-amber-300 text-amber-900", border: "border-amber-400", tier: "general", count: 3 },
  { name: "대장", min: 80000, max: Infinity, color: "bg-red-200 text-red-800", border: "border-red-400", tier: "general", count: 4 },
];

export function getRank(points: number) {
  return RANKS.find(r => points >= r.min && points <= r.max) || RANKS[0];
}

export function getRankProgress(points: number) {
  const rank = getRank(points);
  const next = RANKS[RANKS.indexOf(rank) + 1];
  if (!next || rank.max === Infinity) return { rank, progress: 100, pointsToNext: 0 };
  const rangeStart = rank.min;
  const rangeSize = next.min - rangeStart;
  const progress = Math.min(100, Math.floor(((points - rangeStart) / rangeSize) * 100));
  return { rank, nextRank: next, progress, pointsToNext: next.min - points };
}

export const POINT_RULES = {
  post: { points: 10, dailyLimit: 100, countLimit: 10 },
  comment: { points: 3, dailyLimit: 30, countLimit: 100 },
  reaction: { points: 1, dailyLimit: 30, countLimit: 30 },
  job: { points: 5000, dailyLimit: 5000, countLimit: 1 }, // 딜러 구인구직 등록: 하루 1회 5000pt
};

// Server-side function to add points (client should call this)
export type PointType = "post" | "comment" | "reaction" | "job";

export async function addPoints(
  supabase: any,
  userId: string,
  type: PointType
): Promise<{ success: boolean; message?: string; added?: number }> {
  if (!userId) return { success: false, message: "로그인이 필요합니다." };
  const rule = POINT_RULES[type];
  const today = new Date().toISOString().slice(0, 10);

  const { data: profile, error: fetchErr } = await supabase
    .from("profiles")
    .select("points, daily_post_points, daily_comment_points, daily_reaction_points, daily_job_points, daily_post_count, daily_comment_count, daily_reaction_count, daily_job_count, last_points_reset")
    .eq("id", userId)
    .maybeSingle();

  if (fetchErr) return { success: false, message: `프로필 조회 실패: ${fetchErr.message}` };
  if (!profile) return { success: false, message: "프로필이 존재하지 않습니다." };

  const isNewDay = profile.last_points_reset !== today;
  const dailyPoints = isNewDay ? 0 : (profile[`daily_${type}_points`] || 0);
  const dailyCount = isNewDay ? 0 : (profile[`daily_${type}_count`] || 0);

  const typeLabel = type === "post" ? "게시글" : type === "comment" ? "댓글" : type === "reaction" ? "추천/비추천" : "구인구직 등록";
  if (dailyCount >= rule.countLimit) {
    return { success: false, message: `1일 ${typeLabel} 포인트 한도 초과` };
  }

  const addedPoints = Math.max(0, Math.min(rule.points, rule.dailyLimit - dailyPoints));
  if (addedPoints === 0) {
    return { success: false, message: "오늘 포인트 일일 한도에 도달했습니다." };
  }

  // 새 날이면 전체 daily 리셋, 기존 날이면 해당 타입만 증가
  const updatePayload: Record<string, unknown> = {
    points: (profile.points || 0) + addedPoints,
    last_points_reset: today,
  };
  if (isNewDay) {
    updatePayload.daily_post_points = type === "post" ? addedPoints : 0;
    updatePayload.daily_comment_points = type === "comment" ? addedPoints : 0;
    updatePayload.daily_reaction_points = type === "reaction" ? addedPoints : 0;
    updatePayload.daily_job_points = type === "job" ? addedPoints : 0;
    updatePayload.daily_post_count = type === "post" ? 1 : 0;
    updatePayload.daily_comment_count = type === "comment" ? 1 : 0;
    updatePayload.daily_reaction_count = type === "reaction" ? 1 : 0;
    updatePayload.daily_job_count = type === "job" ? 1 : 0;
  } else {
    updatePayload[`daily_${type}_points`] = dailyPoints + addedPoints;
    updatePayload[`daily_${type}_count`] = dailyCount + 1;
  }

  const { error: updateErr } = await supabase.from("profiles").update(updatePayload).eq("id", userId);
  if (updateErr) return { success: false, message: `포인트 적립 실패: ${updateErr.message}` };

  return { success: true, added: addedPoints };
}
