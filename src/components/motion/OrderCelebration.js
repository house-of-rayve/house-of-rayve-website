"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

const COLORS = ["#c9a85b", "#a69f4e", "#e9e2d0", "#44442a", "#d8c27a"];

/** One-off burst when an order is placed: gold confetti and the bull mark flying up. */
export default function OrderCelebration({ id }) {
  useEffect(() => {
    // Only once per order, even if the page is refreshed
    const key = `rayve_celebrated_${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    if (prefersReducedMotion()) return;

    const layer = document.createElement("div");
    Object.assign(layer.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "90", overflow: "hidden" });
    document.body.appendChild(layer);
    const W = window.innerWidth;
    const H = window.innerHeight;

    const pieces = Array.from({ length: 90 }, (_, i) => {
      const el = document.createElement("span");
      const w = 5 + Math.random() * 6;
      Object.assign(el.style, {
        position: "absolute",
        left: `${W / 2}px`,
        top: `${H * 0.45}px`,
        width: `${w}px`,
        height: `${w * (i % 3 ? 0.45 : 1)}px`,
        background: COLORS[i % COLORS.length],
        borderRadius: i % 4 === 0 ? "50%" : "1px",
      });
      layer.appendChild(el);
      return el;
    });

    // The bull mark rises out of the burst and fades
    const mark = document.createElement("span");
    Object.assign(mark.style, {
      position: "absolute",
      left: `${W / 2 - 48}px`,
      top: `${H * 0.45 - 30}px`,
      width: "96px",
      height: "58px",
      background: "#a69f4e",
      maskImage: "url(/brand/mark.png)",
      WebkitMaskImage: "url(/brand/mark.png)",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    });
    layer.appendChild(mark);

    const tl = gsap.timeline({ onComplete: () => layer.remove() });
    tl.fromTo(mark, { scale: 0.3, opacity: 0, y: 30 }, { scale: 1.4, opacity: 1, y: -40, duration: 0.7, ease: "back.out(2)" }, 0).to(
      mark,
      { opacity: 0, y: -120, duration: 0.8, ease: "power2.in" },
      1.1,
    );
    pieces.forEach((el) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 260 + Math.random() * 420;
      tl.to(
        el,
        {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
          rotation: (Math.random() - 0.5) * 720,
          duration: 0.7,
          ease: "power3.out",
        },
        0,
      ).to(el, { y: `+=${H * 0.7}`, x: `+=${(Math.random() - 0.5) * 160}`, rotation: "+=360", opacity: 0, duration: 1.6 + Math.random() * 0.8, ease: "power1.in" }, 0.7);
    });
    // No cleanup: the burst is short and removes itself, so it can finish even if the page changes
  }, [id]);

  return null;
}
