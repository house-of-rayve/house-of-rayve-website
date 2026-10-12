import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { razorpayEnabled, razorpayKeyId, createRazorpayOrder } from "@/lib/razorpay";

// Starts the Razorpay payment for one of the customer's unpaid online orders
export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  if (!razorpayEnabled()) return error("Online payment isn't available right now.", 503);
  const { orderId } = await readJson(request);
  const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
  if (!order) return error("Order not found.", 404);
  if (order.paymentMethod !== "ONLINE" || order.paymentStatus !== "PENDING" || order.status === "CANCELLED") {
    return error("This order doesn't need a payment.", 409);
  }
  try {
    const rp = await createRazorpayOrder(order.total, order.orderNumber);
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rp.id } });
    return json({
      keyId: razorpayKeyId(),
      razorpayOrderId: rp.id,
      amount: rp.amount,
      currency: rp.currency,
      orderNumber: order.orderNumber,
      customer: { name: user.name, email: user.email, contact: order.shipPhone },
    });
  } catch (e) {
    return error(e.message, 502);
  }
}
