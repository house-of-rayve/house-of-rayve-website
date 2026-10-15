import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, authorize } from "@/lib/api";
import { restockOrder, ORDER_TX } from "@/lib/orders";
import { publish } from "@/lib/events";
import { invalidateCatalog } from "@/lib/products";
import { sendOrderEmails } from "@/lib/email";
import { cancelShipment } from "@/lib/ithink";
import { reverseOrderPoints } from "@/lib/points";

export async function POST(_request, { params }) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: user.id } });
  if (!order) return error("Order not found.", 404);
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    return error("This order can no longer be cancelled.", 409);
  }
  // The courier pickup is booked as soon as the order is placed; cancel it first
  if (order.awb) {
    try {
      await cancelShipment(order.awb);
    } catch {
      return error("We couldn't cancel the courier pickup. Please contact us at info@houseofrayve.com.", 502);
    }
  }
  const updated = await prisma.$transaction(async (tx) => {
    await restockOrder(tx, id);
    await reverseOrderPoints(tx, id);
    return tx.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus,
        ...(order.awb ? { shipmentStatus: "Cancelled", trackedAt: new Date() } : {}),
      },
      include: { items: true, user: { select: { name: true, email: true } } },
    });
  }, ORDER_TX);
  invalidateCatalog();
  publish("order:updated", { id, orderNumber: order.orderNumber, status: "CANCELLED" });
  // No email for an online order abandoned before paying (the customer just closed the payment window)
  if (!(order.paymentMethod === "ONLINE" && order.paymentStatus === "PENDING")) after(() => sendOrderEmails(updated, "CANCELLED").catch(() => {}));
  return json({ order: updated });
}
