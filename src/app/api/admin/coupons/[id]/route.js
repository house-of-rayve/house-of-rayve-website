import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";

// Toggle a code on/off
export async function PATCH(request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  if (typeof body.active !== "boolean") return error("Nothing to update.");
  const coupon = await prisma.coupon.update({ where: { id }, data: { active: body.active } }).catch(() => null);
  if (!coupon) return error("Code not found.", 404);
  return json({ coupon });
}

export async function DELETE(_request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const deleted = await prisma.coupon.delete({ where: { id } }).catch(() => null);
  if (!deleted) return error("Code not found.", 404);
  return json({ ok: true });
}
