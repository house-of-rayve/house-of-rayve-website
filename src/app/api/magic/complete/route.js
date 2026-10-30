import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { OrderError } from "@/lib/orders";
import { placeMagicOrder } from "@/lib/magic";
import { afterMagicOrder } from "../placed";

// Called by the browser when the checkout window finishes (paid, cash on delivery, or closed): places the order if
// Razorpay says it's paid or placed. Body: { razorpay_order_id, razorpay_payment_id?, razorpay_signature? }
export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const body = await readJson(request);
  const session = await prisma.checkoutSession.findUnique({ where: { razorpayOrderId: String(body.razorpay_order_id ?? "") } });
  if (!session || session.userId !== user.id) return error("Checkout not found.", 404);
  try {
    const result = await placeMagicOrder(session.razorpayOrderId, { paymentId: body.razorpay_payment_id, signature: body.razorpay_signature });
    if (result.open) return json({ open: true });
    if (result.created) afterMagicOrder(result.order);
    return json({ order: { id: result.order.id, orderNumber: result.order.orderNumber } });
  } catch (e) {
    console.error("Magic order failed", e.message);
    return error(e instanceof OrderError ? e.message : "We couldn't confirm your order. If you paid, write to info@houseofrayve.com.", 502);
  }
}
