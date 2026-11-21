"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";

// The brand line straight after the curtain: the words light up one by one as you scroll through it.
// `*word*` marks the words shown in gold.
const LINE = "The bull is our symbol of precision, vision and presence. Not aggression — *control.* Not noise — *confidence.*";

export default function Manifesto() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        root.current.querySelectorAll("[data-word]"),
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 55%", scrub: 0.6 },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-olive-950 text-sand">
      <div className="container-home flex flex-col items-center py-28 text-center md:py-36 lg:py-44">
        <p className="eyebrow text-olive-400">The symbol</p>
        <p data-no-split className="display-title mt-10 max-w-[20ch] text-[clamp(26px,6.4vw,64px)] leading-[1.15]">
          {LINE.split(" ").map((w, i) => {
            const gold = w.startsWith("*");
            return (
              <span key={i} data-word className={gold ? "text-olive-500" : undefined}>
                {w.replaceAll("*", "")}{" "}
              </span>
            );
          })}
        </p>
        <span className="mt-12 h-16 w-px bg-gradient-to-b from-olive-500 to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
