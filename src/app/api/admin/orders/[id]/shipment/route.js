import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize, str } from "@/lib/api";
import { publish } from "@/lib/events";
import { sendOrderEmails } from "@/lib/email";
import { cancelShipment, courierRates, createShipment, ithinkEnabled, shippingLabel, syncShipments } from "@/lib/ithink";

const include = { items: true, user: { select: { id: true, name: true, email: true, phone: true } } };

async function load(params) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return [null, denied];
  if (!ithinkEnabled()) return [null, error("iThink Logistics is not set up. Add ITHINK_ACCESS_TOKEN and ITHINK_SECRET_KEY.", 503)];
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include });
  if (!order) return [null, error("Order not found.", 404)];
  return [order, null];
}

// Couriers that deliver to this order's pincode, with prices
export async function GET(_request, { params }) {
  const [order, denied] = await load(params);
  if (denied) return denied;
  try {
    const cod = order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
    const pairs = order.items.reduce((s, i) => s + i.quantity, 0);
    return json(await courierRates(order.shipPostalCode, { cod, value: order.total, pairs }));
  } catch (e) {
    return error(e.message, 502);
  }
}

// { action: "create", courier? } | { action: "label" } | { action: "track" } | { action: "cancel" }
export async function POST(request, { params }) {
  const [order, denied] = await load(params);
  if (denied) return denied;
  const { action, courier } = await readJson(request);

  try {
    if (action === "create") {
      if (order.awb) return error("This order already has a shipment.", 409);
      if (!["PENDING", "CONFIRMED"].includes(order.status)) return error("Only pending or confirmed orders can be shipped.", 409);
      if (order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID") return error("This online order hasn't been paid.", 409);
      const shipment = await createShipment(order, str(courier).toLowerCase());
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { ...shipment, status: "SHIPPED", shippedAt: new Date(), shipmentStatus: "Shipment booked", shipmentLocation: null, trackedAt: new Date() },
        include,
      });
      publish("order:updated", { id: order.id, orderNumber: order.orderNumber, status: updated.status });
      after(() => sendOrderEmails(updated, "SHIPPED").catch(() => {}));
      return json({ order: updated });
    }

    if (!order.awb) return error("This order hasn't been shipped yet.", 409);

    if (action === "label") return json({ url: await shippingLabel(order.awb) });

    if (action === "track") {
      await syncShipments([order], { force: true });
      return json({ order: await prisma.order.findUnique({ where: { id: order.id }, include }) });
    }

    if (action === "cancel") {
      if (order.status === "DELIVERED") return error("Delivered orders can't have their shipment cancelled.", 409);
      await cancelShipment(order.awb);
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          awb: null, courier: null, trackingUrl: null, shipmentStatus: null, shipmentLocation: null, shippedAt: null, trackedAt: null,
          ...(order.status === "SHIPPED" ? { status: "CONFIRMED" } : {}),
        },
        include,
      });
      publish("order:updated", { id: order.id, orderNumber: order.orderNumber, status: updated.status });
      return json({ order: updated });
    }

    return error("Unknown action.");
  } catch (e) {
    return error(e.message, 502);
  }
}
