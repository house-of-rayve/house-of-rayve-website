"use client";

import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ value, onChange, max = 10, size = "md" }) {
  const h = size === "sm" ? "h-8" : "h-11";
  return (
    <div className={`inline-flex ${h} items-center border border-line bg-paper`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid h-full w-8 place-items-center text-muted hover:text-ink"
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="grid h-full w-8 place-items-center text-muted hover:text-ink disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
