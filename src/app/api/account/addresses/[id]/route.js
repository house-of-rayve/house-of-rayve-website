import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize, str } from "@/lib/api";
import { parseAddress } from "@/lib/orders";

async function ownAddress(id, userId) {
  return prisma.address.findFirst({ where: { id, userId } });
}

export async function PATCH(request, { params }) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const { id } = await params;
  if (!(await ownAddress(id, user.id))) return error("Address not found.", 404);

  const body = await readJson(request);
  const parsed = parseAddress(body);
  if (parsed.error) return error(parsed.error);
  const address = await prisma.$transaction(async (tx) => {
    if (body.isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.address.update({
      where: { id },
      data: { ...parsed.data, label: str(body.label) || "Home", ...(body.isDefault ? { isDefault: true } : {}) },
    });
  });
  return json({ address });
}

export async function DELETE(_request, { params }) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const { id } = await params;
  const address = await ownAddress(id, user.id);
  if (!address) return error("Address not found.", 404);
  await prisma.address.delete({ where: { id } });
  if (address.isDefault) {
    const next = await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return json({ ok: true });
}
