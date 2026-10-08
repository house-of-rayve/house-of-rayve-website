import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "@/lib/session";

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
};

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function checkPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function startSession(user) {
  const token = await signSession({ sub: user.id, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session?.sub) return null;
  return prisma.user.findUnique({ where: { id: session.sub }, select: publicUserSelect });
}

// For server components / pages
export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/login?next=/admin");
  return user;
}
