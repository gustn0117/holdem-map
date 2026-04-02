"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const USER_TYPES = [
  { value: "딜러", label: "딜러", desc: "구직 활동 및 상태 관리", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { value: "업주", label: "업주", desc: "매장 운영 및 구인 관리", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { value: "일반", label: "일반회원", desc: "대회·매장 정보 이용", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
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

    const loginEmail = method === "phone" ? `${phone.replace(/-/g, "")}@phone.holdemmap.kr` : email;
    if (method === "phone" && !/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ""))) { setError("올바른 전화번호를 입력하세요."); return; }
    if (method === "email" && !email) { setError("이메일을 입력하세요."); return; }

    setLoading(true);
    const { error } = await signUp(loginEmail, password, nickname, userType);
    if (error) {
      setError(error.includes("already registered") ? "이미 등록된 계정입니다." : error);
      setLoading(false);
    } else {
      if (method === "phone") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from("profiles").update({ phone: phone.replace(/-/g, "") }).eq("id", user.id);
      }
      router.push("/mypage");
    }
  };

  const inputClass = "w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent transition-colors bg-white";

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="text-center mb-6">
            <svg className="w-12 h-12 mx-auto mb-3" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#03C75A" />
              <path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="#DC2626" />
            </svg>
            <h1 className="text-2xl font-black text-surface">회원가입</h1>
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`w-8 h-1 rounded-full ${step >= 1 ? "bg-accent" : "bg-border-custom"}`} />
              <div className={`w-8 h-1 rounded-full ${step >= 2 ? "bg-accent" : "bg-border-custom"}`} />
            </div>
          </div>

          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div>
              <p className="text-center text-sub text-[15px] mb-6">회원 유형을 선택하세요</p>
              <div className="space-y-3">
                {USER_TYPES.map(t => (
                  <button key={t.value} onClick={() => { setUserType(t.value); setStep(2); }}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border-custom bg-white hover:border-accent hover:bg-accent/5 transition-all text-left group">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-surface text-[16px] font-bold">{t.label}</p>
                      <p className="text-muted text-[13px]">{t.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-[#ddd] group-hover:text-accent shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-center text-muted text-sm mt-6">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-accent font-semibold hover:underline">로그인</Link>
              </p>
            </div>
          )}

          {/* Step 2: Info */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-muted hover:text-accent text-sm font-medium mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                유형 다시 선택
              </button>

              <div className="flex items-center gap-2 mb-6">
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  userType === "딜러" ? "bg-emerald-100 text-emerald-700" :
                  userType === "업주" ? "bg-blue-100 text-blue-600" :
                  "bg-gray-100 text-gray-600"
                }`}>{userType}</span>
                <span className="text-sub text-[14px]">으로 가입합니다</span>
              </div>

              {/* Method toggle */}
              <div className="flex bg-[#f5f6f8] rounded-xl p-1 mb-5">
                <button type="button" onClick={() => setMethod("email")}
                  className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${method === "email" ? "bg-white text-surface shadow-sm" : "text-muted"}`}>
                  이메일
                </button>
                <button type="button" onClick={() => setMethod("phone")}
                  className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${method === "phone" ? "bg-white text-surface shadow-sm" : "text-muted"}`}>
                  전화번호
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
                )}

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">닉네임</label>
                  <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} required
                    className={inputClass} placeholder={userType === "업주" ? "업체명 또는 닉네임" : "사용할 닉네임 (2자 이상)"} />
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
          )}
        </div>
      </main>
    </div>
  );
}
