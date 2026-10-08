import { prisma } from "@/lib/prisma";
import { checkPassword, startSession } from "@/lib/auth";
import { json, error, readJson, str } from "@/lib/api";

export async function POST(request) {
  const body = await readJson(request);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return error("Email and password are required.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    return error("Incorrect email or password.", 401);
  }
  await startSession(user);
  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
