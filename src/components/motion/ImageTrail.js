"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

const IMAGES = [
  "/images/model-toro.jpg",
  "/images/campaign-matador.jpg",
  "/images/model-sevilla.jpg",
  "/images/bullring.jpg",
  "/images/model-alba.jpg",
  "/images/plaza.jpg",
  "/images/model-arena.jpg",
  "/images/model-ronda.jpg",
  "/images/matador.jpg",
];
// Small optimised versions via the Next.js image endpoint (the trail never shows them large)
const small = (src) => `/_next/image?url=${encodeURIComponent(src)}&w=384&q=70`;
const STEP = 90; // px the pointer must travel before the next photo drops

/**
 * Campaign photos drop behind the cursor as it moves across the section. On touch screens (where moving
 * a finger would fight scrolling) the trail draws itself along a looping path while the section is in view.
 */
export default function ImageTrail({ children }) {
  const root = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current;
    const urls = IMAGES.map(small);
    urls.forEach((u) => (new Image().src = u)); // warm the cache so photos appear instantly
    let index = 0;
    let last = null;
    let z = 1;

    const drop = (x, y) => {
      const img = document.createElement("img");
      img.src = urls[index++ % urls.length];
      img.alt = "";
      img.className = "pointer-events-none absolute left-0 top-0 aspect-[4/5] w-28 object-cover shadow-xl sm:w-40 lg:w-48";
      img.style.zIndex = String(z++);
      layer.current.appendChild(img);
      const w = img.offsetWidth || 160;
      gsap
        .timeline({ onComplete: () => img.remove() })
        .fromTo(img, { x: x - w / 2, y: y - w * 0.625, scale: 0.4, opacity: 0, rotation: (Math.random() - 0.5) * 14 }, { scale: 1, opacity: 1, duration: 0.45, ease: "expo.out" })
        .to(img, { scale: 0.6, opacity: 0, y: `+=${40}`, duration: 0.6, ease: "power2.in" }, 0.8);
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (!last || Math.hypot(x - last.x, y - last.y) > STEP) {
        last = { x, y };
        drop(x, y);
      }
    };
    el.addEventListener("pointermove", onMove);

    // Touch screens: an automatic trail along a figure-eight while visible
    let auto = null;
    const touch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const io = new IntersectionObserver(([entry]) => {
      if (!touch) return;
      if (entry.isIntersecting && !auto) {
        const t = { a: 0 };
        let lastAuto = null;
        auto = gsap.to(t, {
          a: Math.PI * 2,
          duration: 8,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            const r = el.getBoundingClientRect();
            const x = r.width / 2 + Math.sin(t.a) * r.width * 0.32;
            const y = r.height / 2 + Math.sin(t.a * 2) * r.height * 0.22;
            if (!lastAuto || Math.hypot(x - lastAuto.x, y - lastAuto.y) > STEP * 0.9) {
              lastAuto = { x, y };
              drop(x, y);
            }
          },
        });
      } else if (!entry.isIntersecting && auto) {
        auto.kill();
        auto = null;
      }
    });
    io.observe(el);

    return () => {
      el.removeEventListener("pointermove", onMove);
      io.disconnect();
      auto?.kill();
    };
  }, []);

  return (
    <div ref={root} className="relative overflow-hidden">
      <div className="pointer-events-none relative">{children}</div>
      {/* Photos sit above the headline and fade quickly, like a trail */}
      <div ref={layer} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
    </div>
  );
}
