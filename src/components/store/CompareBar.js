"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useCompare, COMPARE_MAX } from "./compare";

/** Small "Compare" checkbox for a product (works inside a card link without opening it). */
export function CompareToggle({ id, className = "" }) {
  const { has, toggle } = useCompare();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={on}
      className={`-my-1.5 flex min-h-8 shrink-0 items-center gap-1.5 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${on ? "text-olive-800" : "text-muted hover:text-ink"} ${className}`}
    >
      <span className={`grid size-3.5 place-items-center border ${on ? "border-olive-800 bg-olive-800 text-sand" : "border-line bg-paper"}`}>
        {on && <Check className="size-2.5" strokeWidth={3} />}
      </span>
      Compare
    </button>
  );
}

/** Floating tray with the frames picked for comparison. */
export default function CompareBar({ products }) {
  const { ids, toggle, clear } = useCompare();
  const picked = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!picked.length) return null;
  return (
    <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-xl animate-fade-up items-center gap-3 bg-olive-950 p-2.5 pr-3 text-sand shadow-2xl lg:bottom-6">
      <div className="flex gap-2">
        {Array.from({ length: COMPARE_MAX }, (_, i) => picked[i]).map((p, i) =>
          p ? (
            <button key={p.id} onClick={() => toggle(p.id)} className="group relative size-12 overflow-hidden bg-olive-900" aria-label={`Remove ${p.name} from comparison`}>
              {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
              <span className="absolute inset-0 grid place-items-center bg-olive-950/70 opacity-0 transition-opacity group-hover:opacity-100">
                <X className="size-4" />
              </span>
            </button>
          ) : (
            <span key={`empty-${i}`} className="size-12 border border-dashed border-sand/20" />
          ),
        )}
      </div>
      <p className="mr-auto hidden text-[10px] uppercase tracking-[0.2em] text-sand/60 sm:block">
        {picked.length} of {COMPARE_MAX}
      </p>
      <button onClick={clear} className="text-[10px] uppercase tracking-[0.2em] text-sand/60 hover:text-sand max-sm:ml-auto">
        Clear
      </button>
      <Link
        href="/compare"
        aria-disabled={picked.length < 2}
        className={`btn h-10 bg-sand px-4 text-olive-950 hover:bg-paper ${picked.length < 2 ? "pointer-events-none opacity-50" : ""}`}
      >
        Compare{picked.length > 1 ? ` (${picked.length})` : ""}
      </Link>
    </div>
  );
}
