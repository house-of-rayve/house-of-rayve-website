import { prisma } from "@/lib/prisma";
import { json, error, readJson, authorize } from "@/lib/api";
import { parseProductInput, serializeProduct } from "@/lib/products";
import { publish } from "@/lib/events";

export async function GET(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const products = await prisma.product.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return json({ products: products.map(serializeProduct) });
}

export async function POST(request) {
  const [, denied] = await authorize("ADMIN");
  if (denied) return denied;
  const { data, error: invalid } = parseProductInput(await readJson(request));
  if (invalid) return error(invalid);
  if (await prisma.product.findUnique({ where: { slug: data.slug } })) {
    return error("A product with this URL slug already exists.", 409);
  }
  const product = await prisma.product.create({ data });
  publish("product:changed", { id: product.id });
  return json({ product: serializeProduct(product) }, 201);
}
