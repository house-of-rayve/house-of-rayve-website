"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";

const edge = "px-5 sm:px-8 lg:px-10"; // same side spacing as the header, so the heading and the first card line up

// A row of products that scrolls sideways with the arrow buttons (or a swipe / trackpad). The page keeps scrolling
// normally past it.
export default function HorizontalShowcase({ eyebrow, title, products, href = "/shop" }) {
  const track = useRef(null);
  const [state, setState] = useState({ progress: 0, start: true, end: false });

  useEffect(() => {
    const el = track.current;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setState({ progress: max > 0 ? el.scrollLeft / max : 1, start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Moves by roughly one screen of cards
  const move = (dir) => {
    const el = track.current;
    const card = el.firstElementChild?.firstElementChild;
    const step = card ? Math.max(card.offsetWidth, Math.floor(el.clientWidth / card.offsetWidth - 0.2) * card.offsetWidth) : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrow = "grid size-10 place-items-center text-ink transition-[opacity,transform] duration-300 hover:scale-110 disabled:pointer-events-none disabled:opacity-20";

  return (
    <section className="section-y">
      <div className={`${edge} section-head flex flex-wrap items-end justify-between gap-4`}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">{title}</h2>
        </div>
        <Link href={href} className="group flex items-center gap-2 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.2em]">
          Shop all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div ref={track} className={`no-scrollbar snap-x snap-mandatory overflow-x-auto ${edge} scroll-px-5 sm:scroll-px-8 lg:scroll-px-10`}>
        <div className="flex w-max gap-4 sm:gap-6">
          {products.map((p, i) => (
            <div key={p.id} className="w-[64vw] shrink-0 snap-start sm:w-[38vw] lg:w-[24vw] xl:w-[21vw]">
              <ProductCard product={p} priority={i < 2} sizes="(min-width:1024px) 24vw, 64vw" />
            </div>
          ))}
          <Link href={href} className="group flex w-[64vw] shrink-0 snap-start flex-col items-center justify-center gap-5 border border-line sm:w-[38vw] lg:w-[24vw] xl:w-[21vw]">
            <span className="grid size-16 place-items-center rounded-full border border-olive-800 transition-colors group-hover:bg-olive-800 group-hover:text-sand">
              <ArrowRight className="size-5" />
            </span>
            <span className="font-display text-[11px] uppercase tracking-[0.2em]">View all frames</span>
          </Link>
        </div>
      </div>

      {/* progress, with the arrows at its end */}
      <div className={`${edge} mt-10 flex items-center gap-6 sm:gap-8`}>
        <div className="h-px flex-1 bg-line">
          <div className="h-px origin-left bg-olive-800 transition-transform duration-500 ease-out" style={{ transform: `scaleX(${Math.max(0.08, state.progress)})` }} />
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <button type="button" onClick={() => move(-1)} disabled={state.start} className={arrow} aria-label="Previous frames">
            <ArrowLeft className="size-4" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => move(1)} disabled={state.end} className={arrow} aria-label="Next frames">
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
