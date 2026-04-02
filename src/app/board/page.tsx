"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  nickname: string;
  title: string;
  content: string;
  category: string;
  views: number;
  created_at: string;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("posts").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-surface">자유게시판</h1>
              <p className="text-muted text-sm mt-1">자유롭게 소통하세요</p>
            </div>
            {user ? (
              <Link href="/board/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">
                글 작성
              </Link>
            ) : (
              <Link href="/register" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">
                회원가입 후 작성
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl card-shadow">
              <svg className="w-16 h-16 text-[#eee] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-muted text-lg mb-2">아직 게시글이 없습니다</p>
              <p className="text-muted text-sm">첫 번째 글을 작성해보세요</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#f9f9f9] border-b border-border-custom text-[12px] text-muted font-semibold">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-6">제목</div>
                <div className="col-span-2">작성자</div>
                <div className="col-span-2">날짜</div>
                <div className="col-span-1 text-center">조회</div>
              </div>
              {posts.map((post, i) => (
                <Link key={post.id} href={`/board/${post.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 px-5 py-3.5 border-b border-border-custom last:border-b-0 hover:bg-[#fafafa] transition-colors group">
                  <div className="hidden md:block col-span-1 text-center text-muted text-[13px]">{posts.length - i}</div>
                  <div className="md:col-span-6">
                    <p className="text-surface text-[15px] font-semibold truncate group-hover:text-accent transition-colors">{post.title}</p>
                    <p className="md:hidden text-muted text-[12px] mt-0.5">{post.nickname} · {post.created_at?.slice(5, 10)} · 조회 {post.views}</p>
                  </div>
                  <div className="hidden md:block col-span-2 text-sub text-[13px]">{post.nickname}</div>
                  <div className="hidden md:block col-span-2 text-muted text-[13px]">{post.created_at?.slice(0, 10)}</div>
                  <div className="hidden md:block col-span-1 text-center text-muted text-[13px]">{post.views}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
