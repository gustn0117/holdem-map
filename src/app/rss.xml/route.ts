import { supabase } from "@/lib/supabase";
import type { BlogPost } from "@/types";

const SITE_URL = "https://holdemmapkorea.com";
const SITE_NAME = "홀덤맵코리아";
const SITE_DESC = "전국 홀덤펍·텍사스 홀덤 매장 정보, 토너먼트 일정, 딜러 구인구직을 한 번에.";

// 1시간마다 재생성
export const revalidate = 3600;

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// HTML 태그 제거 후 요약 텍스트 생성
function toSummary(post: BlogPost, max = 200): string {
  const base = post.excerpt || post.content || "";
  const text = base.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function GET() {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, cover_image, category, author_nickname, created_at, updated_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const posts = (data || []) as BlogPost[];
  const lastBuild = posts[0]?.created_at ? new Date(posts[0].created_at) : new Date(0);

  const items = posts
    .map(p => {
      // 한글 슬러그를 퍼센트 인코딩해 RSS 검증기(네이버·W3C)에서 유효한 URL로 처리
      const url = `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`;
      const pubDate = p.created_at ? new Date(p.created_at).toUTCString() : "";
      const image = p.cover_image
        ? `<enclosure url="${xmlEscape(p.cover_image)}" type="image/jpeg" />`
        : "";
      const category = p.category ? `<category>${xmlEscape(p.category)}</category>` : "";
      return `    <item>
      <title>${xmlEscape(p.title || "")}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ""}
      ${p.author_nickname ? `<dc:creator>${xmlEscape(p.author_nickname)}</dc:creator>` : ""}
      ${category}
      <description><![CDATA[${toSummary(p)}]]></description>
      ${image}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xmlEscape(SITE_NAME)} 블로그</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(SITE_DESC)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
