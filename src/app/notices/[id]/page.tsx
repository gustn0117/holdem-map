"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Notice } from "@/types";

export default function NoticeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("notices").select("*").eq("id", id).single();
      setNotice(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-2">공지사항을 찾을 수 없습니다</h1>
            <Link href="/notices" className="text-accent hover:text-accent-light text-sm transition-colors">목록으로 돌아가기</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-2 text-xs mb-6">
          <Link href="/" className="text-muted hover:text-accent transition-colors">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/notices" className="text-muted hover:text-accent transition-colors">공지사항</Link>
          <span className="text-border-custom">/</span>
          <span className="text-sub truncate">{notice.title}</span>
        </div>

        <div className="bg-card rounded-2xl border border-border-custom overflow-hidden">
          <div className="p-6 md:p-8 border-b border-border-custom">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-3">{notice.title}</h1>
            <p className="text-muted text-sm">{notice.date}</p>
          </div>
          <div className="p-6 md:p-8">
            <p className="text-sub text-[15px] leading-relaxed whitespace-pre-wrap">{notice.content}</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/notices" className="inline-flex items-center gap-2 text-muted hover:text-accent text-sm transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로 돌아가기
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
