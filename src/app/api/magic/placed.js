import "server-only";
import { after } from "next/server";
import { publish } from "@/lib/events";
import { invalidateCatalog } from "@/lib/products";
import { sendOrderEmails } from "@/lib/email";
import { autoShip } from "@/lib/ithink";
import { awardOrderPoints } from "@/lib/points";

/** What follows a new Magic Checkout order: live dashboards, stock, points, courier booking and the emails. */
export function afterMagicOrder(order) {
  invalidateCatalog();
  publish("order:created", { id: order.id, orderNumber: order.orderNumber, total: order.total, customer: order.user?.name });
  after(async () => {
    await awardOrderPoints(order.id).catch((e) => console.error("Points award failed", e.message));
    await sendOrderEmails((await autoShip(order.id)) ?? order, "placed").catch(() => {});
  });
}
