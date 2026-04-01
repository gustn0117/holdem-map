"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function BoardWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen pb-16 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center bg-white rounded-2xl card-shadow p-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-surface text-xl font-black mb-2">회원 전용 기능입니다</h2>
            <p className="text-muted text-[14px] mb-6">글을 작성하려면 회원가입 또는 로그인이 필요합니다</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/register" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all text-[15px]">회원가입</Link>
              <Link href="/login" className="w-full border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all text-[14px]">이미 계정이 있어요</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await supabase.from("posts").insert({
      user_id: user.id,
      nickname: profile?.nickname || "익명",
      title: title.trim(),
      content: content.trim(),
    });
    router.push("/board");
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="container-main py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-surface mb-6">글 작성</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">제목</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent bg-white"
                placeholder="제목을 입력하세요" />
            </div>
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">내용</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={12}
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent bg-white resize-none"
                placeholder="내용을 입력하세요" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.back()}
                className="flex-1 border border-border-custom text-sub font-semibold py-3 rounded-xl hover:bg-[#f5f6f8] transition-all">
                취소
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {loading ? "작성 중..." : "작성 완료"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
