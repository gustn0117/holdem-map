"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type Tab = "find-id" | "find-pw";

export default function ForgotPasswordPage() {
  const [tab, setTab] = useState<Tab>("find-pw");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const handlePwReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    if (!email.includes("@")) {
      setResult({ kind: "err", msg: "이메일 주소를 입력해주세요. 전화번호로 가입하신 경우 아래 안내를 확인하세요." });
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });
    setLoading(false);
    if (error) setResult({ kind: "err", msg: error.message });
    else setResult({ kind: "ok", msg: "이메일로 재설정 링크를 보냈습니다. 메일함을 확인해주세요." });
  };

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const digits = phone.replace(/-/g, "").trim();
    if (!/^01[0-9]{8,9}$/.test(digits)) {
      setResult({ kind: "err", msg: "올바른 전화번호 형식을 입력해주세요." });
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("email, nickname, created_at")
      .eq("phone", digits)
      .maybeSingle();
    setLoading(false);
    if (!data) {
      setResult({ kind: "err", msg: "해당 전화번호로 가입된 계정을 찾을 수 없습니다." });
    } else if (data.email?.includes("@phone.holdemmap")) {
      setResult({ kind: "ok", msg: `전화번호 가입 계정입니다. 로그인 ID는 입력하신 전화번호(${digits})입니다.` });
    } else {
      const masked = (data.email || "").replace(/^(.{2}).+@/, "$1****@");
      setResult({ kind: "ok", msg: `등록된 이메일: ${masked} (닉네임: ${data.nickname})` });
    }
  };

  const inputClass = "w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="홀덤맵KOREA" className="h-12 w-auto mx-auto mb-3" />
            <h1 className="text-2xl font-black text-surface">계정 찾기</h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-bg rounded-xl p-1 mb-5">
            <button onClick={() => { setTab("find-pw"); setResult(null); }}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all ${tab === "find-pw" ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
              비밀번호 찾기
            </button>
            <button onClick={() => { setTab("find-id"); setResult(null); }}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all ${tab === "find-id" ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
              아이디 찾기
            </button>
          </div>

          {tab === "find-pw" ? (
            <form onSubmit={handlePwReset} className="space-y-4">
              <div>
                <label className="text-surface text-sm font-semibold mb-1.5 block">가입 이메일</label>
                <input type="email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={inputClass} placeholder="가입 시 등록한 이메일" required />
                <p className="text-muted text-[11px] mt-1.5">이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-[15px]">
                {loading ? "전송 중..." : "재설정 링크 받기"}
              </button>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[12px] px-4 py-3 rounded-xl">
                <p className="font-semibold mb-1">전화번호로 가입하신 경우</p>
                <p>이메일이 없어 자동 재설정이 어렵습니다. 아래 <Link href="/contact" className="text-accent underline underline-offset-2">문의하기</Link>를 통해 관리자에게 요청해주세요.</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFindId} className="space-y-4">
              <div>
                <label className="text-surface text-sm font-semibold mb-1.5 block">전화번호</label>
                <input type="tel" name="phone" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  className={inputClass} placeholder="01012345678" required />
                <p className="text-muted text-[11px] mt-1.5">가입 시 등록한 전화번호로 ID를 찾아드립니다.</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-[15px]">
                {loading ? "조회 중..." : "아이디 찾기"}
              </button>
            </form>
          )}

          {result && (
            <div className={`mt-4 text-sm px-4 py-3 rounded-xl border ${result.kind === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
              {result.msg}
            </div>
          )}

          <p className="text-center text-muted text-sm mt-6">
            <Link href="/login" className="text-accent font-semibold hover:underline">로그인으로 돌아가기</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
