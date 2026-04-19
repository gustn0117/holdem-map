"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreCard from "@/components/StoreCard";
import { useStores } from "@/hooks/useData";

export default function RecommendedStoresPage() {
  const { stores, loading } = useStores();
  const recommended = stores.filter(s => s.is_recommended);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <Link href="/" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          홈으로
        </Link>

        <div className="mb-8 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white text-lg font-black shadow-md shadow-accent/20">★</span>
            <div>
              <h1 className="text-2xl font-black text-surface">추천 매장</h1>
              <p className="text-muted text-sm mt-1">엄선된 홀덤 매장을 한눈에</p>
            </div>
          </div>
          <span className="text-muted text-sm">
            총 <span className="text-accent font-bold text-base">{recommended.length}</span>개
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
        ) : recommended.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl card-shadow">
            <p className="text-muted text-lg">아직 추천 매장이 없습니다</p>
            <Link href="/map" className="text-accent text-sm font-semibold mt-3 inline-block hover:underline">전체 매장 보기 →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
