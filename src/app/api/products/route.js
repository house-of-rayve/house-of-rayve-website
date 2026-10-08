import { listProducts } from "@/lib/products";
import { json } from "@/lib/api";

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const products = await listProducts({
    category: sp.get("category") || undefined,
    shape: sp.get("shape") || undefined,
    q: sp.get("q") || undefined,
    sort: sp.get("sort") || undefined,
    featured: sp.get("featured") === "1",
  });
  return json({ products });
}
