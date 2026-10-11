"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import Price from "@/components/ui/Price";
import { frameColorFor, lensColorFor } from "@/lib/frameColors";

const ArenaScene = dynamic(() => import("./ArenaScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[10px] uppercase tracking-[0.3em] text-sand/40">Loading the arena…</div>,
});

const MAX = 15;

/**
 * Full-screen "arena" wall: every frame in the collection sits in its own arch. Hover a frame (tap on
 * phones) for a quick-view card; click it to open the product.
 */
export default function ArenaWall({ products }) {
  const { add } = useCart();
  const router = useRouter();
  const root = useRef(null);
  const anchor = useRef(null);
  const placards = useRef([]);
  const closeTimer = useRef(0);
  const [hovered, setHovered] = useState(null);
  const [inView, setInView] = useState(false);
  const [added, setAdded] = useState(false);

  const items = products.slice(0, MAX).map((p) => ({ ...p, shape: p.shape ?? "Oval", ...frameColorFor(p.frameColor), lens: lensColorFor(p.lensColor) }));
  const active = hovered !== null ? items[hovered] : null;

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "150px 0px" });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // Hovering a frame opens its card at once; leaving waits a moment so the pointer can reach the card
  const onHover = (i, immediate = false) => {
    clearTimeout(closeTimer.current);
    if (i !== null) {
      setHovered(i);
      setAdded(false);
      document.body.style.cursor = "pointer";
      return;
    }
    document.body.style.cursor = "";
    if (immediate) setHovered(null);
    else closeTimer.current = setTimeout(() => setHovered(null), 260);
  };

  const onPick = (i, pointerType) => {
    if (pointerType === "mouse") router.push(`/product/${items[i].slug}`);
    else onHover(hovered === i ? null : i, true); // touch: tap to open / close the card
  };

  useEffect(() => () => (document.body.style.cursor = ""), []);

  return (
    <section ref={root} className="relative h-svh min-h-[620px] overflow-hidden bg-[#1f1f17] text-sand">
      <div className="absolute inset-0">
        <ArenaScene products={items} hovered={hovered} onHover={onHover} onPick={onPick} anchorRef={anchor} placardsRef={placards} active={inView} />
      </div>
      {/* Vignette: the edges of the wall fall into shadow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_45%,rgba(10,10,7,0.75)_100%)]" />

      {/* Museum-style placards under each frame, positioned by the scene */}
      {items.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => (placards.current[i] = el)}
          className="pointer-events-none absolute left-0 top-0 opacity-0"
          aria-hidden="true"
        >
          <div className="-translate-x-1/2 pt-3 text-center">
            <p className="whitespace-nowrap font-display text-[8px] uppercase tracking-[0.28em] text-sand sm:text-[9px]">{p.name}</p>
            <p className="mt-1 whitespace-nowrap text-[10px] text-sand/50 max-sm:hidden">{p.shape}</p>
          </div>
        </div>
      ))}

      <div className="container-x pointer-events-none relative z-10 flex items-start justify-between gap-6 pt-20 md:pt-24">
        <div>
          <p className="eyebrow text-olive-400">Collection 01</p>
          <h2 className="display-title mt-3 text-3xl sm:text-5xl" data-no-split>
            The gallery
          </h2>
        </div>
        <p className="pt-2 text-right text-[10px] uppercase tracking-[0.25em] text-sand/50">
          {items.length} frames
          <br />
          <span className="lg:hidden">Tap a frame</span>
          <span className="max-lg:hidden">Hover a frame</span>
        </p>
      </div>

      {/* Quick-view card: follows the hovered frame on desktop, docks to the bottom on phones */}
      <div
        ref={anchor}
        className="pointer-events-none absolute left-0 top-0 z-20 max-md:!transform-none max-md:inset-x-3 max-md:bottom-3 max-md:top-auto max-md:left-3"
        aria-live="polite"
      >
        {active && (
          <div
            key={active.id}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={() => onHover(null)}
            className="pointer-events-auto w-64 animate-fade-up bg-paper p-3 text-ink shadow-2xl max-md:w-auto md:-translate-y-1/2 md:translate-x-14 md:[[data-side=left]_&]:-translate-x-[calc(100%+3.5rem)]"
          >
            <div className="flex gap-3">
              <Link href={`/product/${active.slug}`} className="relative size-20 shrink-0 overflow-hidden bg-mist">
                {active.images[0] && <Image src={active.images[0]} alt={active.name} fill sizes="80px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[11px] uppercase tracking-[0.18em]">{active.name}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">{[active.shape, active.frameColor, active.lensColor && `${active.lensColor} lens`].filter(Boolean).join(" · ")}</p>
                <Price price={active.price} comparePrice={active.comparePrice} className="mt-1 text-sm" />
              </div>
              <button onClick={() => onHover(null, true)} className="grid size-7 shrink-0 place-items-center text-muted hover:text-ink md:hidden" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                disabled={active.stock <= 0}
                onClick={(e) => {
                  add(active, 1, e.currentTarget.parentElement.parentElement.querySelector("img"));
                  setAdded(true);
                }}
                className="btn-primary h-9 flex-1 text-[10px]"
              >
                {active.stock <= 0 ? "Sold out" : added ? "Added" : "Add to bag"}
              </button>
              <Link href={`/product/${active.slug}`} className="btn h-9 border border-line px-3 text-[10px] hover:border-olive-800">
                View <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
