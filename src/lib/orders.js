import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/format";
import { shippingFor } from "@/lib/shipping";
import { isPhone } from "@/lib/api";
import { normalizePhone, PHONE_ERROR } from "@/lib/phone";
import { checkCoupon } from "@/lib/coupons";
import { razorpayEnabled } from "@/lib/razorpay";

export function newOrderNumber() {
  return `RV-${Date.now().toString().slice(-6)}${randomInt(10, 99)}`;
}

export const ADDRESS_FIELDS = ["fullName", "phone", "line1", "line2", "city", "state", "postalCode", "country"];

export function parseAddress(input = {}) {
  const a = {};
  for (const k of ADDRESS_FIELDS) a[k] = typeof input[k] === "string" ? input[k].trim() : "";
  if (!a.fullName) return { error: "Please enter the recipient's full name." };
  if (!isPhone(a.phone)) return { error: PHONE_ERROR };
  a.phone = normalizePhone(a.phone);
  if (!a.line1) return { error: "Please enter the address." };
  if (!a.city || !a.state) return { error: "Please enter the city and state." };
  if (!/^\d{6}$/.test(a.postalCode)) return { error: "Please enter a valid 6-digit PIN code." };
  a.country = a.country || "India";
  a.line2 = a.line2 || null;
  return { data: a };
}

export class OrderError extends Error {}

// Order transactions run several queries (stock, codes, points); give them room beyond Prisma's 5s default
export const ORDER_TX = { maxWait: 10_000, timeout: 20_000 };

export async function createOrder(userId, { items, address, paymentMethod, notes, couponCode, pointsToUse = 0 }) {
  const quantities = new Map();
  for (const item of items) {
    const qty = Number(item.quantity);
    if (!item.productId || !Number.isInteger(qty) || qty < 1 || qty > 10) throw new OrderError("Invalid cart item.");
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + qty);
  }
  if (!quantities.size) throw new OrderError("Your bag is empty.");

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({ where: { id: { in: [...quantities.keys()] }, isActive: true } });
    if (products.length !== quantities.size) throw new OrderError("Some items in your bag are no longer available.");

    let subtotal = 0;
    const lines = [];
    for (const p of products) {
      const quantity = quantities.get(p.id);
      // Atomic stock check + decrement
      const updated = await tx.product.updateMany({
        where: { id: p.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (!updated.count) throw new OrderError(`Only ${p.stock} left of ${p.name}.`);
      subtotal += p.price * quantity;
      lines.push({ productId: p.id, name: p.name, image: parseImages(p.images)[0] ?? null, price: p.price, quantity });
    }

    // Discount code: checked again here (never trust the browser) and its use counted atomically
    let discount = 0;
    let code = null;
    if (couponCode) {
      const result = await checkCoupon(couponCode, subtotal, tx);
      if (result.error) throw new OrderError(result.error);
      const claimed = await tx.coupon.updateMany({
        where: { id: result.coupon.id, usedCount: result.coupon.usedCount },
        data: { usedCount: { increment: 1 } },
      });
      if (!claimed.count) throw new OrderError("That code was just used up — please try again.");
      discount = result.discount;
      code = result.coupon.code;
    }

    const shippingFee = shippingFor(subtotal - discount, address.postalCode) ?? 0;

    // RAYVE points: lock the customer's row so two orders can't spend the same points, then use up to what they
    // have and what the order costs
    let pointsUsed = 0;
    const wanted = Math.floor(Number(pointsToUse) || 0);
    if (wanted > 0) {
      await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const { _sum } = await tx.pointsEntry.aggregate({ where: { userId, status: "AVAILABLE" }, _sum: { points: true } });
      pointsUsed = Math.max(0, Math.min(wanted, _sum.points ?? 0, subtotal - discount + shippingFee));
    }
    const total = subtotal - discount + shippingFee - pointsUsed;

    // Online orders wait for a verified Razorpay payment before they count as paid / confirmed; an order fully
    // covered by points is paid already
    const coveredByPoints = total === 0;
    const online = !coveredByPoints && paymentMethod === "ONLINE";
    if (online && !razorpayEnabled()) throw new OrderError("Online payment isn't available right now — please choose cash on delivery.");
    const order = await tx.order.create({
      data: {
        orderNumber: newOrderNumber(),
        userId,
        status: coveredByPoints ? "CONFIRMED" : "PENDING",
        paymentMethod: coveredByPoints ? "POINTS" : online ? "ONLINE" : "COD",
        paymentStatus: coveredByPoints ? "PAID" : "PENDING",
        subtotal,
        shippingFee,
        discount,
        couponCode: code,
        pointsUsed,
        total,
        shipName: address.fullName,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipLine2: address.line2,
        shipCity: address.city,
        shipState: address.state,
        shipPostalCode: address.postalCode,
        shipCountry: address.country,
        notes: notes || null,
        items: { create: lines },
      },
      include: { items: true },
    });
    if (pointsUsed) {
      await tx.pointsEntry.create({ data: { userId, orderId: order.id, points: -pointsUsed, kind: "SPENT", note: `Order ${order.orderNumber}` } });
    }
    return order;
  }, ORDER_TX);
}

// Put stock back (and give back a used discount code) when an order is cancelled
export async function restockOrder(tx, orderId) {
  const order = await tx.order.findUnique({ where: { id: orderId }, select: { couponCode: true } });
  if (order?.couponCode) await tx.coupon.updateMany({ where: { code: order.couponCode, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (item.productId) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }
}
