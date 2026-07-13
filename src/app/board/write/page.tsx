"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import RichEditor from "@/components/RichEditor";
import { addPoints, POINT_RULES } from "@/lib/rank";
import { classifyContent, formatFilterMessage } from "@/lib/contentFilter";
import { sanitizeHtml } from "@/lib/sanitize";

const CATEGORIES = ["자유", "전략"] as const;

export default function BoardWritePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
      <BoardWriteInner />
    </Suspense>
  );
}

function BoardWriteInner() {
  const searchParams = useSearchParams();
  const initialCat = (searchParams.get("cat") === "전략" ? "전략" : "자유") as typeof CATEGORIES[number];
  const [category, setCategory] = useState<typeof CATEGORIES[number]>(initialCat);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
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

  const stripHtml = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const plainContent = stripHtml(content);
    if (!title.trim() || !plainContent) return;
    const filter = classifyContent(`${title}\n${plainContent}`, { blockUrls: false });
    if (filter.action === "block") {
      alert(formatFilterMessage(filter));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      nickname: profile?.nickname || "익명",
      title: title.trim(),
      content: sanitizeHtml(content),
      image,
      status: "approved",
      category,
    });
    if (error) { alert("작성에 실패했습니다."); setLoading(false); return; }
    const pt = await addPoints(supabase, user.id, "post");
    if (pt.success && pt.added) {
      await refreshProfile();
      alert(`게시글이 등록되었습니다. +${pt.added} 포인트 적립!`);
    } else if (pt.message) {
      alert(`게시글은 등록되었습니다. (포인트 미적립: ${pt.message})`);
    }
    router.push(category === "전략" ? "/board/strategy" : "/board");
  };

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-surface mb-6">글 작성</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">게시판</label>
              <div className="flex gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${category === c ? "bg-accent text-white border-accent" : "border-border-custom text-sub hover:border-accent"}`}>
                    {c === "전략" ? "전략게시판" : "자유게시판"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">제목</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full border border-border-custom rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-accent bg-white"
                placeholder="제목을 입력하세요" />
            </div>
            <div>
              <label className="text-surface text-sm font-semibold mb-1.5 block">내용</label>
              <RichEditor value={content} onChange={setContent} placeholder="내용을 입력하세요. 본문 안에 이미지·링크·서식을 자유롭게 넣을 수 있습니다." storageFolder="posts" />
            </div>
            <ImageUpload value={image} onChange={setImage} folder="posts" label="대표 이미지 (선택, 목록에서 노출됨)" />
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
