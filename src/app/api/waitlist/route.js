import { prisma } from "@/lib/prisma";
import { json, error, authorize, readJson } from "@/lib/api";
import { publish } from "@/lib/events";

// The frames the signed-in shopper is already waiting for (so the button can say so)
export async function GET() {
  const [user, denied] = await authorize();
  if (denied) return json({ productIds: [] });
  const rows = await prisma.waitlistEntry.findMany({ where: { userId: user.id }, select: { productId: true } });
  return json({ productIds: rows.map((r) => r.productId) });
}

// Joins the waitlist for a frame, keeping the shopper's name, email and phone as they are now
export async function POST(request) {
  const [user, denied] = await authorize();
  if (denied) return denied;
  const { productId, color } = await readJson(request);
  const product = typeof productId === "string" ? await prisma.product.findUnique({ where: { id: productId }, select: { id: true, name: true, colors: true } }) : null;
  if (!product) return error("That frame wasn't found.", 404);
  // Keep the colour's name, but only one this frame actually comes in
  let colorName = null;
  try {
    colorName = JSON.parse(product.colors || "[]").find((c) => c.code === color)?.name ?? null;
  } catch {}

  const existing = await prisma.waitlistEntry.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } });
  if (existing) return json({ joined: true, already: true, email: user.email });
  await prisma.waitlistEntry.create({
    data: { userId: user.id, productId: product.id, name: user.name, email: user.email, phone: user.phone ?? null, color: colorName },
  });
  publish("waitlist:joined", { productId: product.id });
  return json({ joined: true, already: false, email: user.email }, 201);
}
