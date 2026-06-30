export const SITE_URL = "https://holdemmapkorea.com";
export const SITE_NAME = "홀덤맵코리아";

export type JsonLd = Record<string, unknown>;

function clean<T extends JsonLd>(obj: T): T {
  for (const k of Object.keys(obj)) {
    const v = (obj as Record<string, unknown>)[k];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
      delete (obj as Record<string, unknown>)[k];
    }
  }
  return obj;
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function localBusinessSchema(store: {
  id: string;
  name: string;
  address?: string | null;
  region?: string | null;
  phone?: string | null;
  hours?: string | null;
  image?: string | null;
  poster?: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  rating?: number | null;
  rating_count?: number | null;
}): JsonLd {
  const image = store.image || store.poster || undefined;
  const desc = store.description || `${store.region || ""} ${store.name} 홀덤펍 정보`;
  return clean({
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EntertainmentBusiness"],
    "@id": `${SITE_URL}/store/${store.id}#localbusiness`,
    name: store.name,
    description: desc,
    url: `${SITE_URL}/store/${store.id}`,
    image: image ? [image] : undefined,
    telephone: store.phone || undefined,
    address: store.address ? { "@type": "PostalAddress", streetAddress: store.address, addressLocality: store.region || undefined, addressCountry: "KR" } : undefined,
    geo: store.lat && store.lng ? { "@type": "GeoCoordinates", latitude: store.lat, longitude: store.lng } : undefined,
    openingHours: store.hours || undefined,
    aggregateRating: store.rating_count && store.rating
      ? { "@type": "AggregateRating", ratingValue: store.rating, reviewCount: store.rating_count }
      : undefined,
  });
}

export function eventSchema(event: {
  id: string;
  title: string;
  store_name?: string | null;
  date: string;
  time?: string | null;
  end_date?: string | null;
  prize?: string | null;
  description?: string | null;
  image?: string | null;
  store_address?: string | null;
}): JsonLd {
  const startDate = event.time ? `${event.date}T${event.time}` : event.date;
  return clean({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || `${event.store_name || ""} ${event.title} 홀덤 토너먼트`,
    startDate,
    endDate: event.end_date || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.image ? [event.image] : undefined,
    location: event.store_name ? {
      "@type": "Place",
      name: event.store_name,
      address: event.store_address ? { "@type": "PostalAddress", streetAddress: event.store_address, addressCountry: "KR" } : undefined,
    } : undefined,
    organizer: { "@type": "Organization", name: event.store_name || SITE_NAME, url: SITE_URL },
    offers: event.prize ? { "@type": "Offer", description: event.prize, url: `${SITE_URL}/promotions/${event.id}` } : undefined,
  });
}

export function jobPostingSchema(job: {
  id: string;
  type?: string | null;
  role?: string | null;
  store_name?: string | null;
  areas?: string[] | null;
  message?: string | null;
  experience?: string | null;
  gender?: string | null;
  salary?: string | null;
  work_hours?: string | null;
  headcount?: string | null;
  created_at?: string | null;
  photo?: string | null;
}): JsonLd | null {
  if (job.type !== "구인") return null;
  const region = job.areas?.[0] || "전국";
  const title = `${region} ${job.role || "홀덤펍"} 딜러 구인 - ${job.store_name || "홀덤펍"}`;
  return clean({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: (job.message || "").replace(/<[^>]+>/g, " ").trim() || `${region} ${job.role || "홀덤"} 매장 ${job.role || "딜러"} 구인 공고입니다.`,
    datePosted: job.created_at || undefined,
    employmentType: ["FULL_TIME", "PART_TIME"],
    hiringOrganization: {
      "@type": "Organization",
      name: job.store_name || "홀덤펍",
      sameAs: SITE_URL,
      logo: job.photo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: region,
        addressCountry: "KR",
      },
    },
    industry: "Entertainment / Hospitality",
    occupationalCategory: job.role || "딜러",
    qualifications: job.experience || undefined,
    baseSalary: job.salary ? { "@type": "MonetaryAmount", currency: "KRW", value: { "@type": "QuantitativeValue", value: job.salary, unitText: "MONTH" } } : undefined,
    workHours: job.work_hours || undefined,
    totalJobOpenings: job.headcount ? Number(String(job.headcount).replace(/\D/g, "")) || undefined : undefined,
    directApply: false,
    url: `${SITE_URL}/jobs/${job.id}`,
  });
}

export function articleSchema(post: {
  id: string;
  title: string;
  content: string;
  nickname?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  image?: string | null;
}): JsonLd {
  const description = post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  return clean({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    image: post.image ? [post.image] : undefined,
    datePublished: post.created_at || undefined,
    dateModified: post.updated_at || post.created_at || undefined,
    author: { "@type": "Person", name: post.nickname || "익명" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` } },
    mainEntityOfPage: `${SITE_URL}/board/${post.id}`,
  });
}

export function faqSchema(items: Array<{ q: string; a: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(it => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

