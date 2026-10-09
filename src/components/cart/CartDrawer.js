"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Truck, Lock } from "lucide-react";
import { useCart } from "./CartProvider";
import CartLines from "./CartLines";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

function Upsell({ onNavigate }) {
  const { items, add } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products?featured=1")
      .then((r) => r.json())
      .then((d) => !cancelled && setProducts(d.products ?? []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const inBag = new Set(items.map((i) => i.productId));
  const picks = products.filter((p) => !inBag.has(p.id) && p.stock > 0).slice(0, 4);
  if (!picks.length) return null;

  return (
    <div className="border-t border-line py-5">
      <p className="font-display text-[10px] uppercase tracking-[0.25em]">You may also like</p>
      <div className="no-scrollbar -mx-6 mt-4 flex gap-3 overflow-x-auto px-6">
        {picks.map((p) => (
          <div key={p.id} className="w-32 shrink-0">
            <Link href={`/product/${p.slug}`} onClick={onNavigate} className="relative block aspect-[4/5] overflow-hidden bg-mist">
              <Image src={p.images[0]} alt={p.name} fill sizes="128px" className="object-cover" />
            </Link>
            <div className="mt-2 flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="truncate font-display text-[10px] uppercase tracking-[0.15em]">{p.name}</p>
                <p className="text-xs text-muted">{formatPrice(p.price)}</p>
              </div>
              <button
                onClick={() => add(p, 1)}
                className="grid size-7 shrink-0 place-items-center rounded-full border border-olive-800 text-olive-800 transition-colors hover:bg-olive-800 hover:text-sand"
                aria-label={`Add ${p.name} to bag`}
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, count, subtotal, open, setOpen } = useCart();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={close} className={`absolute inset-0 bg-olive-950/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-canvas shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <p className="font-display text-xs uppercase tracking-[0.25em]">Your bag ({count})</p>
          <button onClick={close} aria-label="Close bag" className="grid size-9 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-mist">
              <ShoppingBag className="size-7 text-olive-800" strokeWidth={1.25} />
            </span>
            <div>
              <p className="font-display text-xs uppercase tracking-[0.2em]">Your bag is empty</p>
              <p className="mt-2 text-sm text-muted">Find the pair you&apos;ll reach for every day.</p>
            </div>
            <Link href="/shop" onClick={close} className="btn-primary">
              Shop the collection
            </Link>
            {open && (
              <div className="w-full text-left">
                <Upsell onNavigate={close} />
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <p className="flex items-center gap-2 text-xs text-olive-800">
                <Truck className="size-4" />
                {remaining > 0 ? (
                  <span>
                    You&apos;re <strong className="font-medium">{formatPrice(remaining)}</strong> away from free shipping
                  </span>
                ) : (
                  <span>You&apos;ve unlocked complimentary shipping</span>
                )}
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-olive-800 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <CartLines onNavigate={close} />
              {open && <Upsell onNavigate={close} />}
            </div>
            <div className="space-y-4 border-t border-line px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted">Inclusive of all taxes. Shipping calculated at checkout.</p>
              <div className="grid gap-2">
                <Link href="/checkout" onClick={close} className="btn-primary w-full">
                  <Lock className="size-3.5" /> Secure checkout
                </Link>
                <Link href="/cart" onClick={close} className="btn-outline w-full">
                  View bag
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
