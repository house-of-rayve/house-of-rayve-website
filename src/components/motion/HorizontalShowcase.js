"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

// Desktop: the section pins and vertical scrolling moves the products sideways.
// Touch / small screens: a normal swipeable row.
export default function HorizontalShowcase({ eyebrow, title, products, href = "/shop" }) {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.to(".hs-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden lg:flex lg:h-svh lg:flex-col lg:justify-center">
      <div className="container-x section-head flex flex-wrap items-end justify-between gap-4 max-lg:pt-20">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">{title}</h2>
        </div>
        <Link href={href} className="group flex items-center gap-2 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.2em]">
          Shop all <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="no-scrollbar max-lg:overflow-x-auto max-lg:pb-20">
        <div ref={track} className="flex w-max gap-4 px-5 sm:gap-6 sm:px-8 lg:px-12">
          {products.map((p, i) => (
            <div key={p.id} className="w-[64vw] shrink-0 sm:w-[38vw] lg:w-[24vw] xl:w-[21vw]">
              <ProductCard product={p} priority={i < 2} sizes="(min-width:1024px) 24vw, 64vw" />
            </div>
          ))}
          <Link href={href} className="group flex w-[64vw] shrink-0 flex-col items-center justify-center gap-5 border border-line sm:w-[38vw] lg:w-[24vw] xl:w-[21vw]">
            <span className="grid size-16 place-items-center rounded-full border border-olive-800 transition-colors group-hover:bg-olive-800 group-hover:text-sand">
              <ArrowRight className="size-5" />
            </span>
            <span className="font-display text-[11px] uppercase tracking-[0.2em]">View all frames</span>
          </Link>
        </div>
      </div>

      <div className="container-x mt-10 hidden lg:block">
        <div className="h-px bg-line">
          <div className="hs-progress h-px origin-left bg-olive-800" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
