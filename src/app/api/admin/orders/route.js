import { prisma } from "@/lib/prisma";
import { json, authorize } from "@/lib/api";
import { ORDER_STATUSES } from "@/lib/constants";

export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status");
  const q = sp.get("q")?.trim();
  const orders = await prisma.order.findMany({
    where: {
      ...(ORDER_STATUSES.includes(status) ? { status } : {}),
      ...(q
        ? { OR: [{ orderNumber: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }, { user: { email: { contains: q, mode: "insensitive" } } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { items: true } } },
  });
  return json({ orders });
}
