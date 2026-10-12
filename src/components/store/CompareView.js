"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import Price from "@/components/ui/Price";
import FrameShapeIcon from "@/components/home/FrameShapeIcon";
import { useCart } from "@/components/cart/CartProvider";
import { useCompare } from "./compare";

const ROWS = [
  ["Shape", (p) => p.shape && (
    <span className="inline-flex items-center gap-2">
      <FrameShapeIcon shape={p.shape} className="h-4 w-8 text-olive-800" /> {p.shape}
    </span>
  )],
  ["Frame", (p) => p.frameColor],
  ["Lens", (p) => p.lensColor],
  ["Material", (p) => p.material],
  ["Protection", () => "100% UV400"],
  ["Availability", (p) => (p.stock <= 0 ? "Sold out" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock")],
];

/** Table of the frames picked on the shop page, one column per frame. */
export default function CompareView({ products }) {
  const { ids, toggle } = useCompare();
  const { add } = useCart();
  const picked = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  if (!picked.length)
    return (
      <div className="border border-line bg-paper py-20 text-center">
        <p className="text-muted">Nothing to compare yet. Tick &ldquo;Compare&rdquo; on up to three frames in the shop.</p>
        <Link href="/shop" className="btn-primary mt-8">
          Go to the shop
        </Link>
      </div>
    );

  return (
    <div data-lenis-prevent className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[620px] table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-28 sm:w-40" />
          {picked.map((p) => (
            <col key={p.id} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th />
            {picked.map((p) => (
              <th key={p.id} className="px-3 pb-6 text-left align-top font-normal">
                <div className="relative">
                  <Link href={`/product/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-mist">
                    {p.images[0] && <Image src={p.images[0]} alt={p.name} fill sizes="(min-width:1024px) 25vw, 40vw" className="object-cover" />}
                  </Link>
                  <button onClick={() => toggle(p.id)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-paper/90 hover:bg-paper" aria-label={`Remove ${p.name}`}>
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-4 font-display text-[11px] uppercase tracking-[0.18em]">{p.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{p.tagline}</p>
                <Price price={p.price} comparePrice={p.comparePrice} className="mt-2 text-base" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([label, value]) => (
            <tr key={label} className="border-t border-line">
              <th scope="row" className="py-4 pr-3 text-left align-top text-[10px] font-normal uppercase tracking-[0.2em] text-muted">
                {label}
              </th>
              {picked.map((p) => (
                <td key={p.id} className="px-3 py-4 align-top">
                  {value(p) || <span className="text-muted">—</span>}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-line">
            <td />
            {picked.map((p) => (
              <td key={p.id} className="px-3 pt-6 align-top">
                <div className="flex flex-col gap-2 xl:flex-row">
                  <button
                    disabled={p.stock <= 0}
                    onClick={(e) => add(p, 1, e.currentTarget.closest("table").querySelector(`a[href="/product/${p.slug}"] img`))}
                    className="btn-primary h-10 flex-1 text-[10px]"
                  >
                    {p.stock <= 0 ? "Sold out" : "Add to bag"}
                  </button>
                  <Link href={`/product/${p.slug}`} className="btn h-10 border border-line text-[10px] hover:border-olive-800">
                    Details <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {picked.length < 3 && (
        <p className="mt-8 text-xs text-muted">
          You can compare up to three frames.{" "}
          <Link href="/shop" className="text-ink underline underline-offset-4">
            Add another from the shop
          </Link>
        </p>
      )}
    </div>
  );
}
