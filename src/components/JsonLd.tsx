import type { JsonLd } from "@/lib/schema";

export default function JsonLdScript({ data }: { data: JsonLd | JsonLd[] | null | undefined }) {
  if (!data) return null;
  const arr = Array.isArray(data) ? data : [data];
  return (
    <>
      {arr.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
