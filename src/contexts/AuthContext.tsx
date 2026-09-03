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
  signUp: (email: string, password: string, nickname: string, userType?: string, referralCode?: string, username?: string) => Promise<{ error: string | null }>;
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
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) { setProfile(data); return; }

    // Race condition with signUp(): 잠깐 기다린 후 재시도. signUp 안에서 정식 닉네임으로
    // insert 중일 수 있으므로 fallback profile을 만들지 않는다 (이메일 prefix가 닉네임을
    // 덮어쓰던 과거 버그 제거).
    await new Promise(r => setTimeout(r, 1500));
    const { data: retry } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (retry) { setProfile(retry); return; }

    // 그래도 없으면 (signUp을 안 거친 레거시 케이스) profile=null 상태 유지.
    // 사용자가 마이페이지에서 직접 닉네임을 설정하도록 유도.
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

  const signUp = async (email: string, password: string, nickname: string, userType: string = "일반", referralCode?: string, username?: string) => {
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

      // upsert로 race 안전: fetchProfile이 먼저 빈 row를 만들었어도 사용자 입력 닉네임으로 덮어씀
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        username: uname || null,
        nickname,
        role: "user",
        user_type: userType,
        referral_code: newCode,
        referred_by: referredBy,
        tournament_tickets: 1,
      }, { onConflict: "id" });

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

      await fetchProfile(data.user.id);
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
