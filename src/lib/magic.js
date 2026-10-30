import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { checkCoupon } from "@/lib/coupons";
import { newOrderNumber, OrderError, ORDER_TX } from "@/lib/orders";
import { razorpayEnabled, razorpayKeyId, verifyRazorpaySignature } from "@/lib/razorpay";
import { deliveryEstimate, ithinkEnabled } from "@/lib/ithink";
import { isValidPin, shippingFor } from "@/lib/shipping";
import { matchState } from "@/lib/india";
import { normalizePhone } from "@/lib/phone";

// Razorpay Magic Checkout: Razorpay's one-click checkout collects the address, discount code and payment (or cash on
// delivery) in its own window, and calls our endpoints for shipping charges and codes while it's open. Switched on
// with RAZORPAY_MAGIC_CHECKOUT=on once Razorpay has enabled it on the account; otherwise the site's own checkout runs.
// Docs: https://razorpay.com/docs/payments/magic-checkout/web/

export const magicCheckoutEnabled = () => razorpayEnabled() && process.env.RAZORPAY_MAGIC_CHECKOUT === "on";

const auth = () => `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`;
const paise = (rupees) => Math.round(rupees * 100);
const rupees = (p) => Math.round((Number(p) || 0) / 100);

async function razorpay(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method,
    headers: { Authorization: auth(), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.description ?? `Razorpay error (${res.status}).`);
  return data;
}

/** Reads a request body from Razorpay's callbacks, which may arrive as GET with a JSON body, or POST. */
export async function readCallback(request) {
  try {
    const text = await request.text();
    if (text) return JSON.parse(text);
  } catch {}
  return Object.fromEntries(new URL(request.url).searchParams);
}

/**
 * Starts Magic Checkout for a signed-in customer's bag: checks stock and prices, remembers the bag, and creates the
 * Razorpay order with its line items. Returns what the browser needs to open the checkout window.
 */
export async function startMagicCheckout(user, items) {
  const quantities = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const qty = Number(item.quantity);
    if (!item.productId || !Number.isInteger(qty) || qty < 1 || qty > 10) throw new OrderError("Invalid cart item.");
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + qty);
  }
  if (!quantities.size) throw new OrderError("Your bag is empty.");

  const products = await prisma.product.findMany({ where: { id: { in: [...quantities.keys()] }, isActive: true } });
  if (products.length !== quantities.size) throw new OrderError("Some items in your bag are no longer available.");
  let subtotal = 0;
  const lineItems = products.map((p) => {
    const quantity = quantities.get(p.id);
    if (p.stock < quantity) throw new OrderError(`Only ${p.stock} left of ${p.name}.`);
    subtotal += p.price * quantity;
    const image = parseImages(p.images)[0];
    return {
      sku: p.slug,
      variant_id: p.id,
      price: paise(p.comparePrice > p.price ? p.comparePrice : p.price),
      offer_price: paise(p.price),
      quantity,
      name: p.name,
      description: [p.shape, p.frameColor].filter(Boolean).join(" · ") || p.name,
      weight: 500,
      dimensions: { length: "20", width: "12", height: "8" },
      image_url: image ? new URL(image, siteUrl).href : undefined,
      product_url: `${siteUrl}/product/${p.slug}`,
    };
  });

  const session = await prisma.checkoutSession.create({
    data: { userId: user.id, items: JSON.stringify([...quantities].map(([productId, quantity]) => ({ productId, quantity }))), subtotal },
  });
  // line_items_total is what switches the order to Magic Checkout
  const order = await razorpay("orders", {
    method: "POST",
    body: { amount: paise(subtotal), currency: "INR", receipt: session.id, line_items_total: paise(subtotal), line_items: lineItems, notes: { checkout: session.id } },
  });
  await prisma.checkoutSession.update({ where: { id: session.id }, data: { razorpayOrderId: order.id } });
  return { keyId: razorpayKeyId(), razorpayOrderId: order.id };
}

/** Shipping options for the addresses in the checkout window (free in Delhi NCR, by order value elsewhere). */
export async function shippingOptions({ order_id, addresses = [] }) {
  const session = order_id ? await prisma.checkoutSession.findUnique({ where: { id: String(order_id) } }) : null;
  const value = session?.subtotal ?? 1000;
  const results = await Promise.all(
    addresses.map(async (a) => {
      const pin = String(a.zipcode ?? "");
      let serviceable = isValidPin(pin);
      let cod = serviceable;
      // Ask the courier, but never let a slow answer hold up the checkout window (it gives up after 10s)
      if (serviceable && ithinkEnabled()) {
        const estimate = await Promise.race([deliveryEstimate(pin, value).catch(() => null), new Promise((r) => setTimeout(() => r(null), 6000))]);
        if (estimate) ({ serviceable, cod } = { serviceable: estimate.serviceable, cod: estimate.serviceable && estimate.cod });
      }
      const fee = shippingFor(value, pin) ?? 0;
      return {
        id: a.id,
        zipcode: pin,
        country: a.country ?? "IN",
        shipping_methods: [
          {
            id: "standard",
            name: fee ? "Standard delivery" : "Free delivery",
            description: fee ? "Delivered by our courier partner" : "Free across Delhi NCR",
            serviceable,
            shipping_fee: paise(fee),
            cod,
            cod_fee: 0,
          },
        ],
      };
    }),
  );
  return { addresses: results };
}

/** Applies a discount code typed in the checkout window. */
export async function applyPromotion({ order_id, code }) {
  const session = order_id ? await prisma.checkoutSession.findUnique({ where: { id: String(order_id) } }) : null;
  if (!session) return { failure_code: "INVALID_PROMOTION", failure_reason: "This checkout has expired. Please start again." };
  const result = await checkCoupon(code, session.subtotal);
  if (result.error) return { failure_code: /needs a bag/.test(result.error) ? "REQUIREMENT_NOT_MET" : "INVALID_PROMOTION", failure_reason: result.error };
  return {
    promotion: {
      reference_id: result.coupon.id,
      type: "coupon",
      code: result.coupon.code,
      value: paise(result.discount),
      value_type: "fixed_amount",
      description: result.coupon.type === "PERCENT" ? `${result.coupon.value}% off` : `₹${result.coupon.value} off`,
    },
  };
}

/** Razorpay signs webhooks with the webhook secret set in the Dashboard. */
export function verifyWebhook(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || typeof signature !== "string") return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"));
  const got = Buffer.from(signature);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

const withItems = { items: true, user: { select: { id: true, name: true, email: true, phone: true } } };

/**
 * Turns a finished Magic Checkout into an order: reads the address, discount, shipping and payment from Razorpay
 * (never from the browser), takes the stock and records the order. Safe to call more than once for the same checkout —
 * the browser and the webhook may both report it. Returns { order, created } or { open: true } if it isn't finished.
 */
export async function placeMagicOrder(razorpayOrderId, { paymentId, signature } = {}) {
  const session = await prisma.checkoutSession.findUnique({ where: { razorpayOrderId } });
  if (!session) throw new OrderError("Checkout not found.");
  if (session.orderId) return { order: await prisma.order.findUnique({ where: { id: session.orderId }, include: withItems }), created: false };

  // The browser's signature is checked when it sends one; the order's status itself always comes from Razorpay below
  if (paymentId && signature && !verifyRazorpaySignature(razorpayOrderId, paymentId, signature)) throw new OrderError("We couldn't verify this payment.");
  const rz = await razorpay(`orders/${razorpayOrderId}`);
  const paid = rz.status === "paid";
  if (!paid && rz.status !== "placed") return { open: true };
  if (!paymentId && paid) {
    const payments = await razorpay(`orders/${razorpayOrderId}/payments`).catch(() => null);
    paymentId = payments?.items?.find((p) => p.status === "captured" || p.status === "authorized")?.id;
  }

  const a = rz.customer_details?.shipping_address ?? {};
  const items = JSON.parse(session.items);
  const promotion = rz.promotions?.[0];
  const discount = (rz.promotions ?? []).reduce((s, p) => s + rupees(p.value), 0);
  const shippingFee = rupees(rz.shipping_fee) + rupees(rz.cod_fee);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
      const lines = [];
      for (const { productId, quantity } of items) {
        const p = products.find((x) => x.id === productId);
        if (!p) continue;
        // The customer has already paid or committed, so the order stands even if stock ran out meanwhile
        await tx.product.update({ where: { id: p.id }, data: { stock: { decrement: Math.min(quantity, Math.max(p.stock, 0)) } } });
        lines.push({ productId: p.id, name: p.name, image: parseImages(p.images)[0] ?? null, price: p.price, quantity });
      }
      if (promotion?.code) await tx.coupon.updateMany({ where: { code: String(promotion.code).toUpperCase() }, data: { usedCount: { increment: 1 } } });
      const created = await tx.order.create({
        data: {
          orderNumber: newOrderNumber(),
          userId: session.userId,
          status: paid ? "CONFIRMED" : "PENDING",
          paymentMethod: paid ? "ONLINE" : "COD",
          paymentStatus: paid ? "PAID" : "PENDING",
          subtotal: session.subtotal,
          shippingFee,
          discount,
          couponCode: promotion?.code ? String(promotion.code).toUpperCase() : null,
          total: rupees(rz.amount),
          razorpayOrderId,
          razorpayPaymentId: paymentId ?? null,
          shipName: a.name || "Customer",
          shipPhone: normalizePhone(a.contact ?? rz.customer_details?.contact) ?? String(a.contact ?? ""),
          shipLine1: a.line1 || "",
          shipLine2: a.line2 || null,
          shipCity: a.city || "",
          shipState: matchState(a.state) ?? a.state ?? "",
          shipPostalCode: String(a.zipcode ?? ""),
          shipCountry: "India",
          notes: rz.order_instruction || null,
          items: { create: lines },
        },
        include: withItems,
      });
      // Claim the checkout; if the webhook got here first this fails and everything above is rolled back
      const claimed = await tx.checkoutSession.updateMany({ where: { id: session.id, orderId: null }, data: { orderId: created.id } });
      if (!claimed.count) throw new Error("already-placed");
      return created;
    }, ORDER_TX);
    return { order, created: true };
  } catch (e) {
    if (e.message !== "already-placed") throw e;
    const again = await prisma.checkoutSession.findUnique({ where: { id: session.id } });
    return { order: await prisma.order.findUnique({ where: { id: again.orderId }, include: withItems }), created: false };
  }
}

