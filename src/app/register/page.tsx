"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (nickname.length < 2) { setError("닉네임은 2자 이상이어야 합니다."); return; }

    if (method === "phone") {
      if (!/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ""))) { setError("올바른 전화번호를 입력하세요."); return; }
      // Phone: use phone as fake email for Supabase Auth
      const fakeEmail = `${phone.replace(/-/g, "")}@phone.holdemmap.kr`;
      setLoading(true);
      const { error } = await signUp(fakeEmail, password, nickname);
      if (error) {
        setError(error.includes("already registered") ? "이미 등록된 전화번호입니다." : error);
        setLoading(false);
      } else {
        // Save phone number to profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from("profiles").update({ phone: phone.replace(/-/g, "") }).eq("id", user.id);
        router.push("/");
      }
    } else {
      if (!email) { setError("이메일을 입력하세요."); return; }
      setLoading(true);
      const { error } = await signUp(email, password, nickname);
      if (error) {
        setError(error.includes("already registered") ? "이미 등록된 이메일입니다." : error);
        setLoading(false);
      } else {
        router.push("/");
      }
    }
  };

  const inputClass = "w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 36 36" fill="none">
              <rect x="1.25" y="1.25" width="33.5" height="33.5" rx="7" fill="white" stroke="#03C75A" strokeWidth="2.5" />
              <path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="#DC2626" />
            </svg>
            <h1 className="text-2xl font-black text-surface">회원가입</h1>
            <p className="text-muted text-sm mt-1">간단한 정보를 입력하고 시작하세요</p>
          </div>

          {/* Method toggle */}
          <div className="flex bg-[#f5f6f8] rounded-xl p-1 mb-6">
            <button type="button" onClick={() => setMethod("email")}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${method === "email" ? "bg-white text-surface shadow-sm" : "text-muted"}`}>
              이메일로 가입
            </button>
            <button type="button" onClick={() => setMethod("phone")}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${method === "phone" ? "bg-white text-surface shadow-sm" : "text-muted"}`}>
              전화번호로 가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">닉네임</label>
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required
                className={inputClass} placeholder="사용할 닉네임 (2자 이상)" />
            </div>

            {method === "email" ? (
              <div>
                <label className="text-surface text-sm font-semibold mb-1.5 block">이메일</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className={inputClass} placeholder="example@email.com" />
              </div>
            ) : (
              <div>
                <label className="text-surface text-sm font-semibold mb-1.5 block">전화번호</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                  className={inputClass} placeholder="01012345678" />
                <p className="text-muted text-[11px] mt-1">별도 인증 없이 번호만 입력하시면 됩니다</p>
              </div>
            )}

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className={inputClass} placeholder="6자 이상" />
            </div>

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">비밀번호 확인</label>
              <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required
                className={inputClass} placeholder="비밀번호 재입력" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-[15px]">
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-accent font-semibold hover:underline">로그인</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
