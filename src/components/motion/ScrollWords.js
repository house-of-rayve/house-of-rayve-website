"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "./gsap";

// Pinned statement whose words light up one by one as you scroll.
// `highlight` words (exact match) are coloured in the accent tone once lit.
export default function ScrollWords({ eyebrow, text, highlight = [] }) {
  const root = useRef(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const els = gsap.utils.toArray(".sw-word");
      gsap.set(els, { opacity: 0.12 });
      gsap.to(els, {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.2}`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => ScrollTrigger.refresh();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex min-h-svh items-center bg-olive-950 text-sand">
      <div className="container-x py-24 text-center">
        <p className="eyebrow text-olive-400">{eyebrow}</p>
        <p className="mx-auto mt-10 max-w-5xl text-3xl font-light leading-[1.2] sm:text-5xl lg:text-6xl">
          {words.map((w, i) => (
            <span key={i} className={`sw-word inline-block ${highlight.includes(w.replace(/[.,]/g, "")) ? "text-olive-400" : ""}`}>
              {w}
              {i < words.length - 1 && " "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
