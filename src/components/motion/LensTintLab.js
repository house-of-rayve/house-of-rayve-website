"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "./gsap";
import { TINTS } from "@/lib/tints";

const unsplashLoader = ({ src, width, quality }) => `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 80}`;
// Sunny street in Seville (Unsplash licence): https://unsplash.com/photos/… — bright and colourful, so tints read clearly
const SCENE = "https://images.unsplash.com/photo-1782916539674-33c80b12ec66";


/**
 * A pair of lenses that floats over a street scene; inside the lenses the scene is shown through the
 * selected tint. Follows the mouse, moves to a tap on touch screens, and drifts on its own when idle.
 */
export default function LensTintLab({ initialTint = 0, compact = false }) {
  const stage = useRef(null);
  const pos = useRef({ x: 0.5, y: 0.5 }); // normalised lens centre
  const [tint, setTint] = useState(initialTint);
  const active = TINTS[tint];

  useEffect(() => {
    const el = stage.current;
    const p = pos.current;
    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      const rx = Math.min(width * 0.13, 170);
      el.style.setProperty("--rx", `${rx}px`);
      el.style.setProperty("--ry", `${rx * 0.74}px`);
      el.style.setProperty("--gap", `${rx * 0.16}px`);
      el.style.setProperty("--x", `${p.x * width}px`);
      el.style.setProperty("--y", `${p.y * height}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);

    // Idle drift: a slow figure-eight until the visitor takes over
    const t = { a: 0 };
    const idle = prefersReducedMotion()
      ? null
      : gsap.to(t, {
          a: Math.PI * 2,
          duration: 9,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            p.x = 0.5 + Math.sin(t.a) * 0.24;
            p.y = 0.5 + Math.sin(t.a * 2) * 0.12;
            apply();
          },
        });

    const moveTo = (e, instant) => {
      const r = el.getBoundingClientRect();
      idle?.pause();
      gsap.to(p, {
        x: Math.min(0.92, Math.max(0.08, (e.clientX - r.left) / r.width)),
        y: Math.min(0.88, Math.max(0.12, (e.clientY - r.top) / r.height)),
        duration: instant ? 0.35 : 0.7,
        ease: "power3.out",
        overwrite: true,
        onUpdate: apply,
      });
    };
    const onMove = (e) => e.pointerType === "mouse" && moveTo(e, true);
    const onDown = (e) => e.pointerType !== "mouse" && moveTo(e, false);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    return () => {
      ro.disconnect();
      idle?.kill();
      gsap.killTweensOf(p);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
    };
  }, []);

  // Two elliptical lenses either side of the bridge
  const lens = (side) => `radial-gradient(var(--rx) var(--ry) at calc(var(--x) ${side} var(--rx) ${side} var(--gap)) var(--y), #000 98.5%, transparent 100%)`;
  const mask = `${lens("-")}, ${lens("+")}`;

  return (
    <div className={`grid items-center gap-8 lg:grid-cols-12 ${compact ? "" : "lg:gap-14"}`}>
      <div className={compact ? "lg:col-span-12" : "lg:col-span-4"}>
        <p className="eyebrow">Lens lab</p>
        <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">See the world through RAYVE.</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Move the frame across the street to compare tints{compact ? "" : " — tap the photo on your phone"}. Every RAYVE lens blocks 100% of UVA and UVB (UV400).
        </p>
        <div className="mt-7 flex flex-wrap gap-2" role="radiogroup" aria-label="Lens tint">
          {TINTS.map((t, i) => (
            <button
              key={t.name}
              role="radio"
              aria-checked={tint === i}
              onClick={() => setTint(i)}
              className={`flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                tint === i ? "border-olive-800 bg-olive-800 text-sand" : "border-line bg-paper hover:border-olive-800"
              }`}
            >
              <span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: t.swatch }} />
              {t.name}
            </button>
          ))}
        </div>
        <p key={tint} className="mt-4 animate-fade-in text-xs text-muted">
          {active.name}: <span className="text-ink">{active.note}</span>
        </p>
      </div>

      <div className={compact ? "lg:col-span-12" : "lg:col-span-8"}>
        <div ref={stage} className="relative aspect-[4/5] cursor-none select-none overflow-hidden bg-mist sm:aspect-[16/10]">
          <Image loader={unsplashLoader} src={SCENE} alt="A sunny street in Seville" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" draggable={false} />
          {/* The same scene, tinted, visible only inside the lenses */}
          <div className="absolute inset-0" style={{ maskImage: mask, WebkitMaskImage: mask }} aria-hidden="true">
            <Image
              loader={unsplashLoader}
              src={SCENE}
              alt=""
              fill
              sizes="(min-width:1024px) 60vw, 100vw"
              className="object-cover transition-[filter] duration-500"
              style={{ filter: active.filter }}
              draggable={false}
            />
            <div className="absolute inset-0 mix-blend-multiply transition-colors duration-500" style={{ background: active.wash }} />
          </div>
          {/* Frame outline around the lenses */}
          <div className="pointer-events-none absolute left-0 top-0" style={{ transform: "translate(var(--x), var(--y))" }} aria-hidden="true">
            {["-", "+"].map((side) => (
              <span
                key={side}
                className="absolute rounded-[50%] border-[6px] border-olive-950 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                style={{
                  width: "calc(var(--rx) * 2 + 12px)",
                  height: "calc(var(--ry) * 2 + 12px)",
                  left: `calc(${side === "-" ? "-1" : "1"} * (var(--rx) + var(--gap)) - var(--rx) - 6px)`,
                  top: "calc(-1 * var(--ry) - 6px)",
                }}
              />
            ))}
            {/* bridge */}
            <span
              className="absolute h-3 rounded-t-full border-x-0 border-b-0 border-t-[6px] border-solid border-olive-950"
              style={{ width: "calc(var(--gap) * 2 + 16px)", left: "calc(-1 * var(--gap) - 8px)", top: "calc(-0.45 * var(--ry))" }}
            />
          </div>
          <span className="pointer-events-none absolute bottom-3 left-3 bg-paper/85 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-ink backdrop-blur sm:bottom-4 sm:left-4">
            Tints simulated on screen
          </span>
        </div>
      </div>
    </div>
  );
}
