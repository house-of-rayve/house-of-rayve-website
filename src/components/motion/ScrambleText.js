"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./gsap";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#/*+=<>";

/**
 * Text that briefly decodes from random glyphs, left to right, when its link or button is hovered.
 * The real text stays available to screen readers; the width is locked so nothing shifts.
 */
export default function ScrambleText({ children, className = "" }) {
  const el = useRef(null);
  const text = String(children);

  useEffect(() => {
    const span = el.current;
    const host = span.closest("a, button") ?? span;
    let frame = 0;
    const run = () => {
      if (prefersReducedMotion()) return;
      cancelAnimationFrame(frame);
      span.style.width = `${span.getBoundingClientRect().width}px`;
      const start = performance.now();
      const duration = 380;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const settled = Math.floor(p * text.length);
        span.textContent = [...text]
          .map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join("");
        if (p < 1) frame = requestAnimationFrame(tick);
        else {
          span.textContent = text;
          span.style.width = "";
        }
      };
      frame = requestAnimationFrame(tick);
    };
    host.addEventListener("mouseenter", run);
    return () => {
      host.removeEventListener("mouseenter", run);
      cancelAnimationFrame(frame);
    };
  }, [text]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{text}</span>
      <span ref={el} aria-hidden="true" className="inline-block whitespace-nowrap">
        {text}
      </span>
    </span>
  );
}
