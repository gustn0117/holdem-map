"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  username: string;
  nickname: string;
  role: string;
  phone: string;
  avatar: string;
  is_blocked: boolean;
  user_type: string;
  status: string;
  status_expires_at: string | null;
  status_updated_at: string | null;
  bio: string;
  experience: string;
  areas: string[];
  store_name: string;
  contact_kakao: string;
  contact_telegram: string;
  contact_phone: string;
  gender: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, nickname: string, userType?: string, referralCode?: string, username?: string, phone?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // signUp()과의 race: 프로필 insert 직후일 수 있으므로 짧게 여러 번 재시도(찾으면 즉시 종료).
    // 기존 고정 1500ms 대기가 회원가입 렉의 원인이라 300ms×최대 4회로 교체.
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) { setProfile(data); return; }
      if (attempt < 3) await new Promise(r => setTimeout(r, 300));
    }
    // 끝까지 없으면 (signUp을 안 거친 레거시 케이스) profile=null 유지.
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nickname: string, userType: string = "일반", referralCode?: string, username?: string, phone?: string) => {
    const uname = (username || "").trim();
    // 아이디 중복 사전 확인 (대소문자 무시)
    if (uname) {
      const { data: dup } = await supabase.from("profiles").select("id").ilike("username", uname).maybeSingle();
      if (dup) return { error: "이미 사용 중인 아이디입니다." };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      // 추천인 조회
      let referredBy: string | null = null;
      if (referralCode && referralCode.trim()) {
        const { data: ref } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", referralCode.trim())
          .maybeSingle();
        if (ref?.id) referredBy = ref.id;
      }

      // 신규 회원 referral_code 생성
      const newCode = Math.random().toString(36).slice(2, 10);

      // upsert로 race 안전: fetchProfile이 먼저 빈 row를 만들었어도 사용자 입력 닉네임으로 덮어씀.
      // 전화번호도 함께 저장하고 저장된 row를 바로 받아 setProfile → 추가 조회 왕복 제거
      const { data: newProfile } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        username: uname || null,
        nickname,
        phone: (phone || "").trim() || null,
        role: "user",
        user_type: userType,
        referral_code: newCode,
        referred_by: referredBy,
        tournament_tickets: 1,
      }, { onConflict: "id" }).select().single();

      // 추천인에게 무료 토너권 +1
      if (referredBy) {
        const { data: refProfile } = await supabase
          .from("profiles")
          .select("tournament_tickets")
          .eq("id", referredBy)
          .maybeSingle();
        const current = (refProfile?.tournament_tickets ?? 0) as number;
        await supabase
          .from("profiles")
          .update({ tournament_tickets: current + 1 })
          .eq("id", referredBy);
      }

      // 저장된 프로필을 바로 반영(추가 조회 없음). 실패 시에만 fallback 조회.
      if (newProfile) setProfile(newProfile as Profile);
      else await fetchProfile(data.user.id);
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
