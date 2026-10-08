import { Suspense } from "react";
import { listProducts } from "@/lib/products";
import ProductCard from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const products = await listProducts({
    category: sp.category,
    shape: sp.shape,
    q: sp.q,
    sort: sp.sort,
  });
  const title = sp.q ? `Results for “${sp.q}”` : sp.category || "All eyewear";

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mb-10">
        <p className="eyebrow">Shop</p>
        <h1 className="display-title mt-3 text-3xl sm:text-4xl">{title}</h1>
      </div>
      <Suspense>
        <ShopFilters count={products.length} />
      </Suspense>
      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted">No frames match your filters.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
