import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/format";
import { shippingFor } from "@/lib/constants";
import { isPhone } from "@/lib/api";

export function newOrderNumber() {
  return `RV-${Date.now().toString().slice(-6)}${randomInt(10, 99)}`;
}

export const ADDRESS_FIELDS = ["fullName", "phone", "line1", "line2", "city", "state", "postalCode", "country"];

export function parseAddress(input = {}) {
  const a = {};
  for (const k of ADDRESS_FIELDS) a[k] = typeof input[k] === "string" ? input[k].trim() : "";
  if (!a.fullName) return { error: "Please enter the recipient's full name." };
  if (!isPhone(a.phone)) return { error: "Please enter a valid phone number." };
  if (!a.line1) return { error: "Please enter the address." };
  if (!a.city || !a.state) return { error: "Please enter the city and state." };
  if (!/^\d{6}$/.test(a.postalCode)) return { error: "Please enter a valid 6-digit PIN code." };
  a.country = a.country || "India";
  a.line2 = a.line2 || null;
  return { data: a };
}

export class OrderError extends Error {}

export async function createOrder(userId, { items, address, paymentMethod, notes }) {
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

    const shippingFee = shippingFor(subtotal);
    const online = paymentMethod === "ONLINE";
    return tx.order.create({
      data: {
        orderNumber: newOrderNumber(),
        userId,
        status: online ? "CONFIRMED" : "PENDING",
        paymentMethod: online ? "ONLINE" : "COD",
        paymentStatus: online ? "PAID" : "PENDING",
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
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
  });
}

// Put stock back when an order is cancelled
export async function restockOrder(tx, orderId) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (item.productId) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }
}
