"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RichEditor from "@/components/RichEditor";
import ImageUpload from "@/components/ImageUpload";
import { sanitizeHtml } from "@/lib/sanitize";
import type { BlogPost } from "@/types";

import { ADMIN_PASSWORD } from "@/lib/admin";
const CATEGORIES = ["홀덤 입문", "전략", "토너먼트", "딜러 가이드", "지역 가이드", "용어 사전", "기타"];
const inputClass = "w-full bg-white border border-border-custom rounded-xl px-4 py-3 text-base text-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-muted";

const slugify = (s: string) =>
  s.trim().toLowerCase()
    .replace(/[^\w가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

type FormState = Omit<BlogPost, "id" | "created_at" | "updated_at" | "views">;

const empty = (): FormState => ({
  slug: "",
  title: "",
  content: "",
  excerpt: "",
  cover_image: "",
  tags: [],
  category: "",
  author_nickname: "홀덤맵코리아",
  author_id: null,
  published: true,
});

export default function AdminBlogPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<FormState>(empty());
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("hm_admin") === ADMIN_PASSWORD) setAuthed(true);
  }, []);

  const refresh = useCallback(async () => {
    // PostgREST 응답은 기본 max-rows(1000)로 제한되므로 .range()로 페이지네이션하여 전체 글을 가져온다
    const PAGE_SIZE = 1000;
    const all: BlogPost[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error || !data || data.length === 0) break;
      all.push(...(data as BlogPost[]));
      if (data.length < PAGE_SIZE) break;
    }
    setPosts(all);
  }, []);

  useEffect(() => { if (authed) refresh(); }, [authed, refresh]);

  const startCreate = () => { setEditing(null); setForm(empty()); setTagInput(""); };
  const startEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      slug: p.slug, title: p.title, content: p.content, excerpt: p.excerpt || "",
      cover_image: p.cover_image || "", tags: p.tags || [], category: p.category || "",
      author_nickname: p.author_nickname || "홀덤맵코리아", author_id: p.author_id || null,
      published: p.published,
    });
    setTagInput((p.tags || []).join(", "));
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { alert("제목과 본문은 필수입니다."); return; }
    const slug = (form.slug || slugify(form.title)).trim();
    if (!slug) { alert("슬러그를 생성할 수 없습니다. 영문/숫자가 포함된 제목으로 작성하거나 직접 입력해 주세요."); return; }
    const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
    setSaving(true);
    try {
      const payload = {
        slug, title: form.title.trim(),
        content: sanitizeHtml(form.content),
        excerpt: form.excerpt?.trim() || null,
        cover_image: form.cover_image || null,
        tags: tags.length ? tags : null,
        category: form.category || null,
        author_nickname: form.author_nickname || null,
        published: form.published,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
      alert("저장되었습니다.");
      setEditing(null); setForm(empty()); setTagInput("");
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message
        : (e && typeof e === "object" && "message" in e) ? String((e as { message: unknown }).message)
        : (() => { try { return JSON.stringify(e); } catch { return String(e); } })();
      console.error("[blog save]", e);
      alert("저장 실패: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { alert("삭제 실패: " + error.message); return; }
    if (editing?.id === id) { setEditing(null); setForm(empty()); setTagInput(""); }
    await refresh();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]">
        <form onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) { setAuthed(true); try { sessionStorage.setItem("hm_admin", ADMIN_PASSWORD); } catch {} } else { alert("비밀번호가 올바르지 않습니다."); } }}
          className="bg-white rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-surface mb-4">관리자 비밀번호</h1>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} className={inputClass} autoFocus placeholder="비밀번호" />
          <button type="submit" className="w-full bg-accent text-white py-3 rounded-xl font-bold mt-4">로그인</button>
          <Link href="/admin" className="block text-center text-muted text-sm mt-4">← 관리자 대시보드</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-white border-b border-border-custom sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-muted hover:text-accent text-sm">← 관리자</Link>
            <span className="text-border-custom">|</span>
            <h1 className="text-surface font-bold">블로그 관리</h1>
          </div>
          <button onClick={startCreate} className="bg-accent text-white font-bold px-4 py-2 rounded-lg text-sm">+ 새 글 작성</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-border-custom p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <p className="text-muted text-sm mb-3">총 {posts.length}개</p>
          {posts.length === 0 ? (
            <p className="text-muted text-sm">아직 글이 없습니다</p>
          ) : (
            <ul className="space-y-2">
              {posts.map(p => (
                <li key={p.id}>
                  <button onClick={() => startEdit(p)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${editing?.id === p.id ? "border-accent bg-accent/5" : "border-border-custom hover:border-accent/50"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {p.category && <span className="text-[10px] font-bold text-accent bg-accent-light px-1.5 py-0.5 rounded">{p.category}</span>}
                      {!p.published && <span className="text-[10px] font-bold text-white bg-gray-400 px-1.5 py-0.5 rounded">비공개</span>}
                    </div>
                    <p className="text-surface text-sm font-semibold line-clamp-2">{p.title}</p>
                    <p className="text-muted text-[11px] mt-1">{p.created_at ? new Date(p.created_at).toLocaleDateString("ko-KR") : ""}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="bg-white rounded-2xl border border-border-custom p-6">
          <h2 className="text-xl font-bold text-surface mb-6">{editing ? `편집: ${editing.title}` : "새 블로그 글"}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">제목 *</label>
              <input className={inputClass} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editing ? f.slug : (f.slug || slugify(e.target.value)) }))} placeholder="홀덤 족보 외우는 법 — 초보 완전 정복" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-sub block mb-1.5">슬러그 (URL)</label>
                <input className={inputClass} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="holdem-hand-ranking" />
                <p className="text-muted text-[11px] mt-1">{form.slug && `/blog/${form.slug}`}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-sub block mb-1.5">카테고리</label>
                <select className={inputClass} value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">선택 안 함</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">요약 (선택, 미리보기 노출)</label>
              <textarea className={inputClass + " resize-none"} rows={2} value={form.excerpt || ""} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="목록 카드와 검색 결과에 노출될 짧은 요약" maxLength={200} />
            </div>
            <ImageUpload value={form.cover_image || ""} onChange={v => setForm(f => ({ ...f, cover_image: v }))} folder="blog" label="커버 이미지 (선택)" aspect="aspect-video" />
            <div>
              <label className="text-sm font-semibold text-sub block mb-1.5">본문 *</label>
              <RichEditor value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} storageFolder="blog" minHeight={400} maxChars={30000} placeholder="본문을 작성하세요. 이미지·링크·서식·이모지 모두 사용 가능합니다." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-sub block mb-1.5">태그 (쉼표 구분)</label>
                <input className={inputClass} value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="홀덤, 족보, 초보" />
              </div>
              <div>
                <label className="text-sm font-semibold text-sub block mb-1.5">작성자 표시 이름</label>
                <input className={inputClass} value={form.author_nickname || ""} onChange={e => setForm(f => ({ ...f, author_nickname: e.target.value }))} placeholder="홀덤맵코리아" />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sub">
              <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />
              <span className="text-sm">즉시 공개</span>
            </label>
            <div className="flex gap-3 pt-4 border-t border-border-custom">
              {editing && <button onClick={() => remove(editing.id)} className="border border-red-300 text-red-500 hover:bg-red-50 font-bold px-4 py-3 rounded-xl text-sm">삭제</button>}
              <button onClick={save} disabled={saving} className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl disabled:opacity-50">
                {saving ? "저장 중..." : editing ? "수정 저장" : "새 글 등록"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
