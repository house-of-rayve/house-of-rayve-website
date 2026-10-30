import { NextResponse } from "next/server";
import { placeMagicOrder, verifyWebhook } from "@/lib/magic";
import { afterMagicOrder } from "../placed";

// Razorpay webhook (Dashboard → Account & Settings → Webhooks, events order.paid and order.placed or payment.pending, with
// RAZORPAY_WEBHOOK_SECRET as the secret). Places the order even if the customer closed the browser before it reported back.
export async function POST(request) {
  const raw = await request.text();
  if (!verifyWebhook(raw, request.headers.get("x-razorpay-signature"))) return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }
  // order.* events carry the order; payment.* events (payment.pending is cash on delivery) carry its order_id
  const orderId = event?.payload?.order?.entity?.id ?? event?.payload?.payment?.entity?.order_id;
  if (!["order.paid", "order.placed", "payment.captured", "payment.pending"].includes(event?.event) || !orderId) return NextResponse.json({ ok: true });
  try {
    const result = await placeMagicOrder(orderId, { paymentId: event.payload?.payment?.entity?.id });
    if (result.created) afterMagicOrder(result.order);
  } catch (e) {
    // Not one of ours (e.g. a standard-checkout order) or a temporary failure; Razorpay retries failed deliveries
    if (!/Checkout not found/.test(e.message)) return NextResponse.json({ error: "Try again" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
