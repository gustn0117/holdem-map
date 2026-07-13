"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    // Supabase recovery 링크는 세션을 자동으로 세팅해줌.
    // 여기서 세션 존재 여부 확인 → 없으면 잘못된/만료된 링크 안내.
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
      setChecking(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (password.length < 6) { setResult({ kind: "err", msg: "비밀번호는 6자 이상이어야 합니다." }); return; }
    if (password !== passwordConfirm) { setResult({ kind: "err", msg: "비밀번호가 일치하지 않습니다." }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setResult({ kind: "err", msg: error.message });
      return;
    }
    setResult({ kind: "ok", msg: "비밀번호가 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다." });
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, 1500);
  };

  const inputClass = "w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="홀덤맵KOREA" className="h-12 w-auto mx-auto mb-3" />
            <h1 className="text-2xl font-black text-surface">비밀번호 재설정</h1>
            <p className="text-muted text-sm mt-2">새 비밀번호를 입력해주세요.</p>
          </div>

          {checking ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
          ) : !ready ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-4 rounded-xl text-center">
              <p className="font-semibold mb-1">유효하지 않은 링크입니다</p>
              <p className="text-[13px]">링크가 만료됐거나 이미 사용된 링크일 수 있습니다.<br/>비밀번호 찾기를 다시 시도해주세요.</p>
              <Link href="/forgot-password" className="inline-block mt-3 bg-accent hover:bg-accent-hover text-white font-bold text-[13px] px-4 py-2 rounded-lg">비밀번호 찾기</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-surface text-sm font-semibold mb-1.5 block">새 비밀번호</label>
                <input type="password" name="new-password" autoComplete="new-password" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className={inputClass} placeholder="6자 이상" />
              </div>
              <div>
                <label className="text-surface text-sm font-semibold mb-1.5 block">새 비밀번호 확인</label>
                <input type="password" name="new-password-confirm" autoComplete="new-password" value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)} required
                  className={inputClass} placeholder="비밀번호 재입력" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-[15px]">
                {loading ? "변경 중..." : "비밀번호 변경"}
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
