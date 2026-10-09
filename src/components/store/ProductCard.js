"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import Price from "@/components/ui/Price";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { useCart } from "@/components/cart/CartProvider";

export default function ProductCard({ product, priority = false, sizes }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [primary, secondary] = product.images;
  const soldOut = product.stock <= 0;
  const onSale = product.comparePrice > product.price;
  const imgSizes = sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

  const quickAdd = (e) => {
    e.preventDefault();
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {primary && (
          <Image
            src={primary}
            alt={product.name}
            fill
            priority={priority}
            sizes={imgSizes}
            className={`object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${secondary ? "group-hover:opacity-0" : ""}`}
          />
        )}
        {secondary && (
          <Image
            src={secondary}
            alt=""
            fill
            sizes={imgSizes}
            className="scale-[1.04] object-cover opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="bg-paper px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-muted">Sold out</span>
          ) : (
            <>
              {onSale && (
                <span className="bg-olive-800 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-sand">
                  −{Math.round((1 - product.price / product.comparePrice) * 100)}%
                </span>
              )}
              {product.stock <= 5 && (
                <span className="bg-paper/90 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-olive-800">Only {product.stock} left</span>
              )}
            </>
          )}
        </div>

        <WishlistButton
          product={product}
          className="absolute right-2.5 top-2.5 size-9 rounded-full bg-paper/80 text-ink backdrop-blur hover:bg-paper"
        />

        {!soldOut && (
          <button
            type="button"
            onClick={quickAdd}
            className="absolute inset-x-3 bottom-3 flex h-10 translate-y-2 items-center justify-center gap-2 bg-paper/95 text-[10px] font-medium uppercase tracking-[0.2em] text-ink opacity-0 backdrop-blur transition duration-300 hover:bg-olive-800 hover:text-sand focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-lg:hidden"
          >
            {added ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {added ? "Added to bag" : "Quick add"}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xs uppercase tracking-[0.18em] transition-colors group-hover:text-olive-700">{product.name}</h3>
          <p className="mt-1.5 truncate text-xs text-muted">
            {[product.shape, product.frameColor].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Price
          price={product.price}
          comparePrice={product.comparePrice}
          className="shrink-0 flex-col items-end gap-0 text-sm sm:flex-row sm:items-baseline sm:gap-2"
        />
      </div>
    </Link>
  );
}
