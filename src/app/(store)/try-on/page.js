import { listProducts } from "@/lib/products";
import TryOn from "@/components/tryon/TryOn";
import { notFound } from "next/navigation";
import { TRY_ON_ENABLED } from "@/lib/constants";

export const metadata = {
  title: "Virtual try-on",
  description: "Scan your face to find your face shape and the RAYVE frames that suit it, then try them on live with your camera.",
};

export default async function TryOnPage({ searchParams }) {
  if (!TRY_ON_ENABLED) notFound();
  const { p } = await searchParams;
  const products = (await listProducts({ category: "Sunglasses" })).filter((x) => x.images.length);

  return <TryOn products={products} initialSlug={typeof p === "string" ? p : undefined} />;
}
