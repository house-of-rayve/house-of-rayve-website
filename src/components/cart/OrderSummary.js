"use client";

import { Sparkles } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";
import { pointsFor } from "@/lib/shipping";

/**
 * `discount`: { code, amount } from an applied discount code; `shipping`: the fee for the chosen PIN code, or null
 * when it isn't known yet; `pointsUsed`: RAYVE points spent on this order; `couponSlot` renders the code field.
 */
export default function OrderSummary({ children, compact = false, discount = null, shipping = null, pointsUsed = 0, couponSlot = null }) {
  const { items, subtotal } = useCart();
  const value = subtotal - (discount?.amount ?? 0);
  const total = Math.max(0, value + (shipping ?? 0) - pointsUsed);
  return (
    <div className="card p-6 sm:p-8">
      <h2 className="font-display text-xs uppercase tracking-[0.25em]">Order summary</h2>
      {compact && (
        <ul className="mt-6 space-y-3 border-b border-line pb-6 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-4">
              <span className="text-ink/80">
                {i.name} <span className="text-muted">× {i.quantity}</span>
              </span>
              <span>{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {discount?.amount > 0 && (
          <div className="flex justify-between text-olive-700">
            <dt>Discount ({discount.code})</dt>
            <dd>−{formatPrice(discount.amount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Shipping</dt>
          <dd className="text-right">{shipping === null ? <span className="text-muted">Free in Delhi NCR · else at checkout</span> : shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        {pointsUsed > 0 && (
          <div className="flex justify-between text-olive-700">
            <dt>RAYVE points</dt>
            <dd>−{formatPrice(pointsUsed)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">Inclusive of all taxes.</p>
      {value > 0 && (
        <p className="mt-4 flex items-center gap-2 bg-olive-500/10 px-3 py-2.5 text-xs text-olive-800">
          <Sparkles className="size-3.5 shrink-0" />
          <span>
            You&apos;ll earn <strong className="font-medium">{pointsFor(value)} RAYVE points</strong> once it&apos;s delivered.
          </span>
        </p>
      )}
      {couponSlot}
      {children}
    </div>
  );
}
