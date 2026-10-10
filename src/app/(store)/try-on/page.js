import { listProducts } from "@/lib/products";
import TryOn from "@/components/tryon/TryOn";

export const metadata = {
  title: "Virtual try-on",
  description: "Try RAYVE frames on live with your camera, and find the shapes that suit your face.",
};

export default async function TryOnPage({ searchParams }) {
  const { p } = await searchParams;
  const products = (await listProducts({ category: "Sunglasses" })).filter((x) => x.images.length);

  return (
    <div className="container-x pb-20 pt-8 sm:pt-12 lg:pb-28">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="eyebrow">Virtual try-on</p>
        <h1 className="display-title mt-4 text-3xl sm:text-5xl">Try it on.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Switch frames in real time, turn your head to see the fit from every angle, and get a quick read of your face shape.
        </p>
      </div>
      <TryOn products={products} initialSlug={typeof p === "string" ? p : undefined} />
    </div>
  );
}
