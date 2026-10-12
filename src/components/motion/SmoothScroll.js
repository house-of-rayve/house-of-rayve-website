"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

let lenis = null;

// Buttery smooth scrolling for the storefront, kept in sync with GSAP ScrollTrigger.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);

    // Scroll-speed skew: [data-skew] elements lean with fast scrolling and straighten when it stops;
    // [data-kinetic] headlines stretch with it
    const skew = { v: 0 };
    const skewTo = gsap.quickTo(skew, "v", { duration: 0.6, ease: "power3" });
    let lastScroll = 0;
    let applied = 0;
    let settling = false;
    lenis.on("scroll", (l) => {
      lastScroll = performance.now();
      settling = false;
      skewTo(Math.max(-4, Math.min(4, l.velocity * 0.12)));
    });
    const applySkew = () => {
      if (!settling && performance.now() - lastScroll > 120) {
        settling = true;
        skewTo(0);
      }
      const v = Math.abs(skew.v) < 0.1 ? 0 : skew.v;
      if (v === applied) return;
      applied = v;
      document.querySelectorAll("[data-skew]").forEach((el) => (el.style.transform = v ? `skewY(${v.toFixed(2)}deg)` : ""));
      // Kinetic type: big headlines stretch tall and lean with the scroll speed
      const k = Math.abs(v);
      document.querySelectorAll("[data-kinetic]").forEach((el) => {
        el.style.transformOrigin = "50% 100%";
        el.style.transform = v ? `scaleY(${(1 + k * 0.045).toFixed(3)}) skewX(${(-v * 1.5).toFixed(2)}deg)` : "";
      });
    };
    gsap.ticker.add(applySkew);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pause while a drawer/modal locks the page (they set body overflow: hidden)
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      gsap.ticker.remove(applySkew);
      lenis.destroy();
      lenis = null;
    };
  }, []);

  // New page: start at the top and let ScrollTrigger measure the new layout
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
