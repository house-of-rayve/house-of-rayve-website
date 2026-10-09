"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";

// Horizontal product rail with optional tabs: tabs = [{ label, products, href }]
export default function ProductCarousel({ eyebrow, title, tabs }) {
  const [active, setActive] = useState(0);
  const rail = useRef(null);
  const tab = tabs[active];

  const scroll = (dir) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="display-title mt-3 text-2xl sm:text-3xl">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-olive-800 hover:bg-olive-800 hover:text-sand" aria-label="Scroll left">
            <ArrowLeft className="size-4" />
          </button>
          <button onClick={() => scroll(1)} className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-olive-800 hover:bg-olive-800 hover:text-sand" aria-label="Scroll right">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {tabs.length > 1 && (
        <div className="no-scrollbar mb-8 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setActive(i);
                rail.current?.scrollTo({ left: 0 });
              }}
              className={`-mb-px shrink-0 border-b-2 pb-3 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                i === active ? "border-olive-800 text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label} <span className="text-muted">({t.products.length})</span>
            </button>
          ))}
        </div>
      )}

      <div ref={rail} key={tab.label} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 animate-fade-in sm:-mx-8 sm:gap-6 sm:scroll-px-8 sm:px-8 lg:-mx-12 lg:scroll-px-12 lg:px-12">
        {tab.products.map((p, i) => (
          <div key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
            <ProductCard product={p} priority={i < 2} sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 68vw" />
          </div>
        ))}
        {tab.href && (
          <Link
            href={tab.href}
            className="group flex w-[68%] shrink-0 snap-start flex-col items-center justify-center gap-4 border border-line bg-paper sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]"
          >
            <span className="grid size-14 place-items-center rounded-full border border-olive-800 transition-colors group-hover:bg-olive-800 group-hover:text-sand">
              <ArrowRight className="size-5" />
            </span>
            <span className="font-display text-[11px] uppercase tracking-[0.2em]">View all</span>
          </Link>
        )}
      </div>
    </div>
  );
}
