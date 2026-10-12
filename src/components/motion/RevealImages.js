"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "./gsap";

/**
 * Photos marked data-reveal open like a curtain (bottom to top) as they scroll into view.
 * They are only hidden once this has run (html[data-reveal-ready]), so without JS nothing stays hidden.
 */
export default function RevealImages() {
  const pathname = usePathname();
  useEffect(() => {
    if (prefersReducedMotion()) return;
    document.documentElement.setAttribute("data-reveal-ready", "");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-revealed"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -12% 0px" },
    );
    // Wait a frame so the new page's markup is in place
    const id = requestAnimationFrame(() => document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => io.observe(el)));
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
    };
  }, [pathname]);
  return null;
}
