import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { stores } from "@/data/stores";
import { events } from "@/data/events";

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = stores.find((s) => s.id === id);

  if (!store) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🃏</p>
            <h1 className="text-2xl font-bold text-white mb-2">
              매장을 찾을 수 없습니다
            </h1>
            <Link href="/" className="text-accent hover:underline text-sm">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const storeEvents = events.filter((e) => e.storeId === store.id);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-muted hover:text-accent">
            홈
          </Link>
          <span className="text-muted">/</span>
          <Link href="/map" className="text-muted hover:text-accent">
            지도검색
          </Link>
          <span className="text-muted">/</span>
          <span className="text-surface">{store.name}</span>
        </div>

        {/* Store Header */}
        <div className="bg-card rounded-xl p-6 md:p-8 border border-border-custom mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {store.name}
                </h1>
                {store.isRecommended && (
                  <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30">
                    추천매장
                  </span>
                )}
              </div>
              <p className="text-muted text-sm">{store.address}</p>
            </div>
            <span className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-sm font-semibold shrink-0">
              {store.region}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {store.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 border border-border-custom">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              기본 정보
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-muted mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-muted text-xs">주소</p>
                  <p className="text-surface text-sm">{store.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-muted mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <p className="text-muted text-xs">연락처</p>
                  <p className="text-surface text-sm">{store.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-muted mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-muted text-xs">영업시간</p>
                  <p className="text-surface text-sm">{store.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="bg-card rounded-xl p-6 border border-border-custom">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              위치
            </h2>
            <div className="h-48 bg-secondary rounded-lg flex items-center justify-center border border-border-custom">
              <div className="text-center">
                <svg
                  className="w-10 h-10 text-accent mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-muted text-xs">
                  {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
                </p>
                <p className="text-muted text-[10px] mt-1">
                  지도 API 연동 시 실제 지도가 표시됩니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-xl p-6 border border-border-custom mb-6">
          <h2 className="text-white font-bold mb-3">매장 소개</h2>
          <p className="text-muted text-sm leading-relaxed">
            {store.description}
          </p>
        </div>

        {/* Events */}
        {storeEvents.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border-custom mb-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              🏆 대회 / 이벤트
            </h2>
            <div className="space-y-3">
              {storeEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-dark/50 rounded-lg border-l-2 border-accent"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-surface font-semibold text-sm">
                      {event.title}
                    </h3>
                    {event.prize && (
                      <span className="text-gold text-xs font-bold">
                        {event.prize}
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs">
                    {event.date} {event.time}
                  </p>
                  <p className="text-muted text-xs mt-1">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="text-center">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover text-sm transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
