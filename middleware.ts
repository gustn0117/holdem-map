import { NextRequest, NextResponse } from "next/server";

const PRIMARY_HOST = "holdemmapkorea.com";

const REDIRECT_HOSTS = new Set<string>([
  "www.holdemmapkorea.com",
  "holdemmapkorea.co.kr",
  "www.holdemmapkorea.co.kr",
  "holdem-map.hsweb.pics",
]);

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() ?? "";
  if (!REDIRECT_HOSTS.has(host)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.host = PRIMARY_HOST;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/|favicon|icon|logo|posters/|avatars/|banners/|tournament-banner|event-banner|api/|sitemap.xml|robots.txt|manifest.json|sw.js).*)"],
};
