import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";

// Approve or hide a review
export async function PATCH(request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const { approved } = await readJson(request);
  if (typeof approved !== "boolean") return error("Nothing to update.");
  const review = await prisma.review.update({ where: { id }, data: { approved } }).catch(() => null);
  if (!review) return error("Review not found.", 404);
  return json({ review });
}

export async function DELETE(_request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const deleted = await prisma.review.delete({ where: { id } }).catch(() => null);
  if (!deleted) return error("Review not found.", 404);
  return json({ ok: true });
}
