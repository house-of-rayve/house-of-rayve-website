"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "./gsap";

// Soft follower ring for mouse users. Grows over links/buttons; shows a label over
// elements with data-cursor="View" (product cards, gallery tiles).
export default function CustomCursor() {
  const ring = useRef(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return; // touch devices keep the normal behaviour; the ring stays invisible
    const el = ring.current;
    gsap.set(el, { scale: 0.28, opacity: 0 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });

    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target.closest?.("[data-cursor], a, button, [role=button], input, select, textarea, label");
      const text = target?.getAttribute?.("data-cursor") ?? "";
      const interactive = Boolean(target);
      setLabel(text);
      gsap.to(el, { scale: text ? 1 : interactive ? 0.55 : 0.28, opacity: 1, duration: 0.3, overwrite: "auto" });
    };
    const leave = () => gsap.to(el, { opacity: 0, duration: 0.2 });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[150] -ml-11 -mt-11 grid size-22 place-items-center rounded-full bg-olive-500/90 opacity-0 text-[10px] font-medium uppercase tracking-[0.2em] text-olive-950 opacity-0 mix-blend-normal backdrop-blur-sm"
    >
      <span className={`transition-opacity duration-200 ${label ? "opacity-100" : "opacity-0"}`}>{label}</span>
    </div>
  );
}
