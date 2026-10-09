"use client";

import { recentStore } from "@/components/wishlist/WishlistProvider";
import { useLocalStore } from "@/components/ui/localStore";
import ProductCard from "./ProductCard";

export default function RecentlyViewed({ excludeId }) {
  const items = useLocalStore(recentStore).filter((p) => p.id !== excludeId).slice(0, 4);
  if (!items.length) return null;
  return (
    <section className="container-x border-t border-line py-20">
      <h2 className="display-title mb-10 text-xl sm:text-2xl">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
