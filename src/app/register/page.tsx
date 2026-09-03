"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const USER_TYPES = [
  { value: "딜러", label: "딜러", desc: "구직 활동 및 상태 관리", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { value: "업주", label: "업주", desc: "매장 운영 및 구인 관리", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { value: "일반", label: "일반회원", desc: "대회·매장 정보 이용", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      </div>
    }>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const initialReferral = searchParams.get("ref") || "";
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [referralCode, setReferralCode] = useState(initialReferral);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedUsername = username.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(trimmedUsername)) {
      setError("아이디는 영문으로 시작하는 4~20자(영문·숫자·_)여야 합니다.");
      return;
    }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2) { setError("닉네임은 2자 이상이어야 합니다."); return; }
    if (/^\d{10,11}$/.test(trimmedNickname)) { setError("닉네임에 전화번호를 입력할 수 없습니다."); return; }

    const cleanPhoneEarly = phone.replace(/-/g, "").trim();
    if (!cleanPhoneEarly) { setError("전화번호는 필수입니다."); return; }
    if (!/^01[0-9]{8,9}$/.test(cleanPhoneEarly)) { setError("올바른 전화번호를 입력하세요."); return; }
    if (trimmedNickname === cleanPhoneEarly) { setError("닉네임은 전화번호와 다르게 설정해주세요."); return; }
    // 이메일이 있으면 로그인 계정으로 사용, 없으면 전화번호 기반 자동 이메일 생성
    const loginEmail = email.trim() ? email.trim() : `${cleanPhoneEarly}@phone.holdemmap.kr`;

    setLoading(true);
    const { error } = await signUp(loginEmail, password, trimmedNickname, userType, referralCode, trimmedUsername, cleanPhoneEarly);
    if (error) {
      setError(error.includes("already registered") ? "이미 등록된 계정입니다." : error);
      setLoading(false);
    } else {
      // 전화번호는 signUp에서 함께 저장됨 (별도 getUser/update 왕복 제거)
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
            <img src="/logo.png" alt="홀덤맵KOREA" className="h-12 w-auto mx-auto mb-3" />
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
                )}

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">아이디 <span className="text-red-500">*</span></label>
                  <input type="text" name="username" autoComplete="username" inputMode="text" value={username}
                    onChange={e => setUsername(e.target.value)} required
                    className={inputClass} placeholder="로그인에 사용할 아이디 (영문 시작 4~20자)" />
                  <p className="text-muted text-[11px] mt-1">로그인 시 이 아이디와 비밀번호를 사용합니다. (영문·숫자·_ 사용)</p>
                </div>

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">닉네임</label>
                  <input type="text" name="nickname" autoComplete="nickname" inputMode="text" value={nickname}
                    onChange={e => setNickname(e.target.value)} required
                    className={inputClass} placeholder={userType === "업주" ? "업체명 또는 닉네임" : "사용할 닉네임 (2자 이상)"} />
                </div>

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">전화번호 <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" autoComplete="tel" value={phone}
                    onChange={e => setPhone(e.target.value)} required
                    className={inputClass} placeholder="01012345678" />
                  <p className="text-muted text-[11px] mt-1">인증 없이 번호만 입력하시면 됩니다. 계정 찾기에도 사용됩니다.</p>
                </div>

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">이메일 <span className="text-muted font-normal">(선택)</span></label>
                  <input type="email" name="email" autoComplete="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClass} placeholder="example@email.com" />
                  <p className="text-muted text-[11px] mt-1">이메일로도 로그인 및 비밀번호 재설정 링크를 받고 싶다면 입력해주세요.</p>
                </div>

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">비밀번호</label>
                  <input type="password" name="new-password" autoComplete="new-password" value={password}
                    onChange={e => setPassword(e.target.value)} required
                    className={inputClass} placeholder="6자 이상" />
                </div>

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">비밀번호 확인</label>
                  <input type="password" name="new-password-confirm" autoComplete="new-password" value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)} required
                    className={inputClass} placeholder="비밀번호 재입력" />
                </div>

                <div>
                  <label className="text-surface text-sm font-semibold mb-1.5 block">추천인 코드 <span className="text-muted font-normal">(선택)</span></label>
                  <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)}
                    className={inputClass} placeholder="친구의 초대 코드 8자리" />
                  {initialReferral && <p className="text-accent text-[12px] mt-1.5">친구 초대 링크로 가입 중입니다 — 친구에게 무료 토너권 1장이 추가 지급됩니다</p>}
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
