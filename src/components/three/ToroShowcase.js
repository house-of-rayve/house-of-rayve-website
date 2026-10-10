"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Check, Move3d } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";

const ToroScene = dynamic(() => import("./ToroScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[10px] uppercase tracking-[0.3em] text-sand/40">Loading 3D…</div>,
});

// Lens tints shown as you scroll. Toro itself ships with Smoke Grey; the others are tints used across the collection.
const STAGES = [
  { tint: "#2b2b26", name: "Smoke Grey", title: "The everyday oval, sharpened.", text: "Toro's signature smoke lens — calm, neutral, 100% UV400.", note: "As on Toro" },
  { tint: "#c4691c", name: "Amber", title: "Hand-polished, built to last.", text: "Italian acetate cut and polished by hand, finished with RAYVE signature hinges.", note: "As on Ronda & Alba" },
  { tint: "#2f6136", name: "Bottle Green", title: "Familiar. Altered.", text: "A frame you recognise, reconsidered through proportion, detail and finish.", note: "As on Córdoba" },
];

export default function ToroShowcase({ product }) {
  const root = useRef(null);
  const progress = useRef(0);
  const tint = useRef(STAGES[0].tint);
  const drag = useRef(0);
  const dragStart = useRef(null);
  const stageRef = useRef(0);
  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(null); // tint chosen with the swatches
  const [added, setAdded] = useState(false);
  const [inView, setInView] = useState(false);
  const { add } = useCart();

  // Only render the 3D scene while the section is on screen (saves battery/GPU)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        progress.current = 0.08;
        return;
      }
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            const next = Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length));
            if (next === stageRef.current) return;
            stageRef.current = next;
            tint.current = STAGES[next].tint;
            setManual(null);
            setStage(next);
          },
        },
      });
    },
    { scope: root },
  );

  const pickTint = (i) => {
    setManual(i);
    tint.current = STAGES[i].tint;
  };

  const onPointerDown = (e) => {
    dragStart.current = { x: e.clientX, base: drag.current };
    gsap.killTweensOf(drag);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragStart.current) return;
    drag.current = dragStart.current.base + (e.clientX - dragStart.current.x) * 0.012;
  };
  const onPointerUp = () => {
    dragStart.current = null;
    gsap.to(drag, { current: 0, duration: 1.4, ease: "power3.out" });
  };

  const activeTint = manual ?? stage;
  const copy = STAGES[stage];

  return (
    <section ref={root} className="relative h-[300svh] bg-olive-950 text-sand motion-reduce:h-svh">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        {/* Oversized outlined name behind the model */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[26vw] leading-none text-transparent [-webkit-text-stroke:1px_rgba(233,226,208,0.08)]"
        >
          TORO
        </p>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(166,159,78,0.16),transparent_60%)]" />

        <div className="container-x relative z-10 flex items-start justify-between gap-6 pt-24 md:pt-28">
          <div>
            <p className="eyebrow text-olive-400">Signature frame · 3D</p>
            <h2 className="display-title mt-4 text-4xl sm:text-6xl">{product?.name ?? "Toro"}</h2>
          </div>
          <p className="hidden items-center gap-2 pt-2 text-[10px] uppercase tracking-[0.25em] text-sand/50 sm:flex">
            <Move3d className="size-4" /> Drag to rotate
          </p>
        </div>

        {/* 3D canvas */}
        <div
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          data-cursor="Drag"
        >
          <ToroScene progress={progress} tint={tint} drag={drag} active={inView} />
        </div>

        {/* Bottom bar: stage copy, tint swatches, buy */}
        <div className="container-x pointer-events-none relative z-10 mt-auto grid gap-4 pb-8 md:grid-cols-3 md:items-end md:gap-6 md:pb-12">
          <div key={stage} className="animate-fade-up">
            <p className="text-[10px] uppercase tracking-[0.3em] text-olive-400">
              0{stage + 1} / 0{STAGES.length} · {copy.name}
            </p>
            <p className="mt-3 text-lg font-light leading-snug sm:text-xl">{copy.title}</p>
            <p className="mt-2 max-w-sm text-sm text-sand/60 max-md:hidden">{copy.text}</p>
          </div>

          <div className="pointer-events-auto flex flex-col items-start gap-3 md:items-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-sand/50">Lens tint</p>
            <div className="flex gap-3" role="radiogroup" aria-label="Lens tint">
              {STAGES.map((s, i) => (
                <button
                  key={s.name}
                  role="radio"
                  aria-checked={activeTint === i}
                  aria-label={s.name}
                  title={`${s.name} — ${s.note}`}
                  onClick={() => pickTint(i)}
                  className={`size-9 rounded-full border-2 transition-transform ${activeTint === i ? "scale-110 border-sand" : "border-sand/20 hover:border-sand/60"}`}
                  style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), ${s.tint} 55%)` }}
                />
              ))}
            </div>
            <p className="text-[11px] text-sand/50">
              {STAGES[activeTint].name} <span className="text-sand/30">· {STAGES[activeTint].note}</span>
            </p>
          </div>

          {product && (
            <div className="pointer-events-auto flex flex-col items-start gap-3 md:items-end">
              <p className="text-2xl font-light">
                {formatPrice(product.price)}
                {product.comparePrice > product.price && <span className="ml-2 text-sm text-sand/40 line-through">{formatPrice(product.comparePrice)}</span>}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={product.stock <= 0}
                  onClick={(e) => {
                    add(product, 1, e.currentTarget);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1600);
                  }}
                  className="btn h-11 bg-sand text-olive-950 hover:bg-paper"
                >
                  {added ? (
                    <>
                      <Check className="size-4" /> Added
                    </>
                  ) : (
                    "Add to bag"
                  )}
                </button>
                <Link href={`/product/${product.slug}`} className="btn h-11 border border-sand/30 text-sand hover:border-sand">
                  Details <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* scroll progress */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-sand/10">
          <div className="h-px bg-olive-500 transition-[width] duration-300" style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} />
        </div>
      </div>
    </section>
  );
}
