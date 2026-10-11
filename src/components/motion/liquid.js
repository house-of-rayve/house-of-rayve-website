"use client";

import { gsap, prefersReducedMotion } from "./gsap";

// Rippling "liquid" distortion for product photos on hover, using the SVG filter in <LiquidFilter />.
// Only the photos inside `el` ripple (not its buttons); they are slightly zoomed on hover, so the
// container's overflow hides the wavy edges. One filter is shared, so one card ripples at a time.
let current = null; // { imgs, tl }

export function liquidHover(el) {
  if (!el || prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const turb = document.getElementById("rayve-liquid-turb");
  const disp = document.getElementById("rayve-liquid-disp");
  if (!turb || !disp) return;

  const imgs = [...el.querySelectorAll("img")];
  if (!imgs.length) return;
  const setFilter = (list, value) => list.forEach((img) => (img.style.filter = value));
  if (current) {
    current.tl.kill();
    setFilter(current.imgs, "");
  }
  const state = { scale: 0, freq: 0.006 };
  const apply = () => {
    disp.setAttribute("scale", state.scale.toFixed(2));
    turb.setAttribute("baseFrequency", `${state.freq.toFixed(4)} ${(state.freq * 2.4).toFixed(4)}`);
  };
  setFilter(imgs, "url(#rayve-liquid)");
  const tl = gsap
    .timeline({
      onComplete: () => {
        setFilter(imgs, "");
        current = null;
      },
    })
    .to(state, { scale: 14, freq: 0.012, duration: 0.35, ease: "power2.out", onUpdate: apply })
    .to(state, { scale: 0, freq: 0.006, duration: 0.8, ease: "power2.inOut", onUpdate: apply });
  current = { imgs, tl };
}

export function LiquidFilter() {
  return (
    <svg aria-hidden="true" className="pointer-events-none fixed size-0" style={{ position: "fixed", width: 0, height: 0 }}>
      <filter id="rayve-liquid" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence id="rayve-liquid-turb" type="fractalNoise" baseFrequency="0.006 0.0144" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap id="rayve-liquid-disp" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
