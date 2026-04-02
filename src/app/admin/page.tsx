"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { Store } from "@/types";
import * as api from "@/lib/api";
import { geocodeAddress } from "@/lib/geocode";
import Select from "@/components/Select";
import ImageUpload from "@/components/ImageUpload";

import { supabase } from "@/lib/supabase";

type Tab = "stores" | "events" | "notices" | "banners" | "shorts" | "users";
const ADMIN_PASSWORD = "1234";
const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

interface Profile {
  id: string;
  email: string;
  nickname: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("stores");
  const [modal, setModal] = useState<{ type: "create" | "edit"; tab: Tab; data?: Record<string, unknown> } | null>(null);
  const [saving, setSaving] = useState(false);
  const { stores, refresh: refreshStores } = useStores();
  const { events, refresh: refreshEvents } = useEvents();
  const { notices, refresh: refreshNotices } = useNotices();
  const [banners, setBanners] = useState<import("@/types").Banner[]>([]);
  const [bannerSaving, setBannerSaving] = useState<string | null>(null);
  const [shorts, setShorts] = useState<import("@/types").Short[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => { api.getBanners().then(setBanners); api.getAllShorts().then(setShorts); refreshUsers(); }, []);

  const refreshUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const handleBlockUser = async (userId: string, blocked: boolean) => {
    await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", userId);
    refreshUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("이 회원을 삭제하시겠습니까? 작성한 글도 모두 삭제됩니다.")) return;
    await supabase.from("profiles").delete().eq("id", userId);
    refreshUsers();
  };

  const refreshBanners = () => api.getBanners().then(setBanners);

  const handleBannerSave = async (id: string, image: string, link: string) => {
    setBannerSaving(id);
    try { await api.updateBanner(id, { image, link }); await refreshBanners(); } catch { alert("저장 실패"); }
    setBannerSaving(null);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "stores", label: "매장", count: stores.length },
    { key: "events", label: "이벤트", count: events.length },
    { key: "notices", label: "공지", count: notices.length },
    { key: "banners", label: "배너 광고", count: banners.filter(b => b.image).length },
    { key: "shorts", label: "숏츠", count: shorts.length },
    { key: "users", label: "회원", count: users.length },
  ];

  const refreshShorts = () => api.getAllShorts().then(setShorts);

  const handleShortDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await api.deleteShort(id); refreshShorts();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleDelete = async (tab: Tab, id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      if (tab === "stores") { await api.deleteStore(id); refreshStores(); }
      else if (tab === "events") { await api.deleteEvent(id); refreshEvents(); }
      else { await api.deleteNotice(id); refreshNotices(); }
    } catch { alert("삭제 실패"); }
  };

  const handleSave = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (modal?.tab === "stores") {
        const address = formData.address as string;
        let lat = parseFloat(formData.lat as string) || 0;
        let lng = parseFloat(formData.lng as string) || 0;
        if (!lat || !lng) {
          const coords = await geocodeAddress(address);
          if (coords) { lat = coords.lat; lng = coords.lng; }
          else { alert("주소로 좌표를 찾을 수 없습니다. 주소를 확인해주세요."); setSaving(false); return; }
        }
        const payload = {
          name: formData.name as string,
          address,
          phone: (formData.phone as string) || "",
          hours: (formData.hours as string) || "",
          description: (formData.description as string) || "",
          images: [] as string[],
          lat, lng,
          region: formData.region as string,
          tags: (formData.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean),
          is_recommended: formData.is_recommended === "true",
        };
        if (modal.type === "create") await api.createStore(payload);
        else await api.updateStore(formData.id as string, payload);
        refreshStores();
      } else if (modal?.tab === "events") {
        const payload = {
          store_id: formData.store_id as string,
          store_name: stores.find(s => s.id === formData.store_id)?.name || "",
          title: formData.title as string,
          date: formData.date as string,
          time: formData.time as string,
          description: (formData.description as string) || "",
          prize: (formData.prize as string) || undefined,
          image: (formData.image as string) || "",
          details: (formData.details as string) || "",
          buy_in: (formData.buy_in as string) || "",
          location: (formData.location as string) || "",
        };
        if (modal.type === "create") await api.createEvent(payload);
        else await api.updateEvent(formData.id as string, payload);
        refreshEvents();
      } else if (modal?.tab === "notices") {
        const payload = {
          title: formData.title as string,
          content: formData.content as string,
          date: formData.date as string || new Date().toISOString().slice(0, 10),
        };
        if (modal.type === "create") await api.createNotice(payload);
        else await api.updateNotice(formData.id as string, payload);
        refreshNotices();
      }
      setModal(null);
    } catch {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  // ─── Login Screen ───
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 gold-shine rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-accent/25">
              <svg className="w-8 h-8 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-surface mb-2">관리자 로그인</h1>
            <p className="text-muted text-base">홀덤맵 관리자 페이지에 접속합니다</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 border border-border-custom">
            <label className="text-sub text-sm font-medium block mb-2">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              placeholder="비밀번호를 입력하세요"
              className={`${inputClass} ${pwError ? "border-red/50" : ""}`}
              autoFocus
            />
            {pwError && <p className="text-red text-sm mt-3">비밀번호가 올바르지 않습니다.</p>}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-accent/25 mt-6 transition-all"
            >
              로그인
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/" className="text-muted hover:text-accent text-sm transition-colors">← 홈으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ───
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="8" fill="#03C75A" /><path d="M10 10h4v6.5l8-6.5h4v16h-4v-6.5l-8 6.5h-4V10z" fill="#DC2626" /></svg>
              <span className="text-lg font-black text-surface">홀덤맵코리아</span>
            </div>
            <span className="text-xs text-muted bg-gray-100 px-2.5 py-1 rounded-lg font-semibold">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted hover:text-accent text-sm transition-colors">사이트 보기</Link>
            <button onClick={() => setAuthed(false)} className="text-muted hover:text-red text-sm transition-colors">로그아웃</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`p-5 rounded-2xl border text-left transition-all ${
                activeTab === tab.key
                  ? "bg-accent/10 border-accent/20"
                  : "bg-white border-border-custom hover:border-accent/20"
              }`}
            >
              <p className={`text-3xl font-bold ${activeTab === tab.key ? "text-accent" : "text-surface"}`}>{tab.count}</p>
              <p className="text-muted/50 text-sm mt-1">{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-surface">{tabs.find(t => t.key === activeTab)?.label} 관리</h2>
          <button
            onClick={() => setModal({ type: "create", tab: activeTab })}
            className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            새로 등록
          </button>
        </div>

        {/* Store Table */}
        {activeTab === "stores" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">매장명</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">주소</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">지역</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">영업시간</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">추천</th>
                    <th className="text-right text-muted text-sm font-medium px-5 py-4">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b border-border-custom/50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3"><p className="text-surface text-base font-semibold">{store.name}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted text-sm truncate max-w-48">{store.address}</p></td>
                      <td className="px-5 py-3"><span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded">{store.region}</span></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/50 text-sm">{store.hours}</p></td>
                      <td className="px-5 py-3">{store.is_recommended ? <span className="text-gold">★</span> : <span className="text-muted/20">-</span>}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => setModal({ type: "edit", tab: "stores", data: { ...store, tags: store.tags.join(", "), is_recommended: store.is_recommended ? "true" : "false" } })} className="text-muted hover:text-accent text-sm transition-colors">수정</button>
                          <button onClick={() => handleDelete("stores", store.id)} className="text-muted hover:text-red text-sm transition-colors">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event Table */}
        {activeTab === "events" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">제목</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4">매장</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">날짜</th>
                    <th className="text-left text-muted text-sm font-medium px-5 py-4 hidden md:table-cell">상금</th>
                    <th className="text-right text-muted text-sm font-medium px-5 py-4">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border-custom/50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3"><p className="text-surface text-base font-semibold">{event.title}</p></td>
                      <td className="px-5 py-3"><p className="text-muted/50 text-sm">{event.store_name}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/50 text-sm">{event.date} {event.time}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><span className="text-gold text-sm font-medium">{event.prize || "-"}</span></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => setModal({ type: "edit", tab: "events", data: event as unknown as Record<string, unknown> })} className="text-muted hover:text-accent text-sm transition-colors">수정</button>
                          <button onClick={() => handleDelete("events", event.id)} className="text-muted hover:text-red text-sm transition-colors">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notice List */}
        {activeTab === "notices" && (
          <div className="space-y-2">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl p-5 border border-border-custom flex items-start justify-between">
                <div>
                  <h3 className="text-surface font-semibold text-base">{notice.title}</h3>
                  <p className="text-muted text-sm mt-1.5">{notice.content}</p>
                  <p className="text-muted text-xs mt-2">{notice.date}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button onClick={() => setModal({ type: "edit", tab: "notices", data: notice as unknown as Record<string, unknown> })} className="text-muted hover:text-accent text-sm transition-colors">수정</button>
                  <button onClick={() => handleDelete("notices", notice.id)} className="text-muted hover:text-red text-sm transition-colors">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Management */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            {/* Main Banner */}
            {banners.filter(b => b.position === "main").map(banner => (
              <BannerEditor key={banner.id} banner={banner} label="메인 배너" size="1400 x 120px (권장)" saving={bannerSaving === banner.id} onSave={handleBannerSave} />
            ))}

            <h3 className="text-surface font-bold text-lg pt-4">사이드 배너</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.filter(b => b.position.startsWith("side")).map((banner, i) => (
                <BannerEditor key={banner.id} banner={banner} label={`사이드 배너 ${i + 1}`} size="300 x 96px (권장)" saving={bannerSaving === banner.id} onSave={handleBannerSave} />
              ))}
            </div>
          </div>
        )}

        {/* Shorts Management */}
        {activeTab === "shorts" && (
          <div className="space-y-4">
            <ShortsEditor onSave={async (data) => { await api.createShort(data); refreshShorts(); }} />
            <h3 className="text-surface font-bold text-lg pt-2">등록된 숏츠 ({shorts.length}개)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shorts.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-border-custom overflow-hidden">
                  <div className="aspect-[9/16] max-h-64 bg-bg">
                    <video src={s.video_url} className="w-full h-full object-cover" muted />
                  </div>
                  <div className="p-4">
                    <h4 className="text-surface font-bold text-sm truncate">{s.title}</h4>
                    {s.description && <p className="text-muted text-xs mt-1 truncate">{s.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.active ? "bg-accent-light text-accent" : "bg-bg text-muted"}`}>
                        {s.active ? "활성" : "비활성"}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={async () => { await api.updateShort(s.id, { active: !s.active }); refreshShorts(); }} className="text-muted hover:text-accent text-xs">{s.active ? "비활성화" : "활성화"}</button>
                        <button onClick={() => handleShortDelete(s.id)} className="text-muted hover:text-red text-xs">삭제</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users management */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-border-custom overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#f9f9f9] border-b border-border-custom text-[12px] text-muted font-semibold">
              <div className="col-span-3">닉네임</div>
              <div className="col-span-4">이메일</div>
              <div className="col-span-2">가입일</div>
              <div className="col-span-1">상태</div>
              <div className="col-span-2 text-right">관리</div>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">등록된 회원이 없습니다</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border-custom last:border-b-0 items-center">
                  <div className="md:col-span-3">
                    <p className="text-surface text-[14px] font-bold">{u.nickname}</p>
                    <p className="md:hidden text-muted text-[12px]">{u.email}</p>
                  </div>
                  <div className="hidden md:block md:col-span-4 text-sub text-[13px]">{u.email}</div>
                  <div className="hidden md:block md:col-span-2 text-muted text-[13px]">{u.created_at?.slice(0, 10)}</div>
                  <div className="md:col-span-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${u.is_blocked ? "bg-red-50 text-red-500" : "bg-accent-light text-accent"}`}>
                      {u.is_blocked ? "차단" : "정상"}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex gap-2 justify-end">
                    <button onClick={() => handleBlockUser(u.id, !u.is_blocked)}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all ${u.is_blocked ? "bg-accent-light text-accent hover:bg-accent/20" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                      {u.is_blocked ? "차단 해제" : "차단"}
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)}
                      className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#f5f6f8] text-muted hover:bg-red-50 hover:text-red-500 transition-all">
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <AdminModal modal={modal} stores={stores} saving={saving} onClose={() => setModal(null)} onSave={handleSave} />
        )}
      </main>
    </div>
  );
}

// ─── Modal Component ───
function AdminModal({ modal, stores, saving, onClose, onSave }: {
  modal: { type: "create" | "edit"; tab: Tab; data?: Record<string, unknown> };
  stores: Store[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(modal.data || {});
  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-8 border border-border-custom w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-surface font-bold text-2xl">{modal.type === "create" ? "새로 등록" : "수정"}</h2>
          <button onClick={onClose} className="text-muted hover:text-accent transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {modal.tab === "stores" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매장명 *</label>
              <input className={inputClass} value={(form.name as string) || ""} onChange={e => set("name", e.target.value)} placeholder="예: 로얄홀덤펍 강남점" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">주소 (도로명) *</label>
              <input className={inputClass} value={(form.address as string) || ""} onChange={e => set("address", e.target.value)} placeholder="예: 서울 강남구 테헤란로 123" />
              <p className="text-muted text-xs mt-2">도로명 주소를 입력하면 지도 좌표가 자동으로 변환됩니다</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">연락처</label>
                <input className={inputClass} value={(form.phone as string) || ""} onChange={e => set("phone", e.target.value)} placeholder="02-0000-0000" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">영업시간</label>
                <input className={inputClass} value={(form.hours as string) || ""} onChange={e => set("hours", e.target.value)} placeholder="14:00 ~ 04:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">지역 *</label>
                <Select value={(form.region as string) || "서울"} onChange={v => set("region", v)} options={[
                  { value: "서울", label: "서울" }, { value: "경기", label: "경기" }, { value: "인천", label: "인천" },
                ]} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">추천 매장</label>
                <Select value={(form.is_recommended as string) || "false"} onChange={v => set("is_recommended", v)} options={[
                  { value: "false", label: "아니오" }, { value: "true", label: "예" },
                ]} />
              </div>
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">태그 (쉼표로 구분)</label>
              <input className={inputClass} value={(form.tags as string) || ""} onChange={e => set("tags", e.target.value)} placeholder="토너먼트, 초보환영, 주차가능" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매장 소개</label>
              <textarea className={inputClass + " resize-none"} rows={4} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="매장에 대한 소개를 입력하세요" />
            </div>
          </div>
        )}

        {modal.tab === "events" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">이벤트 제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="예: 주말 GTD 토너먼트" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">매장 선택 *</label>
              <Select value={(form.store_id as string) || ""} onChange={v => set("store_id", v)} placeholder="매장을 선택하세요" options={stores.map(s => ({ value: s.id, label: s.name }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">날짜 *</label>
                <input className={inputClass} type="date" value={(form.date as string) || ""} onChange={e => set("date", e.target.value)} />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">시간 *</label>
                <input className={inputClass} type="time" value={(form.time as string) || ""} onChange={e => set("time", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sub text-sm font-medium block mb-2">상금</label>
                <input className={inputClass} value={(form.prize as string) || ""} onChange={e => set("prize", e.target.value)} placeholder="예: GTD 300만원" />
              </div>
              <div>
                <label className="text-sub text-sm font-medium block mb-2">바이인</label>
                <input className={inputClass} value={(form.buy_in as string) || ""} onChange={e => set("buy_in", e.target.value)} placeholder="예: 50,000원" />
              </div>
            </div>
            <ImageUpload value={(form.image as string) || ""} onChange={v => set("image", v)} folder="events" label="대회 이미지" hint="선택" />
            <div>
              <label className="text-sub text-sm font-medium block mb-2">장소</label>
              <input className={inputClass} value={(form.location as string) || ""} onChange={e => set("location", e.target.value)} placeholder="대회 장소 (매장과 다를 경우)" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">간단 설명</label>
              <textarea className={inputClass + " resize-none"} rows={3} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="대회 간략 소개" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">상세 정보</label>
              <textarea className={inputClass + " resize-none"} rows={5} value={(form.details as string) || ""} onChange={e => set("details", e.target.value)} placeholder="룰, 시간표, 참가 방법 등 상세 내용" />
            </div>
          </div>
        )}

        {modal.tab === "notices" && (
          <div className="space-y-5">
            <div>
              <label className="text-sub text-sm font-medium block mb-2">제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="공지사항 제목을 입력하세요" />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">날짜</label>
              <input className={inputClass} type="date" value={(form.date as string) || new Date().toISOString().slice(0, 10)} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-sub text-sm font-medium block mb-2">내용 *</label>
              <textarea className={inputClass + " resize-none"} rows={6} value={(form.content as string) || ""} onChange={e => set("content", e.target.value)} placeholder="공지사항 내용을 입력하세요" />
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 bg-gray-100 border border-border-custom text-muted hover:text-accent px-4 py-3 rounded-xl text-base font-medium transition-colors">취소</button>
          <button onClick={() => onSave(form)} disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg shadow-accent/20 disabled:opacity-50 transition-all">
            {saving ? "저장 중..." : modal.type === "create" ? "등록하기" : "수정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Banner Editor ───
function BannerEditor({ banner, label, size, saving, onSave }: {
  banner: import("@/types").Banner;
  label: string;
  size: string;
  saving: boolean;
  onSave: (id: string, image: string, link: string) => void;
}) {
  const [image, setImage] = useState(banner.image || "");
  const [link, setLink] = useState(banner.link || "");
  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  return (
    <div className="bg-white rounded-2xl border border-border-custom p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-surface font-bold text-base">{label}</h4>
          <p className="text-muted text-sm mt-0.5">권장 사이즈: <span className="text-accent font-semibold">{size}</span></p>
        </div>
        <button onClick={() => onSave(banner.id, image, link)} disabled={saving}
          className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2 rounded-lg transition-all disabled:opacity-50">
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      <div className="space-y-4">
        <ImageUpload value={image} onChange={setImage} folder="banners" label="배너 이미지" aspect="aspect-[4/1]" hint={size} />

        <div>
          <label className="text-sub text-sm font-medium block mb-2">클릭 시 이동 URL <span className="text-muted font-normal">(선택)</span></label>
          <input className={inputClass} value={link} onChange={e => setLink(e.target.value)} placeholder="https://example.com" />
        </div>
      </div>
    </div>
  );
}

// ─── Shorts Editor ───
function ShortsEditor({ onSave }: { onSave: (data: Omit<import("@/types").Short, "id" | "created_at">) => Promise<void> }) {
  const [form, setForm] = useState({ title: "", video_url: "", thumbnail: "", description: "", sort_order: 0, active: true });
  const [saving, setSaving] = useState(false);
  const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

  const handleSubmit = async () => {
    if (!form.title || !form.video_url) { alert("제목과 영상 URL을 입력해주세요."); return; }
    setSaving(true);
    await onSave(form);
    setForm({ title: "", video_url: "", thumbnail: "", description: "", sort_order: 0, active: true });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-border-custom p-6">
      <h3 className="text-surface font-bold text-lg mb-4">새 숏츠 등록</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sub text-sm font-medium block mb-2">제목 *</label>
          <input className={inputClass} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="숏츠 제목" />
        </div>
        <div>
          <label className="text-sub text-sm font-medium block mb-2">정렬 순서</label>
          <input className={inputClass} type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} placeholder="0" />
        </div>
      </div>
      <div className="space-y-4 mb-4">
        <ImageUpload value={form.video_url} onChange={v => setForm(p => ({ ...p, video_url: v }))} folder="shorts" label="영상 파일 *" aspect="aspect-9/16 max-w-[180px]" hint="MP4, 9:16 비율" />
        <ImageUpload value={form.thumbnail} onChange={v => setForm(p => ({ ...p, thumbnail: v }))} folder="shorts-thumb" label="썸네일" aspect="aspect-9/16 max-w-[180px]" hint="선택, 9:16 비율" />
        <div>
          <label className="text-sub text-sm font-medium block mb-2">설명 <span className="text-muted font-normal">(선택)</span></label>
          <input className={inputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="영상 설명" />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50">
        {saving ? "등록 중..." : "숏츠 등록"}
      </button>
    </div>
  );
}
