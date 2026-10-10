"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

// A headline holds still in the middle while photos drift past it at different speeds.
// Positions are percentages of the stage; speed is how far (in viewport heights) each photo travels.
const LAYOUT = [
  { left: "4%", top: "8%", w: "w-[38%] sm:w-[22%]", speed: 0.9 },
  { left: "70%", top: "2%", w: "w-[26%] sm:w-[16%]", speed: 1.4 },
  { left: "58%", top: "38%", w: "w-[36%] sm:w-[20%]", speed: 0.6 },
  { left: "16%", top: "52%", w: "w-[30%] sm:w-[17%]", speed: 1.2 },
  { left: "78%", top: "64%", w: "w-[20%] sm:w-[14%]", speed: 1.6 },
  { left: "36%", top: "74%", w: "w-[34%] sm:w-[19%]", speed: 0.8 },
];

export default function FloatingGallery({ items, eyebrow, title, subtitle }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray(".fg-photo").forEach((el) => {
        const speed = Number(el.dataset.speed);
        gsap.fromTo(
          el,
          { y: () => window.innerHeight * speed * 0.6 },
          {
            y: () => -window.innerHeight * speed * 0.6,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
          },
        );
      });
      gsap.fromTo(
        ".fg-title",
        { scale: 0.9, opacity: 0.3 },
        { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top center", end: "center center", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[180svh] overflow-clip bg-olive-950 text-sand">
      <div className="sticky top-0 z-10 flex h-svh flex-col items-center justify-center px-5 text-center">
        <div className="fg-title pointer-events-none">
          <p className="eyebrow text-olive-400">{eyebrow}</p>
          <h2 className="display-title mt-5 text-4xl sm:text-6xl lg:text-8xl">{title}</h2>
          <p className="mt-5 text-sm text-sand/60">{subtitle}</p>
        </div>
      </div>
      <div className="absolute inset-0">
        {items.slice(0, LAYOUT.length).map((item, i) => {
          const pos = LAYOUT[i];
          return (
            <Link
              key={item.img}
              href={item.href}
              data-cursor="View"
              data-speed={pos.speed}
              style={{ left: pos.left, top: pos.top }}
              className={`fg-photo group absolute z-20 block ${pos.w}`}
            >
              <span className="relative block aspect-[4/5] overflow-hidden bg-olive-900">
                <Image src={item.img} alt={item.label} fill loading="eager" sizes="(min-width:640px) 22vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="mt-2 flex justify-between gap-3 text-[9px] uppercase tracking-[0.2em] text-sand/60">
                <span>{item.label}</span>
                <span className="hidden truncate sm:inline">{item.caption}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
