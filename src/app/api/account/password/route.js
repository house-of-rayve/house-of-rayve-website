import { prisma } from "@/lib/prisma";
import { checkPassword, hashPassword } from "@/lib/auth";
import { json, error, readJson, authorize } from "@/lib/api";

export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const { currentPassword = "", newPassword = "" } = await readJson(request);
  if (newPassword.length < 8) return error("New password must be at least 8 characters.");
  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!(await checkPassword(currentPassword, record.passwordHash))) return error("Current password is incorrect.", 401);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
  return json({ ok: true });
}
