import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { restockOrder } from "@/lib/orders";
import { publish } from "@/lib/events";

export async function GET(_request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!order) return error("Order not found.", 404);
  return json({ order });
}

export async function PATCH(request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return error("Order not found.", 404);

  const body = await readJson(request);
  const data = {};
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status)) return error("Invalid order status.");
    if (order.status === "CANCELLED" && body.status !== "CANCELLED") {
      return error("Cancelled orders cannot be reopened.", 409);
    }
    data.status = body.status;
  }
  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) return error("Invalid payment status.");
    data.paymentStatus = body.paymentStatus;
  }
  // COD orders are paid on delivery
  if (data.status === "DELIVERED" && order.paymentMethod === "COD" && !data.paymentStatus) {
    data.paymentStatus = "PAID";
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (data.status === "CANCELLED" && order.status !== "CANCELLED") await restockOrder(tx, id);
    return tx.order.update({
      where: { id },
      data,
      include: { items: true, user: { select: { id: true, name: true, email: true, phone: true } } },
    });
  });
  publish("order:updated", { id, orderNumber: order.orderNumber, status: updated.status });
  return json({ order: updated });
}
