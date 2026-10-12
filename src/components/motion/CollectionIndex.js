"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { EDITORIAL_EXCLUDE } from "@/lib/constants";
import { gsap, prefersReducedMotion } from "./gsap";

/**
 * Editorial index of the collection: every frame's name set large. On desktop, hovering a name floats its
 * photo beside the cursor; on touch screens each row shows a small thumbnail instead.
 */
export default function CollectionIndex({ products }) {
  const root = useRef(null);
  const float = useRef(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const el = root.current;
    const card = float.current;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = gsap.quickTo(card, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(card, "y", { duration: 0.6, ease: "power3" });
    const rot = gsap.quickTo(card, "rotation", { duration: 0.8, ease: "power3" });
    let lastX = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      x(e.clientX - r.left);
      y(e.clientY - r.top);
      rot(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.4))); // tilts with the direction of travel
      lastX = e.clientX;
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={root} className="relative" onMouseLeave={() => setActive(null)}>
      {/* the floating photo (desktop) */}
      <div ref={float} className="pointer-events-none absolute left-0 top-0 z-20 hidden lg:block" aria-hidden="true">
        <div
          className={`relative -ml-[7.5rem] -mt-[9.5rem] aspect-[4/5] w-60 overflow-hidden bg-mist shadow-2xl transition-[opacity,scale] duration-500 ease-out ${
            active === null ? "scale-75 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {products.map((p, i) => (
            <Image
              key={p.id}
              src={p.images[1] && !EDITORIAL_EXCLUDE.includes(p.images[1]) ? p.images[1] : p.images[0]}
              alt=""
              fill
              sizes="240px"
              className={`object-cover transition-opacity duration-500 ${active === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>

      <ul className="border-t border-line">
        {products.map((p, i) => (
          <li key={p.id} className="border-b border-line">
            <Link
              href={`/product/${p.slug}`}
              onMouseEnter={() => setActive(i)}
              className={`group flex items-center gap-4 py-4 transition-opacity duration-500 sm:gap-8 sm:py-5 ${
                active !== null && active !== i ? "lg:opacity-30" : ""
              }`}
            >
              <span className="w-8 shrink-0 font-display text-[10px] text-muted sm:w-12 sm:text-xs">{String(i + 1).padStart(2, "0")}</span>
              {/* thumbnail on touch screens */}
              <span className="relative size-14 shrink-0 overflow-hidden bg-mist lg:hidden">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />}
              </span>
              <span className="display-title min-w-0 flex-1 truncate text-2xl transition-transform duration-500 ease-out group-hover:translate-x-3 sm:text-4xl lg:text-6xl">
                {p.name}
              </span>
              <span className="hidden shrink-0 text-right text-xs text-muted sm:block">
                <span className="block uppercase tracking-[0.2em]">{p.shape}</span>
                <span className="mt-1 block text-ink">{formatPrice(p.price)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
