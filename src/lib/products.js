import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseImages, slugify } from "@/lib/format";
import { CATEGORIES } from "@/lib/constants";

export function serializeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    images: parseImages(p.images),
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
  };
}

export const CATALOG_TAG = "catalog";

// All visible products, cached across requests. Invalidated by invalidateCatalog()
// whenever products, stock or orders change, so the storefront never hits the database per view.
const getCatalog = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return products.map(serializeProduct);
  },
  ["catalog-v1"],
  { tags: [CATALOG_TAG], revalidate: 600 },
);

export function invalidateCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
};

export async function listProducts({ category, shape, q, sort, featured, take } = {}) {
  let products = await getCatalog();
  if (category && CATEGORIES.includes(category)) products = products.filter((p) => p.category === category);
  if (shape) products = products.filter((p) => p.shape === shape);
  if (featured) products = products.filter((p) => p.featured);
  if (q) {
    const needle = q.toLowerCase();
    products = products.filter((p) =>
      [p.name, p.tagline, p.description, p.frameColor, p.shape, p.lensColor]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(needle)),
    );
  }
  if (SORTERS[sort]) products = [...products].sort(SORTERS[sort]);
  return take ? products.slice(0, take) : products;
}

export async function getProductBySlug(slug) {
  return (await getCatalog()).find((p) => p.slug === slug) ?? null;
}

// Validates admin input; returns { data } or { error }
export function parseProductInput(body, { partial = false } = {}) {
  const data = {};
  const text = (k) => (typeof body[k] === "string" ? body[k].trim() : undefined);
  const has = (k) => body[k] !== undefined;

  if (!partial || has("name")) {
    const name = text("name");
    if (!name) return { error: "Product name is required." };
    data.name = name;
  }
  if (!partial || has("description")) {
    const description = text("description");
    if (!description) return { error: "Description is required." };
    data.description = description;
  }
  if (has("slug") || data.name) {
    const slug = slugify(text("slug") || data.name || "");
    if (slug) data.slug = slug;
  }
  for (const k of ["tagline", "shape", "frameColor", "lensColor", "material"]) {
    if (has(k)) data[k] = text(k) || null;
  }
  if (has("category")) {
    if (!CATEGORIES.includes(body.category)) return { error: "Invalid category." };
    data.category = body.category;
  }
  if (!partial || has("price")) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) return { error: "Price must be greater than zero." };
    data.price = Math.round(price);
  }
  if (has("comparePrice")) {
    const cp = body.comparePrice === "" || body.comparePrice === null ? null : Number(body.comparePrice);
    if (cp !== null && (!Number.isFinite(cp) || cp < 0)) return { error: "Invalid compare-at price." };
    data.comparePrice = cp === null ? null : Math.round(cp);
  }
  if (!partial || has("stock")) {
    const stock = Number(body.stock ?? 0);
    if (!Number.isInteger(stock) || stock < 0) return { error: "Stock must be a whole number." };
    data.stock = stock;
  }
  if (has("images")) {
    const images = Array.isArray(body.images) ? body.images.filter((i) => typeof i === "string" && i) : [];
    data.images = JSON.stringify(images);
  }
  if (has("featured")) data.featured = Boolean(body.featured);
  if (has("isActive")) data.isActive = Boolean(body.isActive);
  return { data };
}
