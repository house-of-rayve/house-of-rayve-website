// Token helpers shared by route handlers and proxy.js (no Node-only imports here).
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "rayve_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}
