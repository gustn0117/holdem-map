"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNotices } from "@/hooks/useData";

export default function NoticesPage() {
  const { notices, loading } = useNotices();

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-white mb-1">공지사항</h1>
        <p className="text-muted text-sm mb-8">홀덤맵의 새로운 소식을 확인하세요</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {notices.map((notice, i) => (
              <Link key={notice.id} href={`/notices/${notice.id}`} className="block group anim-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="bg-card rounded-2xl p-5 border border-border-custom hover:border-accent/30 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-[15px] group-hover:text-accent transition-colors truncate">{notice.title}</h3>
                    <p className="text-muted text-xs mt-1 truncate">{notice.content}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-muted text-xs">{notice.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
