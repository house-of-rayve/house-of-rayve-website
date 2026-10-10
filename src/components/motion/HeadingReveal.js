"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SplitText } from "gsap/SplitText";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

gsap.registerPlugin(SplitText);

// Display headings rise line by line from behind a mask as they scroll into view.
// Skips headings that animate on their own (hero, sticky gallery title) or opt out with data-no-split.
const SELECTOR = "main h1.display-title, main h2.display-title";
const SKIP = ".hero-copy, .fg-title, [data-no-split]";

export default function HeadingReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const splits = [];
    const timer = setTimeout(() => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.closest(SKIP)) return;
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            }),
        });
        splits.push(split);
      });
      ScrollTrigger.refresh();
    }, 120);
    return () => {
      clearTimeout(timer);
      splits.forEach((s) => s.revert());
    };
  }, [pathname]);

  return null;
}
