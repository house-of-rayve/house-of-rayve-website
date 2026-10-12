"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "./gsap";

/**
 * A dark section where a pool of light follows the pointer and uncovers the campaign photo underneath.
 * On touch screens the light wanders by itself and jumps to wherever you tap.
 */
export default function FlashlightReveal() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    const pos = { x: 0.5, y: 0.5 };
    const r = { v: 0 };
    const apply = () => {
      const b = el.getBoundingClientRect();
      el.style.setProperty("--x", `${pos.x * b.width}px`);
      el.style.setProperty("--y", `${pos.y * b.height}px`);
      el.style.setProperty("--r", `${r.v}px`);
    };
    if (prefersReducedMotion()) {
      r.v = 9999; // just show the photo
      apply();
      return;
    }
    const radius = () => Math.max(170, Math.min(el.offsetWidth, el.offsetHeight) * 0.32);
    const t = { a: 0 };
    let wander = null;
    const startWander = () => {
      wander ??= gsap.to(t, {
        a: Math.PI * 2,
        duration: 10,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          pos.x = 0.5 + Math.sin(t.a) * 0.3;
          pos.y = 0.5 + Math.sin(t.a * 2) * 0.22;
          apply();
        },
      });
      wander.resume();
    };
    const moveTo = (e, fast) => {
      wander?.pause();
      const b = el.getBoundingClientRect();
      gsap.to(pos, { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height, duration: fast ? 0.35 : 0.8, ease: "power3.out", overwrite: true, onUpdate: apply });
    };
    const onMove = (e) => e.pointerType === "mouse" && moveTo(e, true);
    const onDown = (e) => e.pointerType !== "mouse" && moveTo(e, false);
    const onLeave = () => startWander();

    // Open the light when the section comes into view
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.to(r, { v: radius(), duration: 1.2, ease: "expo.out", onUpdate: apply });
        startWander();
      } else wander?.pause();
    });
    io.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerleave", onLeave);
    apply();
    return () => {
      io.disconnect();
      wander?.kill();
      gsap.killTweensOf([pos, r]);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const mask = "radial-gradient(circle var(--r) at var(--x) var(--y), transparent 0%, transparent 35%, #000 100%)";

  return (
    <section ref={root} className="relative h-[85svh] min-h-[520px] select-none overflow-hidden bg-[#0d0d0a] text-sand" style={{ "--x": "50%", "--y": "50%", "--r": "0px" }}>
      <Image src="/images/campaign-matador.jpg" alt="RAYVE campaign" fill sizes="100vw" className="object-cover" />
      {/* the dark, with a hole of light where the pointer is */}
      <div className="absolute inset-0 bg-[#0d0d0a]" style={{ maskImage: mask, WebkitMaskImage: mask }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <p className="eyebrow text-olive-400">100% UV400 · every pair</p>
        <h2 className="display-title mt-5 text-4xl mix-blend-difference sm:text-6xl lg:text-7xl" data-no-split>
          Made for the light
        </h2>
        <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-sand/75">
          <span className="lg:hidden">Tap to move the light</span>
          <span className="max-lg:hidden">Move your cursor</span>
        </p>
      </div>
    </section>
  );
}
