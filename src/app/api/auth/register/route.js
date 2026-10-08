import { prisma } from "@/lib/prisma";
import { hashPassword, startSession, publicUserSelect } from "@/lib/auth";
import { json, error, readJson, str, isEmail, isPhone } from "@/lib/api";
import { publish } from "@/lib/events";

export async function POST(request) {
  const body = await readJson(request);
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone);
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) return error("Please enter your name.");
  if (!isEmail(email)) return error("Please enter a valid email address.");
  if (phone && !isPhone(phone)) return error("Please enter a valid phone number.");
  if (password.length < 8) return error("Password must be at least 8 characters.");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return error("An account with this email already exists.", 409);

  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, passwordHash: await hashPassword(password) },
    select: publicUserSelect,
  });
  await startSession(user);
  publish("customer:created", { id: user.id, name: user.name });
  return json({ user }, 201);
}
