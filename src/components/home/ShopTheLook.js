"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import Price from "@/components/ui/Price";

// Hotspot positions (percent of the image) for the frames in collection.jpg
const SPOTS = [
  { slug: "toro", x: 19, y: 58 },
  { slug: "matador", x: 40, y: 59 },
  { slug: "arena", x: 57, y: 46 },
  { slug: "sevilla", x: 76, y: 53 },
];

export default function ShopTheLook({ products }) {
  const { add } = useCart();
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
  const spots = SPOTS.filter((s) => bySlug[s.slug]);
  const [open, setOpen] = useState(spots[0]?.slug ?? null);
  const active = open && bySlug[open];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="relative aspect-[3/4] overflow-hidden bg-mist lg:col-span-7">
        <Image src="/images/collection.jpg" alt="RAYVE Collection 01 frames" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
        {spots.map((s) => (
          <button
            key={s.slug}
            onClick={() => setOpen(open === s.slug ? null : s.slug)}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            aria-label={`Show ${bySlug[s.slug].name}`}
          >
            <span className={`absolute inset-0 rounded-full bg-paper/70 ${open === s.slug ? "" : "animate-ping"}`} />
            <span
              className={`relative grid size-8 place-items-center rounded-full shadow-lg transition-all ${
                open === s.slug ? "scale-110 bg-olive-800 text-sand" : "bg-paper text-ink group-hover:scale-110"
              }`}
            >
              {open === s.slug ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            </span>
          </button>
        ))}
      </div>

      <div className="lg:col-span-5">
        <p className="eyebrow">Shop the look</p>
        <h2 className="display-title mt-3 text-3xl sm:text-4xl">Collection 01</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Four silhouettes, one attitude. Tap a frame in the image to see the details.
        </p>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {spots.map((s) => {
            const p = bySlug[s.slug];
            const isActive = open === s.slug;
            return (
              <li key={s.slug}>
                <div
                  className={`flex items-center gap-4 py-4 transition-colors ${isActive ? "" : "opacity-60 hover:opacity-100"}`}
                  onMouseEnter={() => setOpen(s.slug)}
                >
                  <Link href={`/product/${p.slug}`} className="relative size-16 shrink-0 overflow-hidden bg-mist">
                    <Image src={p.images[0]} alt={p.name} fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${p.slug}`} className="font-display text-xs uppercase tracking-[0.18em] hover:text-olive-700">
                      {p.name}
                    </Link>
                    <p className="mt-1 truncate text-xs text-muted">{p.tagline}</p>
                    <Price price={p.price} comparePrice={p.comparePrice} className="mt-1 text-sm" />
                  </div>
                  <button
                    onClick={() => add(p, 1)}
                    disabled={p.stock <= 0}
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-olive-800 text-olive-800 transition-colors hover:bg-olive-800 hover:text-sand disabled:opacity-30"
                    aria-label={`Add ${p.name} to bag`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        {active && (
          <Link href={`/product/${active.slug}`} className="btn-primary mt-8">
            View {active.name}
          </Link>
        )}
      </div>
    </div>
  );
}
