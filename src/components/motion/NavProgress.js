"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { gsap } from "./gsap";

// Thin progress line at the top while the next page loads (pages render on the server,
// and the old page stays visible until the new one is ready).
export default function NavProgress() {
  const bar = useRef(null);
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    const el = bar.current;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 1, scaleX: 0 });
      gsap.to(el, { scaleX: 0.85, duration: 2.5, ease: "power2.out" });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // New page committed: finish and fade out
  useEffect(() => {
    const el = bar.current;
    if (!el || gsap.getProperty(el, "opacity") === 0) return;
    gsap.killTweensOf(el);
    gsap.to(el, { scaleX: 1, duration: 0.25, ease: "power1.out" });
    gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.25 });
  }, [pathname, search]);

  return <div ref={bar} aria-hidden="true" className="fixed inset-x-0 top-0 z-[120] h-0.5 origin-left bg-olive-500 opacity-0" style={{ transform: "scaleX(0)" }} />;
}
