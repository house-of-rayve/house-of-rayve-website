import { NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/auth";
import { publish } from "@/lib/events";
import { GOOGLE_STATE_COOKIE, appOrigin, redirectUri, safeNext } from "@/lib/google";

// Step 2: Google sends the visitor back here with a one-time code.
export async function GET(request) {
  const origin = appOrigin(request);
  const fail = (code) => {
    const res = NextResponse.redirect(new URL(`/login?error=${code}`, origin));
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  };

  const sp = request.nextUrl.searchParams;
  if (sp.get("error")) return fail("google_cancelled");

  let saved = null;
  try {
    saved = JSON.parse(request.cookies.get(GOOGLE_STATE_COOKIE)?.value ?? "null");
  } catch {}
  if (!saved?.state || saved.state !== sp.get("state") || !sp.get("code")) return fail("google_failed");

  // Exchange the code directly with Google (server-to-server over TLS), so the ID token can be trusted.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: sp.get("code"),
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    console.error("[google] token exchange failed", tokenRes.status, await tokenRes.text());
    return fail("google_failed");
  }
  const { id_token } = await tokenRes.json();
  const claims = id_token ? decodeJwt(id_token) : null;
  const validIssuer = ["https://accounts.google.com", "accounts.google.com"].includes(claims?.iss);
  if (!claims || !validIssuer || claims.aud !== process.env.GOOGLE_CLIENT_ID || !claims.sub) return fail("google_failed");
  if (!claims.email || !claims.email_verified) return fail("google_unverified");

  const email = claims.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { googleId: claims.sub } });
  if (!user) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Same verified email already registered: link Google to that account
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: claims.sub, avatarUrl: existing.avatarUrl ?? claims.picture ?? null },
      });
    } else {
      user = await prisma.user.create({
        data: { name: claims.name || email.split("@")[0], email, googleId: claims.sub, avatarUrl: claims.picture ?? null },
      });
      publish("customer:created", { id: user.id, name: user.name });
    }
  }

  await startSession(user);
  const destination = safeNext(saved.next) ?? (user.role === "ADMIN" ? "/admin" : "/account");
  const res = NextResponse.redirect(new URL(destination, origin));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}
