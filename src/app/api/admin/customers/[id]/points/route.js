import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize, str } from "@/lib/api";
import { pointsBalance } from "@/lib/points";

// Admin: add (positive) or remove (negative) RAYVE points for a customer, with a reason
export async function POST(request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const body = await readJson(request);
  const points = Math.trunc(Number(body.points));
  const note = str(body.note).slice(0, 120);
  if (!points || Math.abs(points) > 100000) return error("Enter a number of points, e.g. 100 or -50.");
  if (!note) return error("Add a short reason.");
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) return error("Customer not found.", 404);
  if (points < 0 && (await pointsBalance(id)).available + points < 0) return error("That's more points than the customer has.");
  await prisma.pointsEntry.create({ data: { userId: id, points, kind: "ADJUSTED", note } });
  return json({ balance: await pointsBalance(id) });
}
