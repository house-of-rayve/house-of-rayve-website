import "server-only";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

// Returns [user, null] or [null, errorResponse]
export async function authorize(role) {
  const user = await getCurrentUser();
  if (!user) return [null, error("Please sign in to continue.", 401)];
  if (role && user.role !== role) return [null, error("You do not have access to this resource.", 403)];
  return [user, null];
}

export const str = (v) => (typeof v === "string" ? v.trim() : "");

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v) => /^[+]?[\d\s-]{8,15}$/.test(v);
