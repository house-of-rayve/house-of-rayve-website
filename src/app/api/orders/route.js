import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { createOrder, parseAddress, OrderError } from "@/lib/orders";
import { publish } from "@/lib/events";

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
    });
    publish("order:created", { id: order.id, orderNumber: order.orderNumber, total: order.total, customer: user.name });
    return json({ order }, 201);
  } catch (e) {
    if (e instanceof OrderError) return error(e.message, 409);
    throw e;
  }
}
