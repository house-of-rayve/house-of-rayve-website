"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

// Shared by the home page scene heroes (the arena, the museum)

export const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"] });
export const pad = (n) => String(n).padStart(2, "0");
export const GOLD = "201,164,106";

// "Toro" → To + ro: the second half of a name is set in italics, in the colour of its light
export function Name({ name, glow = GOLD, className = "" }) {
  const cut = Math.ceil(name.length / 2);
  return (
    <span className={`${serif.className} ${className}`}>
      {name.slice(0, cut)}
      <em className="italic" style={{ color: `rgb(${glow})` }}>
        {name.slice(cut)}
      </em>
    </span>
  );
}

// Dust drifting in the light, drawn on a canvas. `top` makes motes brighter towards the top of the screen.
export function Dust({ running, colour = "#ffe2b0", density = 1, top = true }) {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c || !running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    let w = 0,
      h = 0,
      raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const motes = Array.from({ length: Math.round((w < 700 ? 40 : 90) * density) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vx: Math.random() * 0.25 + 0.05,
      vy: -(Math.random() * 0.18 + 0.02),
      a: Math.random() * 0.5 + 0.15,
      t: Math.random() * Math.PI * 2,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.t += 0.01;
        m.x += m.vx + Math.sin(m.t) * 0.15;
        m.y += m.vy + Math.cos(m.t * 0.7) * 0.08;
        if (m.x > w + 4) m.x = -4;
        if (m.y < -4) m.y = h + 4;
        const light = top ? 1 - (m.y / h) * 0.6 : 1;
        ctx.globalAlpha = m.a * light * (0.75 + Math.sin(m.t * 3) * 0.25);
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [running, colour, density, top]);
  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}

/**
 * Details of the selected frame: to its left on desktop, in the lower half on phones. Lines come in one after
 * another once the camera has arrived.
 */
export function FrameDetails({ frame, index, count, onSelect, onAdd, backLabel = "Back", tint = "#0b0806" }) {
  const product = frame?.product;
  const step = (n) => ({
    style: { transitionDelay: product ? `${650 + n * 90}ms` : "0ms" },
    className: `transition-all duration-700 ${product ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`,
  });
  return (
    <div
      className={`absolute isolate inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-24 pt-16 transition-opacity duration-700 sm:px-8 lg:inset-y-0 lg:right-auto lg:w-[min(560px,46%)] lg:justify-center lg:px-14 lg:py-12 ${product ? "opacity-100" : "pointer-events-none opacity-0"}`}
      style={{ "--tint": tint }}
      aria-hidden={!product}
    >
      {/* Shade behind the text: rising from the bottom on phones, from the left on desktop */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--tint),color-mix(in_srgb,var(--tint)_95%,transparent)_40%,transparent)] lg:bg-[linear-gradient(to_right,color-mix(in_srgb,var(--tint)_90%,transparent),color-mix(in_srgb,var(--tint)_60%,transparent)_60%,transparent)]" />
      {product && (
        <>
          <p {...step(0)} className={`${step(0).className} text-[8px] uppercase tracking-[0.35em] text-sand/60`}>
            N°{pad(index + 1)} · {product.category}
          </p>
          <h2 {...step(1)} className={`${step(1).className} mt-3 text-5xl leading-none lg:text-6xl`}>
            <Name name={product.name} glow={frame.glow} />
          </h2>
          {product.tagline && (
            <p {...step(2)} className={`${step(2).className} mt-4 max-w-xs text-[13px] leading-relaxed text-sand/80`}>
              {product.tagline}
            </p>
          )}
          <dl {...step(3)} className={`${step(3).className} mt-5 max-w-xs divide-y divide-sand/15 border-y border-sand/15 text-[11px] lg:mt-6`}>
            {[
              ["Frame", product.frameColor],
              ["Lens", product.lensColor],
              ["Shape", product.shape],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-6 py-2">
                  <dt className="w-12 shrink-0 text-[8px] uppercase leading-[1.6] tracking-[0.3em] text-sand/50">{k}</dt>
                  <dd className="text-sand/90">{v}</dd>
                </div>
              ))}
          </dl>
          <p {...step(4)} className={`${step(4).className} mt-5 flex items-baseline gap-3 lg:mt-6`}>
            <span className="text-xl font-light tracking-wide">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && <span className="text-xs text-sand/40 line-through">{formatPrice(product.comparePrice)}</span>}
            <span className="text-[8px] uppercase tracking-[0.3em] text-sand/55">{product.category} · UV400</span>
          </p>
          <div {...step(5)} className={`${step(5).className} mt-4 flex flex-wrap items-center gap-x-8 gap-y-3`}>
            <button
              type="button"
              disabled={product.stock < 1}
              onClick={(e) => onAdd(product, e.currentTarget)}
              className="flex cursor-pointer items-center gap-2 border-b border-sand/60 pb-1 text-[10px] uppercase tracking-[0.3em] hover:border-sand disabled:cursor-default disabled:opacity-50"
            >
              {product.stock < 1 ? "Sold out" : "Add to bag"} <ArrowRight className="size-3" />
            </button>
            <Link href={`/product/${product.slug}`} className="text-[10px] uppercase tracking-[0.3em] text-sand/65 hover:text-sand">
              View details
            </Link>
          </div>
          <div {...step(6)} className={`${step(6).className} mt-8 flex items-center justify-between gap-6 lg:mt-12 lg:max-w-xs`}>
            <button type="button" onClick={() => onSelect(null)} className="flex cursor-pointer items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-sand/70 hover:text-sand">
              <ArrowLeft className="size-3" /> {backLabel}
            </button>
            <div className="flex items-center gap-2.5 text-[9px] tracking-[0.2em] text-sand/60">
              <button type="button" onClick={() => onSelect((index - 1 + count) % count)} aria-label="Previous frame" className="grid size-6 cursor-pointer place-items-center rounded-full border border-sand/30 hover:border-sand">
                <ChevronLeft className="size-3" />
              </button>
              {pad(index + 1)} / {pad(count)}
              <button type="button" onClick={() => onSelect((index + 1) % count)} aria-label="Next frame" className="grid size-6 cursor-pointer place-items-center rounded-full border border-sand/30 hover:border-sand">
                <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
