import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLd";
import { breadcrumbSchema, articleSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import { sanitizeHtml, isHtml, plainTextToHtml } from "@/lib/sanitize";
import type { BlogPost } from "@/types";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

async function fetchPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as BlogPost) || null;
}

async function fetchRelated(slug: string, category?: string | null): Promise<BlogPost[]> {
  const q = supabase.from("blog_posts").select("*").eq("published", true).neq("slug", slug).limit(4);
  if (category) q.eq("category", category);
  const { data } = await q;
  return (data || []) as BlogPost[];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const post = await fetchPost(slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };
  const desc = post.excerpt || post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: post.title,
    description: desc,
    alternates: { canonical: `/blog/${encodeURIComponent(post.slug)}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: desc,
      url: `/blog/${encodeURIComponent(post.slug)}`,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const post = await fetchPost(slug);
  if (!post) notFound();
  const related = await fetchRelated(slug, post.category);

  // 조회수 +1 (실패해도 무시)
  supabase.from("blog_posts").update({ views: (post.views || 0) + 1 }).eq("id", post.id).then(() => undefined);

  const schemas = [
    breadcrumbSchema([
      { name: "홈", path: "/" },
      { name: "블로그", path: "/blog" },
      { name: post.title, path: `/blog/${encodeURIComponent(post.slug)}` },
    ]),
    articleSchema({
      id: post.slug, title: post.title, content: post.content,
      nickname: post.author_nickname, created_at: post.created_at,
      updated_at: post.updated_at, image: post.cover_image,
    }),
  ];

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <JsonLdScript data={schemas} />
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "900px" }}>
        <nav className="flex items-center gap-2 text-[13px] mb-6">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <Link href="/blog" className="text-muted hover:text-accent">블로그</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold truncate max-w-[200px]">{post.title}</span>
        </nav>

        <article className="bg-white border border-border-custom rounded-2xl p-6 md:p-10">
          {post.category && (
            <span className="inline-block text-[12px] font-bold text-accent bg-accent-light px-3 py-1 rounded-full mb-4">{post.category}</span>
          )}
          <h1 className="text-surface text-2xl md:text-3xl font-black leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 text-[13px] text-muted mb-6 pb-6 border-b border-border-custom">
            {post.author_nickname && <span>{post.author_nickname}</span>}
            {post.created_at && <span>· {new Date(post.created_at).toLocaleDateString("ko-KR")}</span>}
            <span className="ml-auto">조회 {(post.views || 0) + 1}</span>
          </div>
          {post.cover_image && (
            <img src={post.cover_image} alt={post.title} className="w-full rounded-xl mb-8" loading="lazy" />
          )}
          <div className="rich-html text-sub text-[15px] md:text-[16px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(isHtml(post.content) ? post.content : plainTextToHtml(post.content)) }} />
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border-custom">
              {post.tags.map(t => (
                <span key={t} className="text-[12px] text-muted bg-bg px-2.5 py-1 rounded-full">#{t}</span>
              ))}
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-surface text-lg font-bold mb-4">관련 글</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/blog/${encodeURIComponent(p.slug)}`}
                  className="bg-white border border-border-custom rounded-2xl p-4 hover:border-accent transition-all block">
                  <h3 className="text-surface font-bold text-[15px] line-clamp-2">{p.title}</h3>
                  {p.excerpt && <p className="text-muted text-[13px] mt-1 line-clamp-2">{p.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
