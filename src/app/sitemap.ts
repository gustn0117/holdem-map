import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { regionData } from "@/data/areas";

const SITE_URL = "https://holdemmapkorea.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/map`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/jobs`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/tournament`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/board`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${SITE_URL}/board/strategy`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${SITE_URL}/live`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/shorts`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/promotions`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/notices`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/market`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/trade`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/recommended`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/region`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/pointshop`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const regionRoutes: MetadataRoute.Sitemap = Object.entries(regionData).flatMap(([city, districts]) => [
    { url: `${SITE_URL}/region/${encodeURIComponent(city)}`, changeFrequency: "weekly" as const, priority: 0.7 },
    ...districts.map(d => ({
      url: `${SITE_URL}/region/${encodeURIComponent(city)}/${encodeURIComponent(d)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  try {
    const [storesRes, eventsRes, postsRes, jobsRes, blogRes] = await Promise.all([
      supabase.from("stores").select("id, updated_at").limit(5000),
      supabase.from("events").select("id, updated_at, date").limit(5000),
      supabase.from("posts").select("id, updated_at, created_at").eq("status", "approved").limit(5000),
      supabase.from("jobs").select("id, updated_at, created_at").limit(5000),
      supabase.from("blog_posts").select("slug, updated_at, created_at").eq("published", true).limit(5000),
    ]);

    const stores = (storesRes.data || []).map((s: { id: string; updated_at?: string }) => ({
      url: `${SITE_URL}/store/${s.id}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const events = (eventsRes.data || []).map((e: { id: string; updated_at?: string; date?: string }) => ({
      url: `${SITE_URL}/promotions/${e.id}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : (e.date ? new Date(e.date) : undefined),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const posts = (postsRes.data || []).map((p: { id: string; updated_at?: string; created_at?: string }) => ({
      url: `${SITE_URL}/board/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : (p.created_at ? new Date(p.created_at) : undefined),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

    const jobs = (jobsRes.data || []).map((j: { id: string; updated_at?: string; created_at?: string }) => ({
      url: `${SITE_URL}/jobs/${j.id}`,
      lastModified: j.updated_at ? new Date(j.updated_at) : (j.created_at ? new Date(j.created_at) : undefined),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    const blogPosts = (blogRes.data || []).map((b: { slug: string; updated_at?: string; created_at?: string }) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(b.slug)}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : (b.created_at ? new Date(b.created_at) : undefined),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...regionRoutes, ...stores, ...events, ...posts, ...jobs, ...blogPosts];
  } catch {
    return [...staticRoutes, ...regionRoutes];
  }
}
