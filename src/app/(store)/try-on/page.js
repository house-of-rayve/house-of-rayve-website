import { listProducts } from "@/lib/products";
import TryOn from "@/components/tryon/TryOn";

export const metadata = {
  title: "Virtual try-on",
  description: "Scan your face to find your face shape and the RAYVE frames that suit it, then try them on live with your camera.",
};

export default async function TryOnPage({ searchParams }) {
  const { p } = await searchParams;
  const products = (await listProducts({ category: "Sunglasses" })).filter((x) => x.images.length);

  return <TryOn products={products} initialSlug={typeof p === "string" ? p : undefined} />;
}
