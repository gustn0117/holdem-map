"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import RankInsignia from "@/components/RankInsignia";
import { useUserProfiles, UserProfileLite } from "@/hooks/useUserRanks";

interface Post {
  id: string; user_id: string | null; nickname: string; title: string; content: string;
  category: string; views: number; likes: number; dislikes: number;
  pinned: boolean; image: string; created_at: string;
  comment_count?: number;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("status", "approved").order("pinned_rank", { ascending: false }).order("pinned", { ascending: false }).order("created_at", { ascending: false });
      const list = (data || []) as Post[];

      // Fetch comment counts
      if (list.length > 0) {
        const ids = list.map(p => p.id);
        const { data: cmts } = await supabase.from("comments").select("post_id").in("post_id", ids);
        const counts: Record<string, number> = {};
        (cmts || []).forEach((c: any) => { counts[c.post_id] = (counts[c.post_id] || 0) + 1; });
        list.forEach(p => p.comment_count = counts[p.id] || 0);
      }

      setPosts(list);
      setLoading(false);
    })();
  }, []);

  const { pinned, hot, regular } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.nickname.toLowerCase().includes(q)) : posts;

    const pinned = filtered.filter(p => p.pinned);
    const notPinned = filtered.filter(p => !p.pinned);
    const hot = [...notPinned].sort((a, b) => b.views - a.views).slice(0, 5).filter(p => p.views > 0);
    const hotIds = new Set(hot.map(p => p.id));
    const regular = notPinned.filter(p => !hotIds.has(p.id));

    return { pinned, hot, regular };
  }, [posts, query]);

  const profileMap = useUserProfiles(posts.map(p => p.user_id));

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-surface">자유게시판</h1>
              <p className="text-muted text-sm mt-1">자유롭게 소통하세요</p>
            </div>
            {user ? (
              <Link href="/board/write" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">글 작성</Link>
            ) : (
              <Link href="/register" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all">회원가입 후 작성</Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="제목, 내용, 작성자 검색"
              className="w-full bg-white border border-border-custom rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-all placeholder:text-muted" />
          </div>

          {/* Tournament banner */}
          <Link href="/tournament" className="block mb-5 rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-r from-[#002a15] via-[#00693a] to-[#00874a]" />
            <div className="relative flex items-center gap-3 px-4 py-3">
              <svg className="w-5 h-5 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <div className="flex-1">
                <p className="text-white text-[13px] font-black">무료 토너먼트 참가하기</p>
                <p className="text-white/60 text-[11px]">가입만 하면 무료 참가권 지급</p>
              </div>
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
          ) : (
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#f9f9f9] border-b border-border-custom text-[12px] text-muted font-semibold">
                <div className="col-span-1">분류</div>
                <div className="col-span-6">제목</div>
                <div className="col-span-2">작성자</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-1 text-center">추천</div>
                <div className="col-span-1 text-right">날짜</div>
              </div>

              {/* Pinned */}
              {pinned.map(p => <PostRow key={p.id} post={p} type="pinned" profile={p.user_id ? profileMap[p.user_id] : undefined} />)}

              {/* HOT */}
              {hot.map(p => <PostRow key={p.id} post={p} type="hot" profile={p.user_id ? profileMap[p.user_id] : undefined} />)}

              {/* Regular */}
              {regular.map(p => <PostRow key={p.id} post={p} type="regular" profile={p.user_id ? profileMap[p.user_id] : undefined} />)}

              {pinned.length === 0 && hot.length === 0 && regular.length === 0 && (
                <div className="text-center py-16 text-muted">{query ? "검색 결과가 없습니다" : "아직 게시글이 없습니다"}</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PostRow({ post, type, profile }: { post: any; type: "pinned" | "hot" | "regular"; profile?: UserProfileLite }) {
  const rank = profile?.rank;
  const displayName = profile?.nickname || post.nickname;
  return (
    <Link href={`/board/${post.id}`}
      className={`grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 px-5 py-3 border-b border-border-custom last:border-b-0 hover:bg-[#fafafa] transition-colors group ${
        type === "pinned" ? "bg-accent/5" : type === "hot" ? "bg-red-50/50" : ""
      }`}>
      <div className="hidden md:block col-span-1">
        {type === "pinned" && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent text-white">공지</span>}
        {type === "hot" && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-white">HOT</span>}
        {type === "regular" && <span className="text-[11px] text-muted">일반</span>}
      </div>
      <div className="md:col-span-6">
        <div className="flex items-center gap-2">
          {type === "pinned" && <span className="md:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent text-white">공지</span>}
          {type === "hot" && <span className="md:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">HOT</span>}
          {post.image && <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          <p className="text-surface text-[14px] font-semibold truncate group-hover:text-accent transition-colors">{post.title}</p>
          {post.comment_count > 0 && <span className="text-accent text-[12px] font-bold shrink-0">[{post.comment_count}]</span>}
        </div>
        <p className="md:hidden text-muted text-[11px] mt-0.5 inline-flex items-center gap-1">
          {rank && <span className={`inline-flex items-center gap-0.5 rounded px-1 ${rank.color}`}><RankInsignia rank={rank} size="xs" /></span>}
          <span>{displayName}</span>
          <span className="inline-flex items-center gap-0.5">· {post.created_at?.slice(5, 10)} · 조회 {post.views} ·
            <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            {post.likes || 0}</span>
        </p>
      </div>
      <div className="hidden md:block md:col-span-2 text-sub text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          {rank && <span className={`inline-flex items-center rounded px-1 py-0.5 ${rank.color}`}><RankInsignia rank={rank} size="xs" /></span>}
          {displayName}
        </span>
      </div>
      <div className="hidden md:block md:col-span-1 text-center text-muted text-[13px]">{post.views}</div>
      <div className="hidden md:block md:col-span-1 text-center text-[13px] text-accent font-semibold">{post.likes || 0}</div>
      <div className="hidden md:block md:col-span-1 text-right text-muted text-[12px]">{post.created_at?.slice(5, 10)}</div>
    </Link>
  );
}
