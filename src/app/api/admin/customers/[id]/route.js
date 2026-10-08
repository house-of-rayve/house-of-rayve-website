import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize, str, isEmail, isPhone } from "@/lib/api";
import { parseAddress } from "@/lib/orders";
import { publish } from "@/lib/events";

const select = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
  orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
};

export async function GET(_request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const customer = await prisma.user.findUnique({ where: { id }, select });
  if (!customer) return error("Customer not found.", 404);
  return json({ customer });
}

// Body: { name, email, phone, address?: { id?, ...fields } }
export async function PATCH(request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return error("Customer not found.", 404);

  const body = await readJson(request);
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone);
  if (!name) return error("Name cannot be empty.");
  if (!isEmail(email)) return error("Please enter a valid email address.");
  if (phone && !isPhone(phone)) return error("Please enter a valid phone number.");
  if (email !== existing.email && (await prisma.user.findUnique({ where: { email } }))) {
    return error("This email is already in use.", 409);
  }

  let address = null;
  if (body.address) {
    const parsed = parseAddress(body.address);
    if (parsed.error) return error(parsed.error);
    address = parsed.data;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { name, email, phone: phone || null } });
    if (!address) return;
    const target = body.address.id
      ? await tx.address.findFirst({ where: { id: body.address.id, userId: id } })
      : null;
    if (target) {
      await tx.address.update({ where: { id: target.id }, data: address });
    } else {
      const count = await tx.address.count({ where: { userId: id } });
      await tx.address.create({ data: { ...address, userId: id, isDefault: count === 0 } });
    }
  });

  publish("customer:updated", { id });
  const customer = await prisma.user.findUnique({ where: { id }, select });
  return json({ customer });
}
