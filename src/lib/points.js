import "server-only";
import { prisma } from "@/lib/prisma";
import { pointsFor } from "@/lib/shipping";
import { POINTS_ENABLED } from "@/lib/constants";

// RAYVE points (1 point = ₹1). Every change is a PointsEntry row; see the model in prisma/schema.prisma.
// An order earns points as soon as it's a real order (cash on delivery placed, or paid). They stay PENDING until the
// order is delivered, then become AVAILABLE to spend on any later order, whenever the customer likes.

/** { available, pending } points for a customer. */
export async function pointsBalance(userId, db = prisma) {
  const rows = await db.pointsEntry.groupBy({ by: ["status"], where: { userId }, _sum: { points: true } });
  const sum = (status) => rows.find((r) => r.status === status)?._sum.points ?? 0;
  return { available: Math.max(0, sum("AVAILABLE")), pending: sum("PENDING") };
}

/** Available points for many customers at once: { [userId]: points } */
export async function pointsBalances(userIds) {
  const rows = await prisma.pointsEntry.groupBy({ by: ["userId"], where: { userId: { in: userIds }, status: "AVAILABLE" }, _sum: { points: true } });
  return Object.fromEntries(rows.map((r) => [r.userId, Math.max(0, r._sum.points ?? 0)]));
}

/** Records the points an order earns (once; safe to call again). */
export async function awardOrderPoints(orderId, db = prisma) {
  if (!POINTS_ENABLED) return;
  const order = await db.order.findUnique({ where: { id: orderId }, select: { userId: true, orderNumber: true, subtotal: true, discount: true, status: true } });
  if (!order || order.status === "CANCELLED") return;
  if (await db.pointsEntry.findFirst({ where: { orderId, kind: "EARNED" }, select: { id: true } })) return;
  const points = pointsFor(order.subtotal - order.discount);
  if (!points) return;
  await db.pointsEntry.create({
    data: { userId: order.userId, orderId, points, kind: "EARNED", status: order.status === "DELIVERED" ? "AVAILABLE" : "PENDING", note: `Order ${order.orderNumber}` },
  });
  await db.order.update({ where: { id: orderId }, data: { pointsEarned: points } });
}

/** Makes an order's earned points spendable (when it's delivered). */
export async function releaseOrderPoints(orderId, db = prisma) {
  await db.pointsEntry.updateMany({ where: { orderId, kind: "EARNED", status: "PENDING" }, data: { status: "AVAILABLE" } });
}

/**
 * When an order is cancelled: takes back the points it earned and gives back any points spent on it.
 * Run inside the cancellation transaction.
 */
export async function reverseOrderPoints(tx, orderId) {
  const entries = await tx.pointsEntry.findMany({ where: { orderId } });
  if (!entries.length) return;
  const order = { userId: entries[0].userId, orderNumber: entries[0].note?.match(/RV-\d+/)?.[0] ?? "" };
  for (const e of entries.filter((e) => e.kind === "EARNED")) {
    if (e.status === "PENDING") await tx.pointsEntry.delete({ where: { id: e.id } });
    else if (!entries.some((x) => x.kind === "ADJUSTED" && x.note?.startsWith("Reversed"))) {
      await tx.pointsEntry.create({ data: { userId: order.userId, orderId, points: -e.points, kind: "ADJUSTED", note: `Reversed — order ${order.orderNumber} cancelled` } });
    }
  }
  const spent = -entries.filter((e) => e.kind === "SPENT").reduce((s, e) => s + e.points, 0);
  const refunded = entries.filter((e) => e.kind === "REFUNDED").reduce((s, e) => s + e.points, 0);
  if (spent > refunded) {
    await tx.pointsEntry.create({ data: { userId: order.userId, orderId, points: spent - refunded, kind: "REFUNDED", note: `Order ${order.orderNumber} cancelled` } });
  }
  if (entries.some((e) => e.kind === "EARNED")) await tx.order.update({ where: { id: orderId }, data: { pointsEarned: 0 } });
}
