"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getRank, Rank } from "@/lib/rank";

export interface UserProfileLite {
  rank: Rank;
  nickname: string;
}

export function useUserRanks(userIds: (string | null | undefined)[]): Record<string, Rank> {
  const profiles = useUserProfiles(userIds);
  const map: Record<string, Rank> = {};
  Object.entries(profiles).forEach(([id, p]) => { map[id] = p.rank; });
  return map;
}

export function useUserProfiles(userIds: (string | null | undefined)[]): Record<string, UserProfileLite> {
  const key = useMemo(
    () => [...new Set(userIds.filter((x): x is string => !!x))].sort().join(","),
    [userIds]
  );
  const [profileMap, setProfileMap] = useState<Record<string, UserProfileLite>>({});

  useEffect(() => {
    if (!key) { setProfileMap({}); return; }
    const ids = key.split(",");
    supabase.from("profiles").select("id, points, nickname").in("id", ids).then(({ data }) => {
      const map: Record<string, UserProfileLite> = {};
      (data || []).forEach((p: { id: string; points: number | null; nickname: string | null }) => {
        map[p.id] = { rank: getRank(p.points || 0), nickname: p.nickname || "" };
      });
      setProfileMap(map);
    });
  }, [key]);

  return profileMap;
}
