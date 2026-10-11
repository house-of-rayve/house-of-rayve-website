"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/ui/Logo";
import { gsap, prefersReducedMotion } from "./gsap";

const COVER = 0.45; // seconds for the curtain to rise over the page
const FAILSAFE = 5000; // reveal anyway if the next page never arrives

/**
 * Page change curtain: an olive panel with the bull mark rises over the page when an internal
 * link is clicked and lifts away once the new page has rendered. Product cards opt out
 * (data-no-curtain) so their photo can morph into the product page instead.
 */
export default function PageCurtain() {
  const root = useRef(null);
  const state = useRef({ covering: false, covered: false, arrived: false, timer: 0 });
  const pathname = usePathname();

  const reveal = () => {
    const s = state.current;
    clearTimeout(s.timer);
    s.covering = s.covered = s.arrived = false;
    const el = root.current;
    gsap
      .timeline()
      .to(el.querySelector(".pc-mark"), { opacity: 0, y: -16, duration: 0.25, ease: "power2.in" })
      .to(el, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "-=0.05")
      .set(el, { visibility: "hidden" });
  };

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (a && e.target.closest("button")?.closest("a") === a) return; // a button inside a link (quick add, wishlist)
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-no-curtain]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return; // same page / hash / filters
      const s = state.current;
      s.covering = true;
      s.covered = false;
      s.arrived = false;
      clearTimeout(s.timer);
      s.timer = setTimeout(reveal, FAILSAFE);
      gsap.killTweensOf([el, el.querySelector(".pc-mark")]);
      gsap
        .timeline({
          onComplete: () => {
            s.covered = true;
            if (s.arrived) reveal(); // the page was faster than the curtain
          },
        })
        .set(el, { visibility: "visible", y: 0, yPercent: 100 })
        .set(el.querySelector(".pc-mark"), { opacity: 0, y: 16 })
        .to(el, { yPercent: 0, duration: COVER, ease: "expo.out" })
        .to(el.querySelector(".pc-mark"), { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, "-=0.25");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // New page rendered: lift the curtain (after it has fully covered, so it never flickers)
  useEffect(() => {
    const s = state.current;
    if (!s.covering) return;
    s.arrived = true;
    if (s.covered) reveal();
  }, [pathname]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-[110] grid place-items-center bg-olive-950"
    >
      <span className="pc-mark block text-olive-400">
        <LogoMark className="h-14 w-24" />
      </span>
    </div>
  );
}
