import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, appOrigin, googleConfigured, redirectUri, safeNext } from "@/lib/google";

// Step 1: send the visitor to Google's consent screen.
export async function GET(request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_unavailable", appOrigin(request)));
  }
  const state = randomBytes(24).toString("hex");
  const next = safeNext(request.nextUrl.searchParams.get("next")) ?? "";

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(url);
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
