import { prisma } from "@/lib/prisma";
import { json, authorize } from "@/lib/api";

export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      addresses: { where: { isDefault: true }, take: 1 },
      orders: { select: { total: true, status: true } },
    },
  });
  return json({
    customers: customers.map(({ orders, addresses, ...c }) => ({
      ...c,
      address: addresses[0] ?? null,
      orderCount: orders.length,
      totalSpent: orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0),
    })),
  });
}
