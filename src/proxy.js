import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// First line of defence for protected pages. API routes and pages re-check on the server.
export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    // Signed in as a customer: send them to sign in with an admin account instead
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
