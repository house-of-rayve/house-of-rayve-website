"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import CartLines from "./CartLines";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

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

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-olive-950/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <p className="font-display text-xs uppercase tracking-[0.25em]">Your bag ({count})</p>
          <button onClick={close} aria-label="Close bag" className="text-muted hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <ShoppingBag className="size-8 text-olive-500" strokeWidth={1.25} />
            <p className="text-sm text-muted">Your bag is empty.</p>
            <Link href="/shop" onClick={close} className="btn-primary">
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line bg-sand/60 px-6 py-3 text-xs text-olive-800">
              {remaining > 0 ? (
                <>Add {formatPrice(remaining)} more for complimentary shipping.</>
              ) : (
                <>You&apos;ve unlocked complimentary shipping.</>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <CartLines onNavigate={close} />
            </div>
            <div className="space-y-4 border-t border-line px-6 py-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted">Inclusive of all taxes. Shipping calculated at checkout.</p>
              <div className="grid gap-2">
                <Link href="/checkout" onClick={close} className="btn-primary w-full">
                  Checkout
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
