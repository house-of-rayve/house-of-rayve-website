"use client";

import { useEffect } from "react";
import { gsap } from "./gsap";

/**
 * Lets a horizontal scroller be dragged with the mouse and keep gliding when released (touch already
 * scrolls natively). Scroll snapping is paused while dragging, and a drag never counts as a click.
 * Pass `key` when the scroller element is re-created (e.g. a keyed rail) so the listeners move with it.
 */
export function useDragScroll(ref, key) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = null; // { x, left, time }
    let samples = [];
    let moved = false;

    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      gsap.killTweensOf(el);
      start = { x: e.clientX, left: el.scrollLeft };
      samples = [{ x: e.clientX, t: performance.now() }];
      moved = false;
    };
    const onMove = (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
      }
      if (!moved) return;
      el.scrollLeft = start.left - dx;
      samples.push({ x: e.clientX, t: performance.now() });
      if (samples.length > 5) samples.shift();
    };
    const onUp = () => {
      if (!start) return;
      start = null;
      el.style.cursor = "";
      if (!moved) return;
      // Glide on in the direction of the throw, then let snapping settle it
      const a = samples[0];
      const b = samples[samples.length - 1];
      const velocity = (b.x - a.x) / Math.max(16, b.t - a.t); // px per ms
      gsap.to(el, {
        scrollLeft: el.scrollLeft - velocity * 420,
        duration: 0.9,
        ease: "power3.out",
        onComplete: () => (el.style.scrollSnapType = ""),
      });
    };
    // A drag shouldn't open the product it ended on. Listening on window (capture) runs before the page
    // curtain and progress bar, which listen on document.
    const onClick = (e) => {
      if (moved && el.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    const noDrag = (e) => e.preventDefault(); // stop the browser dragging the images/links

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", noDrag);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", noDrag);
      gsap.killTweensOf(el);
    };
  }, [ref, key]);
}
