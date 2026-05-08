"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
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
  signUp: (email: string, password: string, nickname: string, userType?: string, referralCode?: string) => Promise<{ error: string | null }>;
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
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) {
      setProfile(data);
    } else {
      // Profile doesn't exist yet - create it
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user) {
        const newProfile = {
          id: userId,
          email: authUser.user.email || "",
          nickname: authUser.user.email?.split("@")[0] || "회원",
          role: "user",
        };
        await supabase.from("profiles").upsert(newProfile);
        const { data: created } = await supabase.from("profiles").select("*").eq("id", userId).single();
        setProfile(created);
      }
    }
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

  const signUp = async (email: string, password: string, nickname: string, userType: string = "일반", referralCode?: string) => {
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

      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        nickname,
        role: "user",
        user_type: userType,
        referral_code: newCode,
        referred_by: referredBy,
        tournament_tickets: 1,
      });

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
