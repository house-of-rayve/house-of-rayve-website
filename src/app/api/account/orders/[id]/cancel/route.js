import { prisma } from "@/lib/prisma";
import { json, error, authorize } from "@/lib/api";
import { restockOrder } from "@/lib/orders";
import { publish } from "@/lib/events";
import { invalidateCatalog } from "@/lib/products";

export async function POST(_request, { params }) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: user.id } });
  if (!order) return error("Order not found.", 404);
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    return error("This order can no longer be cancelled.", 409);
  }
  const updated = await prisma.$transaction(async (tx) => {
    await restockOrder(tx, id);
    return tx.order.update({
      where: { id },
      data: { status: "CANCELLED", paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus },
    });
  });
  invalidateCatalog();
  publish("order:updated", { id, orderNumber: order.orderNumber, status: "CANCELLED" });
  return json({ order: updated });
}
