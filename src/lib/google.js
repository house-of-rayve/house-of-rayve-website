import "server-only";

export const GOOGLE_STATE_COOKIE = "rayve_google_state";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// Public base URL of the site; must match an "Authorized redirect URI" in Google Cloud.
export function appOrigin(request) {
  return (process.env.APP_URL || request.nextUrl.origin).replace(/\/$/, "");
}

export function redirectUri(request) {
  return `${appOrigin(request)}/api/auth/google/callback`;
}

export function safeNext(next) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null;
}
