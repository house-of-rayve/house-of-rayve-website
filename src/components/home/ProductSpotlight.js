"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { formatPrice } from "@/lib/format";

// Full-bleed editorial feature for a single signature frame
export default function ProductSpotlight({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [still, worn] = product.images;
  const soldOut = product.stock <= 0;
  const onSale = product.comparePrice > product.price;

  const specs = [
    ["Frame", product.frameColor],
    ["Lens", product.lensColor],
    ["Material", product.material],
    ["Shape", product.shape],
  ].filter(([, v]) => v);

  return (
    <div className="grid bg-olive-900 text-sand lg:grid-cols-2">
      {/* Worn / campaign image */}
      <Link href={`/product/${product.slug}`} className="group relative block aspect-[4/5] overflow-hidden md:aspect-[16/12] lg:aspect-auto lg:min-h-[760px]">
        <Image
          src={worn ?? still}
          alt={`${product.name} worn`}
          fill
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-olive-950/50 via-transparent to-transparent" />
        <p className="absolute bottom-6 left-5 text-[10px] uppercase tracking-[0.3em] text-sand/80 sm:left-8 lg:left-12">
          {product.name} · {product.frameColor}
        </p>
      </Link>

      {/* Details panel */}
      <div className="flex items-center px-5 py-16 sm:px-8 md:px-16 lg:px-16 lg:py-20 xl:px-24">
        <div className="w-full max-w-lg">
          <p className="text-[10px] uppercase tracking-[0.35em] text-olive-400">Signature frame · No. 01</p>
          <h2 className="display-title mt-6 text-5xl sm:text-6xl xl:text-7xl">{product.name}</h2>
          <p className="mt-5 text-base leading-relaxed text-sand/70">{product.tagline}</p>

          <div className="mt-10 flex items-center gap-6">
            <Link href={`/product/${product.slug}`} className="group relative aspect-square w-28 shrink-0 overflow-hidden bg-olive-800 sm:w-32">
              <Image src={still} alt={product.name} fill sizes="128px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            </Link>
            <div>
              <p className="text-3xl font-light tracking-tight">{formatPrice(product.price)}</p>
              {onSale && (
                <p className="mt-1 text-sm text-sand/50">
                  <span className="line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="ml-2 text-olive-400">Save {Math.round((1 - product.price / product.comparePrice) * 100)}%</span>
                </p>
              )}
              <p className="mt-1 text-xs text-sand/50">Inclusive of all taxes</p>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 border-t border-sand/15 sm:grid-cols-4">
            {specs.map(([k, v], i) => (
              <div key={k} className={`py-5 pr-4 ${i % 2 ? "pl-4 sm:pl-0" : ""} ${i > 0 ? "sm:border-l sm:border-sand/15 sm:pl-4" : ""} ${i > 1 ? "border-t border-sand/15 sm:border-t-0" : ""}`}>
                <dt className="text-[9px] uppercase tracking-[0.25em] text-sand/45">{k}</dt>
                <dd className="mt-2 text-sm">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex gap-3">
            <button
              disabled={soldOut}
              onClick={() => {
                add(product, 1);
                setAdded(true);
                setTimeout(() => setAdded(false), 1600);
              }}
              className="btn flex-1 bg-sand text-olive-950 hover:bg-paper"
            >
              {soldOut ? "Sold out" : added ? <><Check className="size-4" /> Added to bag</> : "Add to bag"}
            </button>
            <WishlistButton product={product} className="size-12 shrink-0 border border-sand/30 text-sand hover:border-sand" />
          </div>
          <Link href={`/product/${product.slug}`} className="group mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sand/70 hover:text-sand">
            Discover {product.name} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
