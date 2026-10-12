import { json, error, readJson } from "@/lib/api";
import { checkCoupon, couponLabel } from "@/lib/coupons";

// Lets the checkout show a discount before the order is placed (the order route checks again)
export async function POST(request) {
  const body = await readJson(request);
  const subtotal = Number(body.subtotal);
  if (!Number.isFinite(subtotal) || subtotal < 0) return error("Invalid bag total.");
  const result = await checkCoupon(body.code, subtotal);
  if (result.error) return error(result.error, 422);
  return json({ code: result.coupon.code, discount: result.discount, label: couponLabel(result.coupon) });
}
