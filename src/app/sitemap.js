import { listProducts } from "@/lib/products";
import { siteUrl } from "@/lib/site";

export default async function sitemap() {
  const products = await listProducts();
  const pages = ["", "/shop", "/lookbook", "/try-on", "/about", "/contact", "/terms", "/privacy", "/refund-policy", "/shipping-policy"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
  return [
    ...pages,
    ...products.map((p) => ({ url: `${siteUrl}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.8, images: p.images.slice(0, 1).map((src) => (src.startsWith("http") ? src : `${siteUrl}${src}`)) })),
  ];
}
