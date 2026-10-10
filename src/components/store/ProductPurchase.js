"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Truck, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import QuantityStepper from "@/components/cart/QuantityStepper";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { rememberViewed } from "@/components/wishlist/WishlistProvider";
import { formatPrice } from "@/lib/format";

const METRO_PREFIXES = ["11", "40", "56", "60", "70", "50", "41", "38", "12", "20"];

function addBusinessDays(date, days) {
  const d = new Date(date);
  while (days > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) days--;
  }
  return d;
}
// The gallery that is actually showing (desktop and mobile use different markup)
const visibleGallery = () => [...document.querySelectorAll("[data-gallery-main]")].find((el) => el.offsetParent !== null);

const fmt = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

function DeliveryCheck() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const check = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) return setResult({ error: "Enter a valid 6-digit PIN code." });
    const metro = METRO_PREFIXES.includes(pin.slice(0, 2));
    const [from, to] = metro ? [2, 3] : [4, 6];
    setResult({ from: addBusinessDays(new Date(), from), to: addBusinessDays(new Date(), to), metro });
  };
  return (
    <div className="border border-line bg-paper p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em]">
        <Truck className="size-4 text-olive-500" /> Check delivery
      </p>
      <form onSubmit={check} className="mt-3 flex">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter PIN code"
          aria-label="PIN code"
          className="h-10 min-w-0 flex-1 border border-r-0 border-line bg-canvas px-3 text-sm outline-none focus:border-olive-800"
        />
        <button className="h-10 bg-olive-800 px-4 text-[10px] font-medium uppercase tracking-[0.2em] text-sand hover:bg-olive-950">Check</button>
      </form>
      {result?.error && <p className="mt-2 text-xs text-red-700">{result.error}</p>}
      {result?.from && (
        <p className="mt-2 flex items-start gap-2 text-xs text-ink/80">
          <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
          <span>
            Estimated delivery <strong className="font-medium text-ink">{fmt(result.from)} – {fmt(result.to)}</strong>. Cash on delivery available.
          </span>
        </p>
      )}
    </div>
  );
}

export default function ProductPurchase({ product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [stuck, setStuck] = useState(false);
  const anchor = useRef(null);
  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, 10);

  useEffect(() => {
    rememberViewed(product);
  }, [product]);

  // Show the sticky bar once the main button scrolls out of view
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="space-y-4">
      <div ref={anchor} className="flex gap-3">
        {!soldOut && <QuantityStepper value={qty} max={max} onChange={(q) => setQty(Math.max(1, Math.min(q, max)))} />}
        <button disabled={soldOut} onClick={() => add(product, qty, visibleGallery())} className="btn-primary flex-1">
          {soldOut ? "Sold out" : `Add to bag · ${formatPrice(product.price * qty)}`}
        </button>
        <WishlistButton product={product} className="size-12 shrink-0 border border-line bg-paper hover:border-olive-800" />
      </div>
      {!soldOut && product.stock <= 5 && (
        <div>
          <p className="text-xs text-olive-700">Only {product.stock} left — order soon.</p>
          <div className="mt-2 h-1 bg-line">
            <div className="h-full bg-olive-500" style={{ width: `${(product.stock / 10) * 100}%` }} />
          </div>
        </div>
      )}
      <DeliveryCheck />

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur-md transition-transform duration-300 ${stuck ? "translate-y-0" : "translate-y-full"}`}
        aria-hidden={!stuck}
      >
        <div className="container-x flex h-[72px] items-center gap-4">
          <div className="relative hidden size-12 shrink-0 overflow-hidden bg-mist sm:block">
            {product.images[0] && <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xs uppercase tracking-[0.18em]">{product.name}</p>
            <p className="text-xs text-muted">
              {formatPrice(product.price)} {product.frameColor && <span className="max-sm:hidden">· {product.frameColor}</span>}
            </p>
          </div>
          <button disabled={soldOut} tabIndex={stuck ? 0 : -1} onClick={(e) => add(product, qty, e.currentTarget)} className="btn-primary h-11 shrink-0">
            {soldOut ? "Sold out" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
