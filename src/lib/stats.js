import "server-only";
import { prisma } from "@/lib/prisma";

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats() {
  const today = startOfDay(new Date());
  const rangeStart = new Date(today.getTime() - 13 * DAY);
  const counted = { status: { not: "CANCELLED" } };

  const [
    revenue,
    todayRevenue,
    orderCount,
    todayOrders,
    customerCount,
    newCustomers,
    productCount,
    statusGroups,
    rangeOrders,
    recentOrders,
    lowStock,
    topItems,
  ] = await Promise.all([
    prisma.order.aggregate({ where: counted, _sum: { total: true } }),
    prisma.order.aggregate({ where: { ...counted, createdAt: { gte: today } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: new Date(Date.now() - 30 * DAY) } } }),
    prisma.product.count(),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { ...counted, createdAt: { gte: rangeStart } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true },
    }),
    prisma.orderItem.groupBy({
      by: ["name"],
      where: { order: counted },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const series = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(rangeStart.getTime() + i * DAY);
    return {
      key: day.toDateString(),
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: 0,
      orders: 0,
    };
  });
  const byKey = Object.fromEntries(series.map((s) => [s.key, s]));
  for (const o of rangeOrders) {
    const bucket = byKey[startOfDay(o.createdAt).toDateString()];
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
    }
  }

  const totalRevenue = revenue._sum.total ?? 0;
  const paidOrders = orderCount - (statusGroups.find((g) => g.status === "CANCELLED")?._count._all ?? 0);

  return {
    totals: {
      revenue: totalRevenue,
      todayRevenue: todayRevenue._sum.total ?? 0,
      orders: orderCount,
      todayOrders,
      customers: customerCount,
      newCustomers,
      products: productCount,
      avgOrderValue: paidOrders ? Math.round(totalRevenue / paidOrders) : 0,
    },
    statusBreakdown: Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all])),
    series: series.map(({ key, ...rest }) => rest),
    recentOrders: recentOrders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
    lowStock,
    topProducts: topItems.map((t) => ({ name: t.name, sold: t._sum.quantity ?? 0 })),
    generatedAt: new Date().toISOString(),
  };
}
