"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistProvider";
import { useCart } from "@/components/cart/CartProvider";
import ProductCard from "@/components/store/ProductCard";

export default function WishlistView() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-sand">
          <Heart className="size-7 text-olive-800" strokeWidth={1.25} />
        </span>
        <p className="mt-6 text-sm text-muted">Tap the heart on any frame to save it here.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Discover frames
        </Link>
      </div>
    );
  }

  const moveAll = () => {
    items.filter((p) => p.stock > 0).forEach((p) => add(p, 1));
  };

  return (
    <>
      <div className="mt-8 flex items-center justify-between border-y border-line py-3">
        <p className="text-xs text-muted">
          {items.length} saved {items.length === 1 ? "frame" : "frames"}
        </p>
        <button onClick={moveAll} className="btn-outline btn-sm">
          Add all to bag
        </button>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <div key={p.id}>
            <ProductCard product={p} />
            <button onClick={() => remove(p.id)} className="mt-3 text-xs text-muted underline underline-offset-4 hover:text-ink">
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
