import "server-only";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const normaliseCode = (code) => (typeof code === "string" ? code.trim().toUpperCase().replace(/\s+/g, "") : "");

export function discountFor(coupon, subtotal) {
  const raw = coupon.type === "FLAT" ? coupon.value : Math.round((subtotal * coupon.value) / 100);
  return Math.max(0, Math.min(raw, subtotal));
}

export const couponLabel = (c) => (c.type === "FLAT" ? `${formatPrice(c.value)} off` : `${c.value}% off`);

/** Checks a code against a bag subtotal. Returns { coupon, discount } or { error }. */
export async function checkCoupon(code, subtotal, db = prisma) {
  const clean = normaliseCode(code);
  if (!clean) return { error: "Enter a code." };
  const coupon = await db.coupon.findUnique({ where: { code: clean } });
  if (!coupon || !coupon.active) return { error: "This code isn't valid." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "This code has expired." };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { error: "This code has been fully used." };
  if (subtotal < coupon.minSubtotal) return { error: `This code needs a bag of ${formatPrice(coupon.minSubtotal)} or more.` };
  return { coupon, discount: discountFor(coupon, subtotal) };
}

/** Validates admin input for a coupon. Returns { data } or { error }. */
export function parseCouponInput(body = {}) {
  const code = normaliseCode(body.code);
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) return { error: "Code must be 3–24 letters or numbers." };
  const type = body.type === "FLAT" ? "FLAT" : "PERCENT";
  const value = Number(body.value);
  if (!Number.isInteger(value) || value < 1) return { error: "Enter a discount value." };
  if (type === "PERCENT" && value > 90) return { error: "A percentage discount can be at most 90%." };
  const minSubtotal = body.minSubtotal === "" || body.minSubtotal == null ? 0 : Number(body.minSubtotal);
  if (!Number.isInteger(minSubtotal) || minSubtotal < 0) return { error: "Minimum order must be a whole number of rupees." };
  const maxUses = body.maxUses === "" || body.maxUses == null ? null : Number(body.maxUses);
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) return { error: "Usage limit must be 1 or more (or empty for unlimited)." };
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return { error: "Invalid expiry date." };
  return { data: { code, type, value, minSubtotal, maxUses, expiresAt, active: body.active !== false } };
}
