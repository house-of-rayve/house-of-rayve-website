"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { SHAPES } from "@/lib/constants";

const CATS = [
  ["", "All"],
  ["Sunglasses", "Sunglasses"],
  ["Optical", "Optical"],
];

const SORTS = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
];

export default function ShopFilters({ count }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefWith = (key, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const set = (key, value) => router.push(hrefWith(key, value), { scroll: false });

  const category = params.get("category") ?? "";
  const q = params.get("q");

  return (
    <div className="flex flex-col gap-4 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        {CATS.map(([value, label]) => (
          <Link
            key={label}
            href={hrefWith("category", value)}
            scroll={false}
            className={`shrink-0 px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              category === value ? "bg-olive-800 text-sand" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        ))}
        {q && (
          <Link
            href={hrefWith("q", "")}
            scroll={false}
            className="ml-2 flex shrink-0 items-center gap-1.5 border border-line px-3 py-1.5 text-xs"
          >
            “{q}” <X className="size-3" />
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="mr-auto text-xs text-muted md:mr-2">{count} {count === 1 ? "frame" : "frames"}</span>
        <select
          aria-label="Shape"
          value={params.get("shape") ?? ""}
          onChange={(e) => set("shape", e.target.value)}
          className="h-9 border border-line bg-paper px-3 text-xs outline-none"
        >
          <option value="">All shapes</option>
          {SHAPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          aria-label="Sort"
          value={params.get("sort") ?? "featured"}
          onChange={(e) => set("sort", e.target.value === "featured" ? "" : e.target.value)}
          className="h-9 border border-line bg-paper px-3 text-xs outline-none"
        >
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
