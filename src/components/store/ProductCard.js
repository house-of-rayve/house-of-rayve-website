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
      <div className="relative aspect-[4/5] overflow-hidden bg-mist">
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

        {(soldOut || onSale) && (
          <span className="absolute left-3 top-3 bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
            {soldOut ? "Sold out" : `−${Math.round((1 - product.price / product.comparePrice) * 100)}%`}
          </span>
        )}

        <WishlistButton
          product={product}
          className="absolute right-2.5 top-2.5 size-9 rounded-full bg-paper/85 text-ink backdrop-blur transition hover:bg-paper lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100 lg:aria-pressed:opacity-100"
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

      <div className="mt-4 space-y-1">
        <h3 className="font-display text-[11px] uppercase tracking-[0.18em] transition-colors group-hover:text-olive-700">{product.name}</h3>
        <p className="truncate text-xs text-muted">{[product.shape, product.frameColor].filter(Boolean).join(" · ")}</p>
        <Price price={product.price} comparePrice={product.comparePrice} className="pt-1 text-sm" />
      </div>
    </Link>
  );
}
