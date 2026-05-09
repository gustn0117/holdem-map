"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const trimmed = identifier.trim();
    const phoneDigits = trimmed.replace(/-/g, "");
    const isPhone = /^01[0-9]{8,9}$/.test(phoneDigits);
    const loginEmail = isPhone ? `${phoneDigits}@phone.holdemmap.kr` : trimmed;
    const { error } = await signIn(loginEmail, password);
    if (error) {
      setError(error === "Invalid login credentials" ? "이메일/전화번호 또는 비밀번호가 올바르지 않습니다." : error);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="홀덤맵KOREA" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-black text-surface">로그인</h1>
            <p className="text-muted text-sm mt-1">홀덤맵KOREA에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">이메일 또는 전화번호</label>
              <input type="text" name="username" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white"
                placeholder="example@email.com 또는 01012345678" />
              <p className="text-muted text-[11px] mt-1">전화번호로 가입하신 분은 전화번호만 입력하시면 됩니다</p>
            </div>

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">비밀번호</label>
              <input type="password" name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white"
                placeholder="비밀번호 입력" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-[15px]">
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-center text-muted text-sm mt-6">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-accent font-semibold hover:underline">회원가입</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
