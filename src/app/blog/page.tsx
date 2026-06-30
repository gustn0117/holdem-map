import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLdScript from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/types";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "홀덤 블로그 — 전략, 입문, 토너먼트, 딜러 가이드",
  description: "홀덤 초보부터 고수까지 도움이 되는 홀덤 전략, 족보, 포지션, GTO, ICM, 토너먼트·캐시게임 팁, 딜러 입문 가이드를 홀덤맵코리아 블로그에서 만나보세요.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "홀덤 블로그 — 전략, 입문, 토너먼트, 딜러 가이드",
    description: "홀덤 초보부터 고수까지, 실전 홀덤 전략과 가이드.",
    url: "/blog",
  },
};

async function fetchPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(60);
  return (data || []) as BlogPost[];
}

export default async function BlogIndexPage() {
  const posts = await fetchPosts();

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <JsonLdScript data={breadcrumbSchema([
        { name: "홈", path: "/" },
        { name: "블로그", path: "/blog" },
      ])} />
      <Header />
      <main className="w-full mx-auto px-5 md:px-10 py-8 flex-1" style={{ maxWidth: "1200px" }}>
        <nav className="flex items-center gap-2 text-[13px] mb-6">
          <Link href="/" className="text-muted hover:text-accent">홈</Link>
          <span className="text-border-custom">/</span>
          <span className="text-surface font-semibold">블로그</span>
        </nav>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-surface mb-3">홀덤맵코리아 블로그</h1>
          <p className="text-sub text-[15px] leading-relaxed max-w-3xl">
            홀덤 입문자를 위한 족보·포지션·기본 전략부터 경험자를 위한 GTO·ICM·3베팅·4베팅 전략,
            그리고 토너먼트·캐시 게임·딜러 입문 가이드까지. 실전에 바로 쓸 수 있는 홀덤 콘텐츠를 정리했습니다.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="bg-white border border-border-custom rounded-2xl py-16 text-center">
            <p className="text-muted text-[15px]">아직 게시된 글이 없습니다</p>
            <p className="text-muted text-[12px] mt-2">곧 첫 게시글이 올라옵니다. 잠시만 기다려 주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(p => (
              <Link key={p.id} href={`/blog/${encodeURIComponent(p.slug)}`}
                className="group bg-white border border-border-custom rounded-2xl overflow-hidden hover:border-accent hover:card-shadow-hover transition-all">
                {p.cover_image && (
                  <div className="aspect-video bg-bg overflow-hidden">
                    <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  {p.category && <span className="inline-block text-[11px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full mb-2">{p.category}</span>}
                  <h2 className="text-surface font-bold text-[16px] line-clamp-2 group-hover:text-accent transition-colors">{p.title}</h2>
                  {p.excerpt && <p className="text-muted text-[13px] mt-2 line-clamp-2">{p.excerpt}</p>}
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-muted">
                    {p.author_nickname && <span>{p.author_nickname}</span>}
                    {p.created_at && <span>· {new Date(p.created_at).toLocaleDateString("ko-KR")}</span>}
                    {typeof p.views === "number" && <span className="ml-auto">조회 {p.views}</span>}
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
