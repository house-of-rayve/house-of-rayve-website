"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Truck, Check, Sparkles } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import QuantityStepper from "@/components/cart/QuantityStepper";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { rememberViewed } from "@/components/wishlist/WishlistProvider";
import { formatPrice } from "@/lib/format";
import { pointsFor } from "@/lib/shipping";
import { api } from "@/components/ui/fetcher";

// The gallery that is actually showing (desktop and mobile use different markup)
const visibleGallery = () => [...document.querySelectorAll("[data-gallery-main]")].find((el) => el.offsetParent !== null);

// "2026-10-18" → "Sat, 18 Oct" (dates from the server are calendar days in India)
const fmt = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const PIN_KEY = "rayve-pin";

/** Live delivery date and shipping charge for a PIN code, from our courier partner. */
function DeliveryCheck({ value }) {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const check = async (code) => {
    if (!/^[1-9]\d{5}$/.test(code)) return setResult({ error: "Enter a valid 6-digit PIN code." });
    setBusy(true);
    try {
      setResult(await api(`/api/delivery?pin=${code}&value=${value}`));
      try {
        localStorage.setItem(PIN_KEY, code);
      } catch {}
    } catch (err) {
      setResult({ error: err.message });
    }
    setBusy(false);
  };

  // Check the PIN code the shopper used last time straight away
  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(PIN_KEY);
    } catch {}
    if (!saved) return;
    let live = true;
    api(`/api/delivery?pin=${saved}&value=${value}`)
      .then((r) => live && (setPin(saved), setResult(r)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [value]);

  return (
    <div className="border border-line bg-paper p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em]">
        <Truck className="size-4 text-olive-500" /> Check delivery
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(pin);
        }}
        className="mt-3 flex"
      >
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter PIN code"
          aria-label="PIN code"
          className="h-10 min-w-0 flex-1 border border-r-0 border-line bg-canvas px-3 text-sm outline-none focus:border-olive-800"
        />
        <button disabled={busy} className="h-10 bg-olive-800 px-4 text-[10px] font-medium uppercase tracking-[0.2em] text-sand hover:bg-olive-950 disabled:opacity-60">
          {busy ? "…" : "Check"}
        </button>
      </form>
      {result?.error && <p className="mt-2 text-xs text-red-700">{result.error}</p>}
      {result && !result.error && !result.serviceable && (
        <p className="mt-2 text-xs text-red-700">Sorry — we don&apos;t deliver to {result.pin} yet.</p>
      )}
      {result?.serviceable && (
        <ul className="mt-3 space-y-1.5 text-xs text-ink/80">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            <span>
              Delivery by <strong className="font-medium text-ink">{fmt(result.from)} – {fmt(result.to)}</strong> if ordered today
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            <span>{result.shipping === 0 ? <><strong className="font-medium text-ink">Free delivery</strong> — Delhi NCR</> : <>Shipping <strong className="font-medium text-ink">{formatPrice(result.shipping)}</strong></>}</span>
          </li>
          {result.cod && (
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
              <span>Cash on delivery available</span>
            </li>
          )}
        </ul>
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
          {soldOut ? "Sold out" : "Add to bag"}
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
      {!soldOut && (
        <p className="flex items-center gap-2 text-xs text-olive-800">
          <Sparkles className="size-3.5 shrink-0" />
          <span>
            Earn <strong className="font-medium">{pointsFor(product.price * qty)} RAYVE points</strong> (₹{pointsFor(product.price * qty)}) with this order
          </span>
        </p>
      )}
      <DeliveryCheck value={product.price * qty} />

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
