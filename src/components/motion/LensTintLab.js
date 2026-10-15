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
export default function LensTintLab({ initialTint = 0 }) {
  const stage = useRef(null);
  const pos = useRef({ x: 0.5, y: 0.5 }); // normalised lens centre
  const [tint, setTint] = useState(initialTint);
  const active = TINTS[tint];

  useEffect(() => {
    const el = stage.current;
    const p = pos.current;
    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      const rx = Math.min(width * 0.1, 180);
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
    const onDown = (e) => e.pointerType !== "mouse" && !e.target.closest("[data-lab-ui]") && moveTo(e, false);
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

  // The scene, the tinted copy inside the lenses, and the frame outline
  const scene = (
    <>
      <Image loader={unsplashLoader} src={SCENE} alt="A sunny street in Seville" fill sizes="100vw" className="object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ maskImage: mask, WebkitMaskImage: mask }} aria-hidden="true">
        <Image
          loader={unsplashLoader}
          src={SCENE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover transition-[filter] duration-500"
          style={{ filter: active.filter }}
          draggable={false}
        />
        <div className="absolute inset-0 mix-blend-multiply transition-colors duration-500" style={{ background: active.wash }} />
      </div>
      <div className="pointer-events-none absolute left-0 top-0" style={{ transform: "translate(var(--x), var(--y))" }} aria-hidden="true">
        {["-", "+"].map((side) => (
          <span
            key={side}
            className="absolute rounded-[50%] border-[6px] border-olive-950 shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_0_1px_rgba(233,226,208,0.45)]"
            style={{
              width: "calc(var(--rx) * 2 + 12px)",
              height: "calc(var(--ry) * 2 + 12px)",
              left: `calc(${side === "-" ? "-1" : "1"} * (var(--rx) + var(--gap)) - var(--rx) - 6px)`,
              top: "calc(-1 * var(--ry) - 6px)",
            }}
          />
        ))}
        <span
          className="absolute h-3 rounded-t-full border-x-0 border-b-0 border-t-[6px] border-solid border-olive-950"
          style={{ width: "calc(var(--gap) * 2 + 16px)", left: "calc(-1 * var(--gap) - 8px)", top: "calc(-0.45 * var(--ry))" }}
        />
      </div>
    </>
  );

  return (
    <section ref={stage} className="relative h-[min(92svh,940px)] min-h-[600px] cursor-none select-none overflow-hidden bg-olive-950 text-sand">
      {scene}
      {/* shade so the copy and controls read over the photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-olive-950/70 via-olive-950/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-olive-950/90 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-6 px-5 pt-24 sm:px-8 sm:pt-28 lg:px-10 lg:pt-32">
        <div className="max-w-xl">
          <p className="eyebrow text-sand/70">Lens lab</p>
          <h2 className="display-title mt-5 text-3xl leading-[1.05] sm:text-5xl lg:text-6xl">See the world through RAYVE.</h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-sand/75">
            <span className="hidden sm:inline">Move across the street</span>
            <span className="sm:hidden">Tap the street</span> to look through the lenses. Pick a tint below.
          </p>
        </div>
        <span className="hidden shrink-0 border border-sand/30 bg-olive-950/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-sand backdrop-blur-sm sm:block">UV400 · 100% UVA/UVB</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 px-5 pb-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:pb-12">
        <div key={tint} className="pointer-events-none animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sand/60">Now looking through</p>
          <p className="display-title mt-2 text-2xl sm:text-4xl">{active.name}</p>
          <p className="mt-2 text-sm text-sand/75">{active.note}</p>
        </div>
        <div data-lab-ui className="flex cursor-auto gap-3 sm:gap-5" role="radiogroup" aria-label="Lens tint">
          {TINTS.map((t, i) => (
            <button
              key={t.name}
              role="radio"
              aria-checked={tint === i}
              onClick={() => setTint(i)}
              className="group flex flex-col items-center gap-2 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-sand/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            >
              {/* a swatch of the tint, with a highlight */}
              <span
                className={`block size-10 rounded-full border-2 transition-all duration-300 sm:size-12 ${
                  tint === i ? "border-sand shadow-[0_0_0_4px_rgba(233,226,208,0.2)]" : "border-sand/20 opacity-75 group-hover:opacity-100"
                }`}
                style={{ background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4), transparent 42%), ${t.swatch}` }}
              />
              <span className={`text-[9px] uppercase tracking-[0.2em] transition-colors sm:text-[10px] ${tint === i ? "text-sand" : "text-sand/60 group-hover:text-sand"}`}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <span className="pointer-events-none absolute bottom-3 right-5 text-[9px] uppercase tracking-[0.2em] text-sand/45 sm:right-8 lg:right-10 lg:top-auto max-lg:hidden">Tints simulated on screen</span>
    </section>
  );
}
