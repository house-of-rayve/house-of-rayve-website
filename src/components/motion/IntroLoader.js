"use client";

import { useRef, useState } from "react";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

const KEY = "rayve_intro_seen";

// Brand intro on the first visit of a session: the horns open, the wordmark settles, then the curtain splits.
export default function IntroLoader() {
  const root = useRef(null);
  const shouldPlay = useRef(null); // decided once (effects run twice in development)
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      if (shouldPlay.current === null) {
        let seen = false;
        try {
          seen = sessionStorage.getItem(KEY) === "1";
          sessionStorage.setItem(KEY, "1");
        } catch {}
        shouldPlay.current = !seen && !prefersReducedMotion();
      }
      if (!shouldPlay.current) {
        setDone(true);
        return;
      }
      document.body.style.overflow = "hidden";
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          document.body.style.overflow = "";
          setDone(true);
        },
      });
      tl.fromTo(".intro-mark", { clipPath: "inset(0 50% 0 50%)", scale: 0.9 }, { clipPath: "inset(0 0% 0 0%)", scale: 1, duration: 1.1 })
        .fromTo(".intro-word", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0em", duration: 1 }, "-=0.6")
        .fromTo(".intro-line", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, "-=0.7")
        .to(".intro-content", { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, "+=0.25")
        .to(".intro-top", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.1")
        .to(".intro-bottom", { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<");
    },
    { scope: root },
  );

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[200]" aria-hidden="true">
      <div className="intro-top absolute inset-x-0 top-0 h-1/2 bg-olive-950" />
      <div className="intro-bottom absolute inset-x-0 bottom-0 h-1/2 bg-olive-950" />
      <div className="intro-content absolute inset-0 flex flex-col items-center justify-center text-sand">
        <span className="intro-mark block">
          <LogoMark className="h-16 w-28 text-olive-400 sm:h-20 sm:w-36" />
        </span>
        <span className="intro-word mt-7 block opacity-0">
          <Wordmark className="h-5 w-[152px] sm:h-6 sm:w-[183px]" />
        </span>
        <span className="intro-line mt-7 block h-px w-24 origin-center bg-olive-500" />
      </div>
    </div>
  );
}
