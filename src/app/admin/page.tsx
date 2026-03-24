"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStores, useEvents, useNotices } from "@/hooks/useData";
import { Store, Event, Notice } from "@/types";
import * as api from "@/lib/api";

type Tab = "stores" | "events" | "notices";

const inputClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent/40 transition-colors placeholder:text-muted/30";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("stores");
  const [modal, setModal] = useState<{ type: "create" | "edit"; tab: Tab; data?: Record<string, unknown> } | null>(null);
  const [saving, setSaving] = useState(false);
  const { stores, refresh: refreshStores } = useStores();
  const { events, refresh: refreshEvents } = useEvents();
  const { notices, refresh: refreshNotices } = useNotices();

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "stores", label: "매장 관리", count: stores.length },
    { key: "events", label: "이벤트 관리", count: events.length },
    { key: "notices", label: "공지사항", count: notices.length },
  ];

  const handleDelete = async (tab: Tab, id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      if (tab === "stores") { await api.deleteStore(id); refreshStores(); }
      else if (tab === "events") { await api.deleteEvent(id); refreshEvents(); }
      else { await api.deleteNotice(id); refreshNotices(); }
    } catch (e) { alert("삭제 실패"); }
  };

  const handleSave = async (formData: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (modal?.tab === "stores") {
        const payload = {
          name: formData.name as string,
          address: formData.address as string,
          phone: (formData.phone as string) || "",
          hours: (formData.hours as string) || "",
          description: (formData.description as string) || "",
          images: [] as string[],
          lat: parseFloat(formData.lat as string) || 37.5,
          lng: parseFloat(formData.lng as string) || 127.0,
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
    } catch (e) {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-accent/50 text-[11px] font-semibold uppercase tracking-[0.2em] mb-1">ADMIN</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">관리자 페이지</h1>
          </div>
          <button
            onClick={() => setModal({ type: "create", tab: activeTab })}
            className="bg-linear-to-r from-accent to-accent-light text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            새로 등록
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 border border-white/[0.04]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted/50 hover:text-surface"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-white/60" : "text-muted/30"}`}>({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Store Table */}
        {activeTab === "stores" && (
          <div className="bg-card rounded-2xl border border-white/[0.04] overflow-hidden glow-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3">매장명</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3 hidden md:table-cell">주소</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3">지역</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3 hidden md:table-cell">영업시간</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3">추천</th>
                    <th className="text-right text-muted/40 text-xs font-medium px-5 py-3">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3"><p className="text-surface text-sm font-medium">{store.name}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/50 text-sm truncate max-w-48">{store.address}</p></td>
                      <td className="px-5 py-3"><span className="bg-accent/10 text-accent-light text-xs px-2 py-0.5 rounded">{store.region}</span></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/50 text-sm">{store.hours}</p></td>
                      <td className="px-5 py-3">{store.is_recommended ? <span className="text-gold text-sm">★</span> : <span className="text-muted/20">-</span>}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setModal({ type: "edit", tab: "stores", data: { ...store, tags: store.tags.join(", "), is_recommended: store.is_recommended ? "true" : "false" } })} className="text-muted/40 hover:text-accent text-xs transition-colors">수정</button>
                          <button onClick={() => handleDelete("stores", store.id)} className="text-muted/40 hover:text-red text-xs transition-colors">삭제</button>
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
          <div className="bg-card rounded-2xl border border-white/[0.04] overflow-hidden glow-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3">제목</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3">매장</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3 hidden md:table-cell">날짜</th>
                    <th className="text-left text-muted/40 text-xs font-medium px-5 py-3 hidden md:table-cell">상금</th>
                    <th className="text-right text-muted/40 text-xs font-medium px-5 py-3">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3"><p className="text-surface text-sm font-medium">{event.title}</p></td>
                      <td className="px-5 py-3"><p className="text-muted/50 text-sm">{event.store_name}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><p className="text-muted/50 text-sm">{event.date} {event.time}</p></td>
                      <td className="px-5 py-3 hidden md:table-cell"><span className="text-gold text-sm font-medium">{event.prize || "-"}</span></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setModal({ type: "edit", tab: "events", data: event as unknown as Record<string, unknown> })} className="text-muted/40 hover:text-accent text-xs transition-colors">수정</button>
                          <button onClick={() => handleDelete("events", event.id)} className="text-muted/40 hover:text-red text-xs transition-colors">삭제</button>
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
              <div key={notice.id} className="bg-card rounded-2xl p-5 border border-white/[0.04] flex items-start justify-between glow-border">
                <div>
                  <h3 className="text-surface font-medium text-sm">{notice.title}</h3>
                  <p className="text-muted/40 text-xs mt-1">{notice.content}</p>
                  <p className="text-muted/20 text-[10px] mt-2">{notice.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button onClick={() => setModal({ type: "edit", tab: "notices", data: notice as unknown as Record<string, unknown> })} className="text-muted/40 hover:text-accent text-xs transition-colors">수정</button>
                  <button onClick={() => handleDelete("notices", notice.id)} className="text-muted/40 hover:text-red text-xs transition-colors">삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <Modal
            modal={modal}
            stores={stores}
            saving={saving}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Modal({ modal, stores, saving, onClose, onSave }: {
  modal: { type: "create" | "edit"; tab: Tab; data?: Record<string, unknown> };
  stores: Store[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(modal.data || {});
  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent/40 transition-colors placeholder:text-muted/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl p-6 border border-white/[0.06] w-full max-w-lg max-h-[80vh] overflow-y-auto glow-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">
            {modal.type === "create" ? "새로 등록" : "수정"}
          </h2>
          <button onClick={onClose} className="text-muted/40 hover:text-surface transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {modal.tab === "stores" && (
          <div className="space-y-4">
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">매장명 *</label>
              <input className={inputClass} value={(form.name as string) || ""} onChange={e => set("name", e.target.value)} placeholder="매장명 입력" />
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">주소 *</label>
              <input className={inputClass} value={(form.address as string) || ""} onChange={e => set("address", e.target.value)} placeholder="주소 입력" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">연락처</label>
                <input className={inputClass} value={(form.phone as string) || ""} onChange={e => set("phone", e.target.value)} placeholder="02-0000-0000" />
              </div>
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">영업시간</label>
                <input className={inputClass} value={(form.hours as string) || ""} onChange={e => set("hours", e.target.value)} placeholder="14:00 ~ 04:00" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">지역 *</label>
                <select className={inputClass} value={(form.region as string) || "서울"} onChange={e => set("region", e.target.value)}>
                  <option value="서울">서울</option>
                  <option value="경기">경기</option>
                  <option value="인천">인천</option>
                </select>
              </div>
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">위도</label>
                <input className={inputClass} type="number" step="0.0001" value={(form.lat as string) || ""} onChange={e => set("lat", e.target.value)} placeholder="37.5" />
              </div>
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">경도</label>
                <input className={inputClass} type="number" step="0.0001" value={(form.lng as string) || ""} onChange={e => set("lng", e.target.value)} placeholder="127.0" />
              </div>
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">태그 (쉼표 구분)</label>
              <input className={inputClass} value={(form.tags as string) || ""} onChange={e => set("tags", e.target.value)} placeholder="토너먼트, 초보환영, 주차가능" />
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">추천 매장</label>
              <select className={inputClass} value={(form.is_recommended as string) || "false"} onChange={e => set("is_recommended", e.target.value)}>
                <option value="false">아니오</option>
                <option value="true">예</option>
              </select>
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">매장 소개</label>
              <textarea className={inputClass + " resize-none"} rows={3} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="매장 소개를 입력하세요" />
            </div>
          </div>
        )}

        {modal.tab === "events" && (
          <div className="space-y-4">
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="이벤트 제목" />
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">매장 선택 *</label>
              <select className={inputClass} value={(form.store_id as string) || ""} onChange={e => set("store_id", e.target.value)}>
                <option value="">매장을 선택하세요</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">날짜 *</label>
                <input className={inputClass} type="date" value={(form.date as string) || ""} onChange={e => set("date", e.target.value)} />
              </div>
              <div>
                <label className="text-muted/50 text-xs block mb-1.5">시간 *</label>
                <input className={inputClass} type="time" value={(form.time as string) || ""} onChange={e => set("time", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">상금</label>
              <input className={inputClass} value={(form.prize as string) || ""} onChange={e => set("prize", e.target.value)} placeholder="GTD 300만원" />
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">설명</label>
              <textarea className={inputClass + " resize-none"} rows={3} value={(form.description as string) || ""} onChange={e => set("description", e.target.value)} placeholder="이벤트 설명" />
            </div>
          </div>
        )}

        {modal.tab === "notices" && (
          <div className="space-y-4">
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">제목 *</label>
              <input className={inputClass} value={(form.title as string) || ""} onChange={e => set("title", e.target.value)} placeholder="공지사항 제목" />
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">날짜</label>
              <input className={inputClass} type="date" value={(form.date as string) || new Date().toISOString().slice(0, 10)} onChange={e => set("date", e.target.value)} />
            </div>
            <div>
              <label className="text-muted/50 text-xs block mb-1.5">내용 *</label>
              <textarea className={inputClass + " resize-none"} rows={5} value={(form.content as string) || ""} onChange={e => set("content", e.target.value)} placeholder="공지사항 내용" />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-white/[0.04] border border-white/[0.06] text-muted hover:text-surface px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 bg-linear-to-r from-accent to-accent-light text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-accent/20 disabled:opacity-50 transition-all"
          >
            {saving ? "저장 중..." : modal.type === "create" ? "등록하기" : "수정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
