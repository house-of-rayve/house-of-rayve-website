import { listProducts } from "@/lib/products";
import TryOn from "@/components/tryon/TryOn";

export const metadata = {
  title: "Virtual try-on",
  description: "Scan your face to find your face shape and the RAYVE frames that suit it, then try them on live with your camera.",
};

export default async function TryOnPage({ searchParams }) {
  const { p } = await searchParams;
  const products = (await listProducts({ category: "Sunglasses" })).filter((x) => x.images.length);

  return (
    <div className="container-x pb-20 pt-8 sm:pt-12 lg:pb-28">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="eyebrow">Virtual try-on</p>
        <h1 className="display-title mt-4 text-3xl sm:text-5xl">What suits your face?</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Scan your face and we&apos;ll tell you its shape, show the frames that balance it, and put them on you live. Turn your head to see the fit from every angle.
        </p>
      </div>
      <TryOn products={products} initialSlug={typeof p === "string" ? p : undefined} />
    </div>
  );
}
