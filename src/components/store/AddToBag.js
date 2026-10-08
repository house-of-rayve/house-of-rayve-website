"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import QuantityStepper from "@/components/cart/QuantityStepper";

export default function AddToBag({ product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const max = Math.min(product.stock, 10);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {!soldOut && <QuantityStepper value={qty} max={max} onChange={(q) => setQty(Math.max(1, Math.min(q, max)))} />}
        <button disabled={soldOut} onClick={() => add(product, qty)} className="btn-primary flex-1">
          {soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>
      {!soldOut && product.stock <= 5 && (
        <p className="text-xs text-olive-700">Only {product.stock} left in stock.</p>
      )}
    </div>
  );
}
