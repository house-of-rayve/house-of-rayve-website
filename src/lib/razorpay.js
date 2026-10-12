import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Razorpay (UPI, cards, netbanking). Online payment is offered only when both keys are set in the environment.
const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const razorpayEnabled = () => Boolean(KEY_ID && KEY_SECRET);
export const razorpayKeyId = () => KEY_ID;

/** Creates a Razorpay order for `amount` rupees. */
export async function createRazorpayOrder(amount, receipt) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt }), // paise
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.description ?? "Could not start the payment.");
  return data;
}

/** Razorpay signs `order_id|payment_id` with the key secret; anything else is not a real payment. */
export function verifyRazorpaySignature(razorpayOrderId, paymentId, signature) {
  if (!razorpayOrderId || !paymentId || typeof signature !== "string") return false;
  const expected = createHmac("sha256", KEY_SECRET).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
