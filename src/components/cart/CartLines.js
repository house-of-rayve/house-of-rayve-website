"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "./CartProvider";
import QuantityStepper from "./QuantityStepper";
import { formatPrice } from "@/lib/format";

export default function CartLines({ onNavigate }) {
  const { items, update, remove } = useCart();
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.productId} className="flex gap-4 py-5">
          <Link
            href={`/product/${item.slug}`}
            onClick={onNavigate}
            className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-mist"
          >
            {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/product/${item.slug}`}
                  onClick={onNavigate}
                  className="font-display text-xs uppercase tracking-[0.15em]"
                >
                  {item.name}
                </Link>
                {item.variant && <p className="mt-1 text-xs text-muted">{item.variant}</p>}
              </div>
              <button onClick={() => remove(item.productId)} className="text-muted hover:text-ink" aria-label={`Remove ${item.name}`}>
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-auto flex items-end justify-between pt-3">
              <QuantityStepper
                size="sm"
                value={item.quantity}
                max={Math.min(item.stock ?? 10, 10)}
                onChange={(q) => update(item.productId, q)}
              />
              <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
