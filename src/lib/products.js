import "server-only";
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

const SORTS = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  name: { name: "asc" },
};

export async function listProducts({ category, shape, q, sort = "featured", featured, take } = {}) {
  const where = { isActive: true };
  if (category && CATEGORIES.includes(category)) where.category = category;
  if (shape) where.shape = shape;
  if (featured) where.featured = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { frameColor: { contains: q, mode: "insensitive" } },
    ];
  }
  const orderBy = SORTS[sort] ?? [{ featured: "desc" }, { createdAt: "desc" }];
  const products = await prisma.product.findMany({ where, orderBy, take });
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) return null;
  return serializeProduct(product);
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
