"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

export default function BoardDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts").select("*").eq("id", id).single();
      if (data) {
        setPost(data);
        await supabase.from("posts").update({ views: (data.views || 0) + 1 }).eq("id", id);
      }
      const { data: cmts } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
      setComments(cmts || []);
      setLoading(false);
    })();
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const { data } = await supabase.from("comments").insert({
      post_id: id,
      user_id: user.id,
      nickname: profile?.nickname || "익명",
      content: commentText.trim(),
    }).select().single();
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
      <main className="container-main py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <Link href="/board" className="inline-flex items-center gap-1.5 text-muted hover:text-accent text-sm font-medium mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            목록으로
          </Link>

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="text-2xl font-black text-surface mb-3">{post.title}</h1>
              <div className="flex items-center gap-3 text-muted text-[13px] pb-5 border-b border-border-custom">
                <span className="font-semibold text-sub">{post.nickname}</span>
                <span>{post.created_at?.slice(0, 10)}</span>
                <span>조회 {post.views}</span>
                {isAuthor && (
                  <button onClick={handleDelete} className="ml-auto text-red-400 hover:text-red-500 text-[12px] font-semibold">삭제</button>
                )}
              </div>
              <div className="py-6 text-sub text-[15px] leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {post.content}
              </div>
            </div>

            {/* Comments */}
            <div className="border-t border-border-custom p-6 md:p-8">
              <h3 className="text-surface font-bold text-[15px] mb-4">댓글 {comments.length}</h3>
              <div className="space-y-3 mb-6">
                {comments.map(c => (
                  <div key={c.id} className="bg-[#f9f9f9] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-surface text-[13px] font-bold">{c.nickname}</span>
                      <span className="text-[#ccc] text-[11px]">{c.created_at?.slice(0, 10)}</span>
                    </div>
                    <p className="text-sub text-[14px]">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-muted text-[13px]">아직 댓글이 없습니다</p>}
              </div>

              {user ? (
                <form onSubmit={handleComment} className="flex gap-2">
                  <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                    className="flex-1 border border-border-custom rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-accent bg-white"
                    placeholder="댓글을 입력하세요" />
                  <button type="submit" className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 rounded-xl transition-all shrink-0">
                    등록
                  </button>
                </form>
              ) : (
                <Link href="/login" className="block text-center text-accent text-sm font-semibold hover:underline">
                  로그인 후 댓글을 작성할 수 있습니다
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
