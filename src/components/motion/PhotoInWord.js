"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

/**
 * "RAYVE" set huge with the campaign photo showing through the letters. As you scroll, the word grows
 * until the photo fills the screen, then the closing line fades in.
 */
export default function PhotoInWord({ image, line, sub }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 } });
      tl.fromTo(".piw-word", { scale: 1 }, { scale: 14, ease: "power2.in", duration: 1 }, 0)
        .fromTo(".piw-photo", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.35 }, 0.55)
        .to(".piw-word", { opacity: 0, ease: "none", duration: 0.2 }, 0.75)
        .fromTo(".piw-line", { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.3 }, 0.75);
    },
    { scope: root },
  );

  const photo = { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" };

  return (
    <section ref={root} className="relative h-[260svh] bg-olive-950 motion-reduce:h-svh">
      <div className="sticky top-0 grid h-svh place-items-center overflow-hidden">
        {/* full photo, faded in once the word has opened up */}
        <div className="piw-photo absolute inset-0 opacity-0 motion-reduce:opacity-100" style={photo} aria-hidden="true">
          <div className="absolute inset-0 bg-olive-950/45" />
        </div>
        {/* the word, filled with the same photo */}
        <p
          className="piw-word select-none bg-clip-text font-display text-[18vw] leading-none text-transparent [-webkit-background-clip:text] motion-reduce:hidden"
          style={{ ...photo, backgroundAttachment: "scroll", transformOrigin: "50% 72%" /* inside the stem of the Y, so the screen fills with photo */ }}
          aria-hidden="true"
        >
          RAYVE
        </p>
        <div className="piw-line absolute inset-x-0 bottom-[14%] px-5 text-center text-sand opacity-0 motion-reduce:opacity-100">
          <p className="display-title text-3xl sm:text-5xl" data-no-split>
            {line}
          </p>
          {sub && <p className="mx-auto mt-4 max-w-md text-sm text-sand/80">{sub}</p>}
        </div>
      </div>
    </section>
  );
}
