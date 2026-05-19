"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";

const AVATAR_ROLES = [
  { key: "dealer", label: "딜러", gradient: "from-emerald-50 to-teal-100" },
  { key: "server", label: "서빙", gradient: "from-amber-50 to-orange-100" },
  { key: "manager", label: "매니저", gradient: "from-indigo-50 to-blue-100" },
  { key: "floor", label: "플로어", gradient: "from-rose-50 to-pink-100" },
] as const;

const AVATAR_GENDERS = [
  { key: "male", label: "남자" },
  { key: "female", label: "여자" },
] as const;

const POSTER_CATEGORIES = [
  { key: "daily", label: "데일리 매장", gradient: "from-blue-50 to-cyan-100" },
  { key: "tournament", label: "대회 매장", gradient: "from-amber-50 to-orange-100" },
  { key: "rake", label: "레이크 매장", gradient: "from-emerald-50 to-teal-100" },
] as const;

type RoleKey = (typeof AVATAR_ROLES)[number]["key"];
type GenderKey = (typeof AVATAR_GENDERS)[number]["key"];
type PosterKey = (typeof POSTER_CATEGORIES)[number]["key"];
type Mode = "avatar" | "poster";

const ROLE_TO_KEY: Record<string, RoleKey> = {
  "딜러": "dealer", "서빙": "server", "매니저": "manager", "플로어": "floor",
};
const GENDER_TO_KEY: Record<string, GenderKey> = { "남": "male", "여": "female" };

export default function JobAvatarPicker({ value, onChange, role, gender, restrict }: {
  value: string;
  onChange: (v: string) => void;
  role?: string;
  gender?: string;
  /** 'avatar' = 인물 아바타만(구직글), 'poster' = 매장 포스터만(구인글), 기본 = 둘 다 */
  restrict?: "avatar" | "poster";
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(restrict || "avatar");
  const [pickerGender, setPickerGender] = useState<GenderKey>(gender ? GENDER_TO_KEY[gender] || "male" : "male");
  const [pickerRole, setPickerRole] = useState<RoleKey>(role ? ROLE_TO_KEY[role] || "dealer" : "dealer");
  const [pickerPoster, setPickerPoster] = useState<PosterKey>("daily");

  // restrict 변경 시 mode 강제 동기화 (구인 ↔ 구직 토글에 따라 즉시 반영)
  if (restrict && mode !== restrict) setMode(restrict);

  const openPicker = () => {
    if (gender) setPickerGender(GENDER_TO_KEY[gender] || "male");
    if (role) setPickerRole(ROLE_TO_KEY[role] || "dealer");
    setOpen(true);
  };

  return (
    <div>
      <label className="text-sub text-sm font-medium block mb-2">사진 / 프로필 아바타 <span className="text-muted font-normal">(선택)</span></label>
      {value ? (
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-[#f5f6f8] to-[#eceef2] border border-border-custom overflow-hidden flex items-center justify-center">
              <img src={value} alt="" className="w-full h-full object-contain" />
            </div>
            <button type="button" onClick={() => onChange("")}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={openPicker}
              className="text-[13px] font-semibold text-accent hover:text-accent-hover px-3 py-2 border border-accent/30 rounded-lg hover:bg-accent/5 transition-all">
              다른 아바타 선택
            </button>
            <ImageUpload value="" onChange={v => v && onChange(v)} folder="jobs" label="사진 업로드" aspect="aspect-square max-w-[100px]" hint="내 사진" />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <div className="w-32">
            <button type="button" onClick={openPicker}
              className="group w-32 h-32 rounded-2xl border-2 border-dashed border-accent/40 bg-linear-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/15 hover:border-accent/60 text-accent font-bold flex flex-col items-center justify-center gap-2 transition-all">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <span className="text-[13px]">아바타 선택</span>
              <span className="text-[10px] text-accent/60 font-normal">캐릭터 32종</span>
            </button>
          </div>
          <div className="w-32">
            <ImageUpload value={value} onChange={onChange} folder="jobs" label="사진 업로드" aspect="w-32 h-32" hint="내 사진" />
          </div>
        </div>
      )}

      {open && (() => {
        const currentRole = AVATAR_ROLES.find(r => r.key === pickerRole)!;
        const currentPoster = POSTER_CATEGORIES.find(p => p.key === pickerPoster)!;
        return (
          <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white w-full md:max-w-3xl max-h-[92vh] md:max-h-[85vh] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="md:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 rounded-full bg-border-custom" />
              </div>
              <div className="px-5 pt-3 md:pt-5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-surface text-xl font-black leading-tight">{mode === "avatar" ? "아바타 선택" : "매장 포스터 선택"}</h3>
                  <p className="text-muted text-[12px] mt-0.5">
                    {mode === "avatar" ? "성별·직종을 고른 뒤 마음에 드는 캐릭터를 터치하세요" : "매장 유형별 포스터 이미지를 선택하세요"}
                  </p>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full bg-bg hover:bg-[#eceef2] text-sub flex items-center justify-center transition-colors shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {/* Mode toggle (restrict 지정 시 숨김) */}
              {!restrict && (
                <div className="px-5 pb-3">
                  <div className="flex bg-bg rounded-xl p-1">
                    <button type="button" onClick={() => setMode("avatar")}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all inline-flex items-center justify-center gap-1.5 ${mode === "avatar" ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      인물 아바타 (32종)
                    </button>
                    <button type="button" onClick={() => setMode("poster")}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all inline-flex items-center justify-center gap-1.5 ${mode === "poster" ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      매장 포스터 (9종)
                    </button>
                  </div>
                </div>
              )}
              {mode === "avatar" ? (
                <>
                  <div className="px-5 pb-3">
                    <div className="flex bg-bg rounded-xl p-1">
                      {AVATAR_GENDERS.map(g => (
                        <button key={g.key} type="button" onClick={() => setPickerGender(g.key)}
                          className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${pickerGender === g.key ? "bg-white text-accent shadow-sm" : "text-muted"}`}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 pb-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    {AVATAR_ROLES.map(r => (
                      <button key={r.key} type="button" onClick={() => setPickerRole(r.key)}
                        className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-bold transition-all border ${pickerRole === r.key ? "bg-accent text-white border-accent shadow-md shadow-accent/20" : "bg-white text-sub border-border-custom hover:border-accent/40"}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 pb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(i => {
                        const url = `/avatars/${pickerGender}-${pickerRole}/${i}.png?v=2`;
                        const isSelected = value === url;
                        return (
                          <button key={i} type="button" onClick={() => { onChange(url); setOpen(false); }}
                            className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? "border-accent ring-4 ring-accent/20 scale-[1.02]" : "border-transparent hover:border-accent/40"}`}>
                            <div className={`absolute inset-0 bg-linear-to-br ${currentRole.gradient}`} />
                            <img src={url} alt={`${currentRole.label} 아바타 ${i}`}
                              className="relative w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur text-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {currentRole.label} {i}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-center text-muted text-[12px] mt-6 mb-2">
                      마음에 드는 아바타가 없으면 <span className="text-accent font-semibold">내 사진 업로드</span>도 이용하세요
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-5 pb-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    {POSTER_CATEGORIES.map(p => (
                      <button key={p.key} type="button" onClick={() => setPickerPoster(p.key)}
                        className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-bold transition-all border ${pickerPoster === p.key ? "bg-accent text-white border-accent shadow-md shadow-accent/20" : "bg-white text-sub border-border-custom hover:border-accent/40"}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[1, 2, 3].map(i => {
                        const url = `/posters/${pickerPoster}/${i}.png`;
                        const isSelected = value === url;
                        return (
                          <button key={i} type="button" onClick={() => { onChange(url); setOpen(false); }}
                            className={`group relative aspect-4/3 rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? "border-accent ring-4 ring-accent/20 scale-[1.02]" : "border-transparent hover:border-accent/40"}`}>
                            <div className={`absolute inset-0 bg-linear-to-br ${currentPoster.gradient}`} />
                            <img src={url} alt={`${currentPoster.label} 포스터 ${i}`}
                              className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur text-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {currentPoster.label} {i}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
