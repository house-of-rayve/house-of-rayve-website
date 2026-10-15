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

  // The scene, the tinted copy inside the lenses, and the frame outline
  const scene = (
    <>
      <Image loader={unsplashLoader} src={SCENE} alt="A sunny street in Seville" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" draggable={false} />
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
    <section className="container-x section-y">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="eyebrow">Lens lab</p>
          <h2 className="display-title mt-4 text-3xl leading-[1.05] sm:text-4xl">See the world through RAYVE.</h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            <span className="hidden sm:inline">Move across the street</span>
            <span className="sm:hidden">Tap the street</span> to look through the lenses, then pick a tint.
          </p>

          {/* Tints, as a list: swatch, name and what it does */}
          <div className="mt-8 border-t border-line" role="radiogroup" aria-label="Lens tint">
            {TINTS.map((t, i) => {
              const on = tint === i;
              return (
                <button
                  key={t.name}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTint(i)}
                  className="group relative flex w-full items-center gap-4 border-b border-line py-4 text-left outline-none focus-visible:bg-mist"
                >
                  <span className={`absolute inset-y-0 left-0 w-0.5 bg-olive-800 transition-transform duration-300 ${on ? "scale-y-100" : "scale-y-0"}`} />
                  <span
                    className={`size-9 shrink-0 rounded-full transition-all duration-300 ${on ? "ml-4 ring-1 ring-olive-800 ring-offset-2 ring-offset-canvas" : "ml-0 opacity-80 group-hover:opacity-100"}`}
                    style={{ background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4), transparent 42%), ${t.swatch}` }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block font-display text-xs uppercase tracking-[0.2em] transition-colors ${on ? "text-ink" : "text-ink/60 group-hover:text-ink"}`}>{t.name}</span>
                    <span className="mt-1 block text-xs text-muted">{t.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-muted">Every lens · UV400 · blocks 100% UVA/UVB</p>
        </div>

        <div className="lg:col-span-8">
          <div ref={stage} className="relative aspect-[4/5] cursor-none select-none overflow-hidden bg-mist sm:aspect-[16/10]">
            {scene}
            <span className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 bg-olive-950/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-sand backdrop-blur-sm">
              <span className="size-2 rounded-full" style={{ background: active.swatch }} />
              {active.name}
            </span>
            <span className="pointer-events-none absolute bottom-4 right-4 text-[9px] uppercase tracking-[0.2em] text-sand/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
              Tints simulated on screen
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
