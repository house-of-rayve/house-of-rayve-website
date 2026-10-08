import { getProductBySlug } from "@/lib/products";
import { json, error } from "@/lib/api";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return error("Product not found.", 404);
  return json({ product });
}
