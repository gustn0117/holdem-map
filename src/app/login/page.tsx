"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : error);
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
            <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#03C75A" />
              <path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="#DC2626" />
            </svg>
            <h1 className="text-2xl font-black text-surface">로그인</h1>
            <p className="text-muted text-sm mt-1">홀덤맵코리아에 오신 것을 환영합니다</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white"
                placeholder="example@email.com" />
            </div>

            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
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
