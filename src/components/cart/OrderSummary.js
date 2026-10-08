"use client";

import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/format";

export default function OrderSummary({ children, compact = false }) {
  const { items, subtotal, shipping, total } = useCart();
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
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">Inclusive of all taxes.</p>
      {children}
    </div>
  );
}
