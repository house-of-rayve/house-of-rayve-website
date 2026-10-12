import { listProducts } from "@/lib/products";
import CompareView from "@/components/store/CompareView";

export const metadata = { title: "Compare frames" };

export default async function ComparePage() {
  const products = await listProducts();
  return (
    <div className="container-x pb-20 pt-8 sm:pt-12 lg:pb-28">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Compare</p>
        <h1 className="display-title mt-4 text-3xl sm:text-5xl">Side by side.</h1>
      </div>
      <CompareView products={products} />
    </div>
  );
}
