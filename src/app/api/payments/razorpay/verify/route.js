import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { publish } from "@/lib/events";
import { sendOrderEmails } from "@/lib/email";
import { autoShip } from "@/lib/ithink";
import { awardOrderPoints } from "@/lib/points";

// Called by the checkout after Razorpay reports success; only a valid signature marks the order paid
export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const body = await readJson(request);
  const order = await prisma.order.findFirst({ where: { id: body.orderId, userId: user.id } });
  if (!order) return error("Order not found.", 404);
  if (order.paymentStatus === "PAID") return json({ order });
  if (!order.razorpayOrderId || order.razorpayOrderId !== body.razorpay_order_id) return error("Payment doesn't match this order.", 400);
  if (!verifyRazorpaySignature(order.razorpayOrderId, body.razorpay_payment_id, body.razorpay_signature)) {
    return error("We couldn't verify this payment.", 400);
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: body.razorpay_payment_id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  publish("order:updated", { id: order.id, orderNumber: order.orderNumber, status: "CONFIRMED" });
  // Book the courier, then email the customer with the tracking link — after the response, so it never slows the checkout
  after(async () => {
    await awardOrderPoints(order.id).catch((e) => console.error("Points award failed", e.message));
    await sendOrderEmails((await autoShip(order.id)) ?? updated, "placed").catch(() => {});
  });
  return json({ order: updated });
}
