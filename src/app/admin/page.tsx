"use client";

import { useState } from "react";
import Link from "next/link";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { Store } from "@/types";
import * as api from "@/lib/api";
import { geocodeAddress } from "@/lib/geocode";
import Select from "@/components/Select";

type Tab = "stores" | "events" | "notices";
const ADMIN_PASSWORD = "1234";
const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "stores", label: "매장", count: stores.length },
    { key: "events", label: "이벤트", count: events.length },
    { key: "notices", label: "공지", count: notices.length },
  ];

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
            <span className="text-xl font-extrabold gold-text-shine">홀덤맵</span>
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
        <div className="grid grid-cols-3 gap-4 mb-8">
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
            <div>
              <label className="text-sub text-sm font-medium block mb-2">대회 이미지 URL</label>
              <input className={inputClass} value={(form.image as string) || ""} onChange={e => set("image", e.target.value)} placeholder="이미지 URL을 입력하세요 (선택)" />
              {(form.image as string) && (
                <div className="mt-3 rounded-xl overflow-hidden border border-border-custom h-32">
                  <img src={form.image as string} alt="미리보기" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
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
