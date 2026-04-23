"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getRank, Rank } from "@/lib/rank";

export function useUserRanks(userIds: (string | null | undefined)[]): Record<string, Rank> {
  const key = useMemo(
    () => [...new Set(userIds.filter((x): x is string => !!x))].sort().join(","),
    [userIds]
  );
  const [rankMap, setRankMap] = useState<Record<string, Rank>>({});

  useEffect(() => {
    if (!key) { setRankMap({}); return; }
    const ids = key.split(",");
    supabase.from("profiles").select("id, points").in("id", ids).then(({ data }) => {
      const map: Record<string, Rank> = {};
      (data || []).forEach((p: { id: string; points: number | null }) => {
        map[p.id] = getRank(p.points || 0);
      });
      setRankMap(map);
    });
  }, [key]);

  return rankMap;
}
