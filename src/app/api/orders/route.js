import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { createOrder, parseAddress, OrderError } from "@/lib/orders";
import { publish } from "@/lib/events";
import { invalidateCatalog } from "@/lib/products";
import { sendOrderEmails } from "@/lib/email";
import { autoShip } from "@/lib/ithink";
import { awardOrderPoints } from "@/lib/points";

export async function GET() {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return json({ orders });
}

export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const body = await readJson(request);

  let address;
  if (body.addressId) {
    address = await prisma.address.findFirst({ where: { id: body.addressId, userId: user.id } });
    if (!address) return error("Selected address was not found.");
  } else {
    const parsed = parseAddress(body.address);
    if (parsed.error) return error(parsed.error);
    address = parsed.data;
    if (body.saveAddress) {
      const count = await prisma.address.count({ where: { userId: user.id } });
      await prisma.address.create({ data: { ...address, userId: user.id, isDefault: count === 0 } });
    }
  }

  try {
    const order = await createOrder(user.id, {
      items: Array.isArray(body.items) ? body.items : [],
      address,
      paymentMethod: body.paymentMethod,
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : "",
      couponCode: typeof body.couponCode === "string" ? body.couponCode : "",
      pointsToUse: body.pointsToUse,
    });
    invalidateCatalog();
    publish("order:created", { id: order.id, orderNumber: order.orderNumber, total: order.total, customer: user.name });
    // Cash on delivery (and orders paid in full with points) earn their RAYVE points and go to the courier now — online
    // orders once paid — then the customer is emailed with the tracking link. All after the response, so the checkout
    // never waits on it.
    if (order.paymentMethod !== "ONLINE") {
      after(async () => {
        await awardOrderPoints(order.id).catch((e) => console.error("Points award failed", e.message));
        await sendOrderEmails((await autoShip(order.id)) ?? { ...order, user: { name: user.name, email: user.email } }, "placed").catch(() => {});
      });
    }
    return json({ order }, 201);
  } catch (e) {
    if (e instanceof OrderError) return error(e.message, 409);
    throw e;
  }
}
