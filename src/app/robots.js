import { siteUrl } from "@/lib/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/cart", "/api/", "/compare"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
