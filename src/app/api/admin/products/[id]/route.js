import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { parseProductInput, serializeProduct, invalidateCatalog } from "@/lib/products";
import { publish } from "@/lib/events";

export async function GET(_request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return error("Product not found.", 404);
  return json({ product: serializeProduct(product) });
}

export async function PATCH(request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return error("Product not found.", 404);

  const { data, error: invalid } = parseProductInput(await readJson(request), { partial: true });
  if (invalid) return error(invalid);
  if (data.slug && data.slug !== existing.slug) {
    if (await prisma.product.findUnique({ where: { slug: data.slug } })) {
      return error("A product with this URL slug already exists.", 409);
    }
  }
  const product = await prisma.product.update({ where: { id }, data });
  invalidateCatalog();
  publish("product:changed", { id });
  return json({ product: serializeProduct(product) });
}

export async function DELETE(_request, { params }) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return error("Product not found.", 404);
  // Past orders keep their own snapshot of name/price/image, so deleting is safe.
  await prisma.product.delete({ where: { id } });
  invalidateCatalog();
  publish("product:changed", { id });
  return json({ ok: true });
}
