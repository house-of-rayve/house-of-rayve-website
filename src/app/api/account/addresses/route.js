import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize, str } from "@/lib/api";
import { parseAddress } from "@/lib/orders";

export async function GET() {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return json({ addresses });
}

export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const body = await readJson(request);
  const parsed = parseAddress(body);
  if (parsed.error) return error(parsed.error);

  const count = await prisma.address.count({ where: { userId: user.id } });
  const isDefault = count === 0 || Boolean(body.isDefault);
  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.address.create({ data: { ...parsed.data, label: str(body.label) || "Home", isDefault, userId: user.id } });
  });
  return json({ address }, 201);
}
