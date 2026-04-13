"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string; user_id: string; nickname: string; title: string; content: string;
  views: number; likes: number; dislikes: number; image: string; pinned: boolean;
  created_at: string;
}

interface Comment {
  id: string; user_id: string; nickname: string; content: string; created_at: string;
}

export default function BoardDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", id).single();
      if (data) {
        setPost(data);
        await supabase.from("posts").update({ views: (data.views || 0) + 1 }).eq("id", id);
      }
      const { data: cmts } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
      setComments(cmts || []);

      if (user) {
        const { data: reaction } = await supabase.from("post_reactions").select("reaction").eq("post_id", id).eq("user_id", user.id).single();
        if (reaction) setUserReaction(reaction.reaction as "like" | "dislike");
      }

      setLoading(false);
    })();
  }, [id, user]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!user || !post) { alert("로그인이 필요합니다"); return; }

    if (userReaction === type) {
      // Toggle off
      await supabase.from("post_reactions").delete().eq("post_id", post.id).eq("user_id", user.id);
      const newCount = type === "like" ? { likes: Math.max(0, (post.likes || 0) - 1) } : { dislikes: Math.max(0, (post.dislikes || 0) - 1) };
      await supabase.from("posts").update(newCount).eq("id", post.id);
      setPost({ ...post, ...newCount });
      setUserReaction(null);
    } else {
      // Remove old reaction if exists
      if (userReaction) {
        const oldCount = userReaction === "like" ? { likes: Math.max(0, (post.likes || 0) - 1) } : { dislikes: Math.max(0, (post.dislikes || 0) - 1) };
        await supabase.from("posts").update(oldCount).eq("id", post.id);
        setPost(p => p ? { ...p, ...oldCount } : p);
      }
      // Add new reaction
      await supabase.from("post_reactions").upsert({ post_id: post.id, user_id: user.id, reaction: type });
      const newCount = type === "like" ? { likes: (post.likes || 0) + (userReaction === "like" ? 0 : 1) } : { dislikes: (post.dislikes || 0) + (userReaction === "dislike" ? 0 : 1) };
      await supabase.from("posts").update(newCount).eq("id", post.id);
      setPost(p => p ? { ...p, ...newCount } : p);
      setUserReaction(type);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const { data, error } = await supabase.from("comments").insert({
      post_id: id, user_id: user.id, nickname: profile?.nickname || "익명", content: commentText.trim(),
    }).select().single();
    if (error) { alert("댓글 등록에 실패했습니다."); return; }
    if (data) setComments([...comments, data]);
    setCommentText("");
  };

  const handleDelete = async () => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("posts").delete().eq("id", id);
    router.push("/board");
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
    </div>
  );

  if (!post) return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl font-bold text-surface mb-3">게시글을 찾을 수 없습니다</h1>
          <Link href="/board" className="text-accent font-semibold">목록으로</Link>
        </div>
      </div>
      <Footer />
    </div>
  );

  const isAuthor = user?.id === post.user_id;

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1400px" }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/board" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로
          </Link>

          {/* Top Ad - Tournament */}
          <Link href="/tournament" className="block mb-4 rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-linear-to-r from-[#002a15] via-[#00693a] to-[#00874a]" />
            <div className="relative flex items-center gap-3 px-4 py-3">
              <svg className="w-5 h-5 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <div className="flex-1"><p className="text-white text-[13px] font-black">무료 토너먼트 참가하기</p><p className="text-white/60 text-[11px]">가입만 하면 무료 참가권</p></div>
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="p-6 md:p-8">
              {post.pinned && <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-accent text-white mb-2">공지</span>}
              <h1 className="text-2xl font-black text-surface mb-3">{post.title}</h1>
              <div className="flex items-center gap-3 text-muted text-[13px] pb-5 border-b border-border-custom">
                <span className="font-semibold text-sub">{post.nickname}</span>
                <span>{post.created_at?.slice(0, 10)}</span>
                <span>조회 {post.views}</span>
                {isAuthor && <button onClick={handleDelete} className="ml-auto text-red-400 hover:text-red-500 text-[12px] font-semibold">삭제</button>}
              </div>
              <div className="py-6 text-sub text-[15px] leading-relaxed whitespace-pre-wrap min-h-[200px]">{post.content}</div>
              {post.image && (
                <div className="mb-4">
                  <img src={post.image} alt="" className="rounded-xl max-w-full h-auto" />
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center justify-center gap-3 py-5 border-t border-border-custom">
                <button onClick={() => handleReaction("like")}
                  className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border-2 transition-all ${
                    userReaction === "like" ? "border-accent bg-accent/10 text-accent" : "border-border-custom text-muted hover:border-accent/30"
                  }`}>
                  <svg className="w-6 h-6" fill={userReaction === "like" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  <span className="text-[16px] font-black">{post.likes || 0}</span>
                  <span className="text-[11px]">추천</span>
                </button>
                <button onClick={() => handleReaction("dislike")}
                  className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border-2 transition-all ${
                    userReaction === "dislike" ? "border-red-400 bg-red-50 text-red-500" : "border-border-custom text-muted hover:border-red-200"
                  }`}>
                  <svg className="w-6 h-6" fill={userReaction === "dislike" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                  <span className="text-[16px] font-black">{post.dislikes || 0}</span>
                  <span className="text-[11px]">비추천</span>
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="border-t border-border-custom p-6 md:p-8">
              <h3 className="text-surface font-bold text-[15px] mb-4">댓글 {comments.length}</h3>
              <div className="space-y-3 mb-4">
                {comments.map((c, i) => (
                  <div key={c.id}>
                    <div className="bg-[#f9f9f9] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-surface text-[13px] font-bold">{c.nickname}</span>
                        <span className="text-[#ccc] text-[11px]">{c.created_at?.slice(0, 10)}</span>
                      </div>
                      <p className="text-sub text-[14px]">{c.content}</p>
                    </div>
                    {/* Ad after 3rd comment */}
                    {i === 2 && comments.length > 3 && (
                      <Link href="/promotions" className="block my-3 rounded-xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-linear-to-r from-[#1a2744] via-[#1e3a8a] to-[#2563eb]" />
                        <div className="relative flex items-center gap-3 px-4 py-2.5">
                          <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                          <div className="flex-1"><p className="text-white text-[12px] font-bold">진행중인 이벤트 보기</p></div>
                          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
                {comments.length === 0 && <p className="text-muted text-[13px]">아직 댓글이 없습니다</p>}
              </div>

              {user ? (
                <form onSubmit={handleComment} className="flex gap-2">
                  <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                    className="flex-1 border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-accent bg-white"
                    placeholder="댓글을 입력하세요" />
                  <button type="submit" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 rounded-xl transition-all shrink-0">등록</button>
                </form>
              ) : (
                <Link href="/register" className="block text-center text-accent text-sm font-semibold hover:underline">회원가입 후 댓글을 작성할 수 있습니다</Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
