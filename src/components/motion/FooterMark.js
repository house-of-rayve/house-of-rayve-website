"use client";

import { useRef } from "react";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

// Oversized RAYVE signature that rises and opens up as the footer scrolls into view.
export default function FooterMark() {
  const root = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true };
      gsap.fromTo(".fm-word", { yPercent: 60, scale: 0.92, opacity: 0.2 }, { yPercent: 0, scale: 1, opacity: 1, ease: "none", scrollTrigger: st });
      gsap.fromTo(".fm-mark", { rotate: -8, scale: 0.6, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, ease: "none", scrollTrigger: st });
    },
    { scope: root },
  );
  return (
    <div ref={root} className="overflow-hidden px-5 pb-6 pt-10 sm:px-8 lg:px-12">
      <div className="flex flex-col items-center">
        <span className="fm-mark block">
          <LogoMark className="h-[9vw] w-[15vw] text-olive-500 sm:h-[6vw] sm:w-[10vw]" />
        </span>
        <span className="fm-word mt-[3vw] block w-full">
          <Wordmark className="h-[12.4vw] w-full text-sand/90" />
        </span>
      </div>
    </div>
  );
}
