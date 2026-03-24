import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreMap from "@/components/StoreMap";
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
            <svg className="w-16 h-16 text-muted/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h1 className="text-xl font-bold text-white mb-2">매장을 찾을 수 없습니다</h1>
            <Link href="/" className="text-accent hover:text-accent-light text-sm transition-colors">홈으로 돌아가기</Link>
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

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-5">
          <Link href="/" className="text-muted hover:text-accent-light transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/map" className="text-muted hover:text-accent-light transition-colors">지도</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface">{store.name}</span>
        </div>

        {/* Store Header */}
        <div className="bg-card rounded-2xl p-6 border border-border-custom/50 mb-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{store.name}</h1>
                {store.isRecommended && (
                  <span className="bg-gold/10 text-gold text-[11px] font-bold px-3 py-1 rounded-lg border border-gold/15">추천</span>
                )}
              </div>
              <p className="text-muted text-sm">{store.address}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {store.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-muted border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="bg-accent/10 text-accent-light px-4 py-2 rounded-lg text-sm font-semibold shrink-0 border border-accent/10">
              {store.region}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-card rounded-2xl p-5 border border-border-custom/50">
            <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              기본 정보
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: "주소", value: store.address,
                  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                },
                {
                  label: "연락처", value: store.phone,
                  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                },
                {
                  label: "영업시간", value: store.hours,
                  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-muted text-[11px]">{item.label}</p>
                    <p className="text-surface text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="bg-card rounded-2xl p-5 border border-border-custom/50">
            <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              위치
            </h2>
            <div className="h-52 rounded-xl overflow-hidden">
              <StoreMap store={store} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-5 border border-border-custom/50 mb-5">
          <h2 className="text-white font-bold text-sm mb-3">매장 소개</h2>
          <p className="text-muted text-sm leading-relaxed">{store.description}</p>
        </div>

        {/* Events */}
        {storeEvents.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border-custom/50 mb-5">
            <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              대회 / 이벤트
            </h2>
            <div className="space-y-2.5">
              {storeEvents.map((event) => (
                <div key={event.id} className="p-4 bg-dark/50 rounded-xl border border-border-custom/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-surface font-semibold text-sm">{event.title}</h3>
                    {event.prize && (
                      <span className="text-gold text-xs font-bold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/15">{event.prize}</span>
                    )}
                  </div>
                  <p className="text-muted/70 text-xs">{event.date} {event.time}</p>
                  <p className="text-muted text-xs mt-1.5">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="text-center pt-2">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-light text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
