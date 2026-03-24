"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { stores } from "@/data/stores";
import { events } from "@/data/events";
import { notices } from "@/data/notices";

type Tab = "stores" | "events" | "notices" | "banners";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("stores");
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "stores", label: "매장 관리", count: stores.length },
    { key: "events", label: "이벤트 관리", count: events.length },
    { key: "notices", label: "공지사항", count: notices.length },
    { key: "banners", label: "배너 관리", count: 2 },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">관리자 페이지</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            새로 등록
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-card rounded-xl p-1 border border-border-custom overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-accent text-white"
                  : "text-muted hover:text-surface"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${
                  activeTab === tab.key ? "text-white/70" : "text-muted"
                }`}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Store Management */}
        {activeTab === "stores" && (
          <div className="bg-card rounded-xl border border-border-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left text-muted text-xs font-medium px-5 py-3">
                      매장명
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3 hidden md:table-cell">
                      주소
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3">
                      지역
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3 hidden md:table-cell">
                      영업시간
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3">
                      추천
                    </th>
                    <th className="text-right text-muted text-xs font-medium px-5 py-3">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="border-b border-border-custom/50 hover:bg-card-hover transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-surface text-sm font-medium">
                          {store.name}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <p className="text-muted text-sm">{store.address}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="bg-accent/10 text-accent text-xs px-2 py-0.5 rounded">
                          {store.region}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <p className="text-muted text-sm">{store.hours}</p>
                      </td>
                      <td className="px-5 py-3">
                        {store.isRecommended ? (
                          <span className="text-gold text-sm">★</span>
                        ) : (
                          <span className="text-muted text-sm">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-muted hover:text-accent text-xs transition-colors">
                            수정
                          </button>
                          <button className="text-muted hover:text-red-400 text-xs transition-colors">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Event Management */}
        {activeTab === "events" && (
          <div className="bg-card rounded-xl border border-border-custom overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left text-muted text-xs font-medium px-5 py-3">
                      제목
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3">
                      매장
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3 hidden md:table-cell">
                      날짜
                    </th>
                    <th className="text-left text-muted text-xs font-medium px-5 py-3 hidden md:table-cell">
                      상금
                    </th>
                    <th className="text-right text-muted text-xs font-medium px-5 py-3">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-border-custom/50 hover:bg-card-hover transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-surface text-sm font-medium">
                          {event.title}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-muted text-sm">
                          {event.storeName}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <p className="text-muted text-sm">
                          {event.date} {event.time}
                        </p>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="text-gold text-sm font-medium">
                          {event.prize || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-muted hover:text-accent text-xs transition-colors">
                            수정
                          </button>
                          <button className="text-muted hover:text-red-400 text-xs transition-colors">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notice Management */}
        {activeTab === "notices" && (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-card rounded-xl p-5 border border-border-custom flex items-start justify-between"
              >
                <div>
                  <h3 className="text-surface font-medium text-sm">
                    {notice.title}
                  </h3>
                  <p className="text-muted text-xs mt-1">{notice.content}</p>
                  <p className="text-muted text-[10px] mt-2">{notice.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button className="text-muted hover:text-accent text-xs transition-colors">
                    수정
                  </button>
                  <button className="text-muted hover:text-red-400 text-xs transition-colors">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner Management */}
        {activeTab === "banners" && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border-custom">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-surface font-medium">상단 메인 배너</h3>
                  <p className="text-muted text-xs mt-1">
                    메인 페이지 하단 광고 배너 영역
                  </p>
                </div>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                  활성
                </span>
              </div>
              <div className="h-20 bg-gradient-to-r from-accent/10 via-card to-accent/10 rounded-lg flex items-center justify-center border border-accent/20">
                <p className="text-muted text-xs">
                  매장 등록 홍보 배너 (활성 중)
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-muted hover:text-accent text-xs transition-colors">
                  수정
                </button>
                <button className="text-muted hover:text-red-400 text-xs transition-colors">
                  비활성화
                </button>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border-custom">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-surface font-medium">
                    추천 매장 사이드 배너
                  </h3>
                  <p className="text-muted text-xs mt-1">
                    검색 결과 페이지 추천 매장 영역
                  </p>
                </div>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                  활성
                </span>
              </div>
              <div className="h-20 bg-gold/5 rounded-lg flex items-center justify-center border border-gold/20">
                <p className="text-muted text-xs">
                  추천 매장 배너 (활성 중)
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-muted hover:text-accent text-xs transition-colors">
                  수정
                </button>
                <button className="text-muted hover:text-red-400 text-xs transition-colors">
                  비활성화
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative bg-card rounded-2xl p-6 border border-border-custom w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">
                  {activeTab === "stores"
                    ? "매장 등록"
                    : activeTab === "events"
                    ? "이벤트 등록"
                    : activeTab === "notices"
                    ? "공지사항 등록"
                    : "배너 등록"}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted hover:text-surface"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {activeTab === "stores" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      매장명 *
                    </label>
                    <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      주소 *
                    </label>
                    <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted text-xs block mb-1">
                        연락처
                      </label>
                      <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                      <label className="text-muted text-xs block mb-1">
                        영업시간
                      </label>
                      <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted text-xs block mb-1">
                        지역 *
                      </label>
                      <select className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent">
                        <option>서울</option>
                        <option>경기</option>
                        <option>인천</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-muted text-xs block mb-1">
                        추천 매장
                      </label>
                      <select className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent">
                        <option>아니오</option>
                        <option>예</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      매장 소개
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "events" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      이벤트 제목 *
                    </label>
                    <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      매장 선택 *
                    </label>
                    <select className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent">
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted text-xs block mb-1">
                        날짜 *
                      </label>
                      <input
                        type="date"
                        className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-muted text-xs block mb-1">
                        시간 *
                      </label>
                      <input
                        type="time"
                        className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      상금
                    </label>
                    <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      설명
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === "notices" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      제목 *
                    </label>
                    <input className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="text-muted text-xs block mb-1">
                      내용 *
                    </label>
                    <textarea
                      rows={5}
                      className="w-full bg-dark border border-border-custom rounded-lg px-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-dark border border-border-custom text-muted hover:text-surface px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    alert("데모 버전에서는 실제 등록이 되지 않습니다.");
                    setShowAddModal(false);
                  }}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
