import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Hosts that only show the coming-soon page until launch. Override with the COMING_SOON_HOSTS env var
// (comma-separated); on launch day set it to "off" (any non-matching value) to open the full site on the domain.
const COMING_SOON_HOSTS = (process.env.COMING_SOON_HOSTS ?? "houseofrayve.com,www.houseofrayve.com")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

// When the coming-soon page goes live on those hosts: 11 Oct 2026, 11:25 PM IST (17:55 UTC) — test run.
// Until then they show only the logo (/hold). Override with the COMING_SOON_AT env var (an ISO date).
const COMING_SOON_AT = Date.parse(process.env.COMING_SOON_AT ?? "2026-10-11T17:55:00Z");

const PROTECTED = /^\/(admin|account|checkout)(\/|$)/;

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // Public domain before launch: every page shows the coming-soon page (or, before its launch time, just
  // the logo), nothing else is reachable. The time is checked on every request, so it switches by itself.
  if (COMING_SOON_HOSTS.includes(host)) {
    const live = Date.now() >= COMING_SOON_AT;
    if (pathname.startsWith("/banner/")) return live ? NextResponse.next() : new NextResponse("Not found", { status: 404 }); // banner images stay hidden until launch
    if (pathname === "/api/subscribe" && live) return NextResponse.next();
    if (pathname.startsWith("/api/")) return new NextResponse("Not found", { status: 404 });
    const page = live ? "/coming-soon" : "/hold";
    const response = pathname === page ? NextResponse.next() : NextResponse.rewrite(new URL(page, request.url));
    response.headers.set("Cache-Control", "no-store"); // never serve the logo page from a cache after 4 AM
    return response;
  }

  let response = NextResponse.next();

  // First line of defence for protected pages. API routes and pages re-check on the server.
  if (PROTECTED.test(pathname)) {
    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    const needsLogin = !session || (pathname.startsWith("/admin") && session.role !== "ADMIN");
    if (needsLogin) {
      // Not signed in, or signed in as a customer on an admin page: sign in (again) and come back
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname + search);
      response = NextResponse.redirect(url);
    }
  }

  // Keep the development link (*.vercel.app) out of search engines
  if (host.endsWith(".vercel.app")) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Everything except build assets and static files in /public
  matcher: ["/((?!_next/static|_next/image|favicon|brand/|images/).*)"],
};
