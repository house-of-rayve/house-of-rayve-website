import { prisma } from "@/lib/prisma";
import { publicUserSelect } from "@/lib/auth";
import { json, error, readJson, authorize, str, isEmail, isPhone } from "@/lib/api";
import { publish } from "@/lib/events";
import { normalizePhone, PHONE_ERROR } from "@/lib/phone";

export async function GET() {
  const [user, denied] = await authorize();
  if (denied) return denied;
  return json({ user });
}

export async function PATCH(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const body = await readJson(request);
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = normalizePhone(body.phone) ?? str(body.phone); // stored as the plain 10 digits

  if (!name) return error("Name cannot be empty.");
  if (!isEmail(email)) return error("Please enter a valid email address.");
  if (phone && !isPhone(phone)) return error(PHONE_ERROR);
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return error("This email is already in use.", 409);
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, email, phone: phone || null },
    select: publicUserSelect,
  });
  publish("customer:updated", { id: user.id });
  return json({ user: updated });
}
