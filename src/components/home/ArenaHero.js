"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { Dust, FrameDetails, GOLD, Name, pad, serif } from "./scene-parts";

// Camera moves: the selected niche is scaled to `fill` of the screen height and its middle placed at (x, y)
const ZOOM = { desktop: { fill: 0.6, x: 0.63, y: 0.47 }, mobile: { fill: 0.3, x: 0.5, y: 0.27 } };
// How far each layer drifts with the pointer (px at the edge of the screen): far things move least
const DEPTH = { back: 10, wall: 22, front: 46 };

/**
 * The home page hero, a single screen: the launch frames lit in niches in the wall of a bullring at sunset. The
 * scene is three layers (stands, wall, foreground) that drift with the pointer for depth. The lights come up on load;
 * pointing at a niche lights it, selecting one moves the camera in and brings up its details.
 */
export default function ArenaHero({ scene: art, frames }) {
  const { add } = useCart();
  const [active, setActive] = useState(null);
  const [hover, setHover] = useState(null);
  const [phase, setPhase] = useState(0); // opening: 0 dark → 1 sun up → 2 wall in → 3 title
  const [sweep, setSweep] = useState(null); // niche lit during the opening sweep
  const [box, setBox] = useState(null); // where the scene sits: { left, top, width, height } in px
  const [camera, setCamera] = useState("");
  const stage = useRef(null);
  const layers = useRef({});
  const target = useRef({ x: 0, y: 0 });

  // Size the scene to cover the screen. Phones get it narrower, so all three niches fit across.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ratio = art.width / art.height;
    const place = () => {
      const { width: W, height: H } = el.getBoundingClientRect();
      if (W >= 768) {
        const width = Math.max(W, H * ratio) * 1.06;
        const height = width / ratio;
        setBox({ width, height, left: (W - width) / 2, top: (H - height) / 2 });
      } else {
        const width = W / 0.66;
        const height = width / ratio;
        // The stands and sky behind still fill the whole screen
        const backWidth = Math.max(W, H * 0.62 * ratio);
        setBox({ width, height, left: (W - width) / 2, top: H * 0.2, back: { width: backWidth, height: backWidth / ratio, left: (W - backWidth) / 2, top: H * 0.2 + height - backWidth / ratio } });
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [art]);

  // The opening, once the site's brand intro has lifted (or straight away if it isn't playing)
  useEffect(() => {
    const t = [];
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      t.push(setTimeout(() => setPhase(1), 150), setTimeout(() => setPhase(2), 1100), setTimeout(() => setPhase(3), 3300));
      frames.forEach((_, i) => t.push(setTimeout(() => setSweep(i), 2000 + i * 380)));
      t.push(setTimeout(() => setSweep(null), 2000 + frames.length * 380 + 500));
    };
    if (window.__rayveIntroDone) start();
    window.addEventListener("rayve:intro-done", start);
    const fallback = setTimeout(start, 6000);
    return () => {
      window.removeEventListener("rayve:intro-done", start);
      clearTimeout(fallback);
      t.forEach(clearTimeout);
    };
  }, [frames]);

  // Depth: each layer eases towards its offset for the pointer position
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.current.x - cur.x) * 0.06;
      cur.y += (target.current.y - cur.y) * 0.06;
      for (const [k, el] of Object.entries(layers.current)) {
        if (el) el.style.transform = `translate3d(${cur.x * DEPTH[k]}px, ${cur.y * DEPTH[k] * 0.5}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e) => {
    if (active !== null) return;
    const r = e.currentTarget.getBoundingClientRect();
    target.current = { x: -((e.clientX - r.left) / r.width - 0.5) * 2, y: -((e.clientY - r.top) / r.height - 0.5) * 2 };
  };

  // Moves the camera so niche `i` fills the screen (null = the whole scene)
  const aim = useCallback(
    (i) => {
      if (i === null || !stage.current || !box) return setCamera("");
      const { width: W, height: H } = stage.current.getBoundingClientRect();
      const z = W >= 1024 ? ZOOM.desktop : ZOOM.mobile;
      const [l, t, w, h] = art.niches[i];
      const cx = box.left + ((l + w / 2) / 100) * box.width;
      const cy = box.top + ((t + h / 2) / 100) * box.height;
      const scale = (z.fill * H) / ((h / 100) * box.height);
      setCamera(`translate(${z.x * W - scale * cx}px, ${z.y * H - scale * cy}px) scale(${scale})`);
    },
    [art, box],
  );

  const select = useCallback(
    (i) => {
      target.current = { x: 0, y: 0 };
      setActive(i);
      aim(i);
    },
    [aim],
  );

  useEffect(() => {
    if (active === null) return;
    const onResize = () => aim(active);
    const onKey = (e) => {
      if (e.key === "Escape") select(null);
      if (e.key === "ArrowRight") select((active + 1) % frames.length);
      if (e.key === "ArrowLeft") select((active - 1 + frames.length) % frames.length);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, aim, select, frames.length]);

  if (!frames.length) return null;
  const zoomed = active !== null;

  const layer = (key, src, className = "", extra = null) => (
    <div ref={(el) => void (layers.current[key] = el)} className="pointer-events-none absolute inset-0 will-change-transform">
      {box && (
        <div className={`absolute ${className}`} style={key === "back" && box.back ? box.back : { left: box.left, top: box.top, width: box.width, height: box.height }}>
          <Image src={src} alt="" fill unoptimized priority className={`object-cover transition-[filter] duration-1000 ${key === "wall" && zoomed ? "brightness-[0.28]" : ""}`} />
          {extra}
          {key === "wall" &&
            frames.map((f, i) => {
              const [l, t, w, h] = art.niches[i];
              const lit = zoomed ? active === i : sweep !== null ? sweep === i : hover === i;
              return (
                <div key={f.product.id}>
                  {/* The niche brightens, as if its downlight came up */}
                  <div
                    className={`pointer-events-none absolute inset-0 transition-opacity ${sweep !== null ? "duration-300" : "duration-700"} ${lit ? "opacity-100" : "opacity-0"}`}
                    style={{ clipPath: `inset(${t}% ${100 - l - w}% ${100 - t - h}% ${l}%)` }}
                  >
                    <Image src={src} alt="" fill unoptimized className="object-cover brightness-[1.35] saturate-[1.1]" />
                    <div className="absolute" style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, background: "radial-gradient(ellipse 55% 70% at 50% 0%, rgba(255,226,170,0.35), transparent 75%)" }} />
                  </div>
                  <button
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => active !== i && select(i)}
                    aria-label={`Look closer at ${f.product.name}`}
                    className="pointer-events-auto absolute cursor-pointer"
                    style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
                  />
                  {/* Name, number and price under the niche (on desktop only while pointed at) */}
                  <span
                    className={`pointer-events-none absolute -translate-x-1/2 whitespace-nowrap text-center transition-opacity duration-500 ${zoomed || phase < 3 ? "opacity-0" : lit ? "opacity-100" : "opacity-100 lg:opacity-0"}`}
                    style={{ left: `${l + w / 2}%`, top: `${t + h + 7}%` }}
                  >
                    <Name name={f.product.name} glow={f.glow} className="block text-base leading-none text-sand drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] sm:text-lg lg:text-2xl" />
                    <span className="mt-1.5 block text-[7px] uppercase tracking-[0.3em] text-sand/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-[9px]">
                      N°{pad(i + 1)} · {formatPrice(f.product.price)}
                    </span>
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );

  return (
    <section aria-label="RAYVE — the first collection" className="relative -mt-[65px] overflow-hidden bg-[#0b0806] text-sand">
      <div
        ref={stage}
        className="relative h-svh min-h-[560px] overflow-hidden"
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHover(null);
          target.current = { x: 0, y: 0 };
        }}
      >
        {/* Camera: the whole scene moves as one */}
        <div className="absolute inset-0 origin-top-left transition-transform duration-[1300ms] ease-[cubic-bezier(0.7,0,0.2,1)]" style={{ transform: camera }}>
          {/* Stands and sky, easing in from slightly closer */}
          <div className={`pointer-events-none absolute inset-0 transition-all duration-[2600ms] ease-out ${phase >= 1 ? "scale-100 opacity-100" : "scale-[1.08] opacity-0"} ${zoomed ? "brightness-[0.35]" : ""}`}>
            {layer(
              "back",
              art.back,
              "",
              // The low sun: a slow halo and rays turning around it, behind the wall
              <div className={`pointer-events-none absolute inset-0 transition-opacity duration-[2000ms] ${phase >= 1 && !zoomed ? "opacity-100" : "opacity-0"}`} style={{ "--sun-x": `${art.sun[0]}%`, "--sun-y": `${art.sun[1]}%` }}>
                <div className="absolute left-[var(--sun-x)] top-[var(--sun-y)] size-[70vmax] -translate-x-1/2 -translate-y-1/2 animate-[spin_160s_linear_infinite] opacity-60 mix-blend-screen [background:repeating-conic-gradient(from_0deg,rgba(255,214,150,0.16)_0deg_3deg,transparent_3deg_14deg)] [mask-image:radial-gradient(circle,#000_5%,transparent_60%)]" />
                <div className="absolute left-[var(--sun-x)] top-[var(--sun-y)] size-[38vmax] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(255,224,170,0.55),rgba(255,190,110,0.12)_40%,transparent_70%)] mix-blend-screen [animation-duration:6s]" />
              </div>,
            )}
          </div>
          <Dust running={phase >= 1} />
          {/* The wall with the niches, rising into place */}
          <div className={`pointer-events-none absolute inset-0 transition-all duration-[1600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            {layer("wall", art.wall)}
          </div>
          {/* Foreground: the shield and the cape slide in from the sides, close to the lens */}
          <div className={`pointer-events-none absolute inset-0 transition-all duration-[1800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] max-md:hidden ${phase >= 2 && !zoomed ? "scale-100 opacity-100" : "scale-[1.12] opacity-0"}`}>
            {layer("front", art.front, "blur-[1.5px]")}
          </div>
        </div>

        {/* Film: warm haze over the sand, vignette, grain, and a shade at the top for the header */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b0806]/85 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_50%_45%,transparent_55%,rgba(0,0,0,0.55))]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay [background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-[1800ms] ${phase >= 1 ? "opacity-0" : "opacity-100"}`} />

        {/* The title, and the frames as an index */}
        <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-all duration-1000 sm:px-8 lg:px-14 lg:pb-12 ${phase >= 3 && !zoomed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"} max-lg:pb-24`}>
          <div>
            <p className="flex items-center gap-3 text-[8px] uppercase tracking-[0.4em] text-sand/70 sm:text-[9px]">
              <span className="h-px w-8" style={{ background: `rgb(${GOLD})` }} /> RAYVE · Collection N°1
            </p>
            <h1 className={`${serif.className} mt-3 text-[44px] leading-[0.95] sm:text-6xl lg:text-[88px]`}>
              The <em className="italic" style={{ color: `rgb(${GOLD})` }}>first</em> collection
            </h1>
            <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-sand/65 sm:text-xs">Three frames, born in the arena. Handmade acetate and metal, made in small runs.</p>
          </div>
          <ol className="pointer-events-auto hidden w-60 shrink-0 border-t border-sand/20 sm:block">
            {frames.map((f, i) => (
              <li key={f.product.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={() => select(i)}
                  className={`flex w-full cursor-pointer items-baseline gap-4 border-b border-sand/20 py-2.5 text-left transition-colors ${hover === i ? "text-sand" : "text-sand/60 hover:text-sand"}`}
                >
                  <span className="text-[8px] tracking-[0.3em]">{pad(i + 1)}</span>
                  <Name name={f.product.name} glow={f.glow} className="flex-1 text-lg leading-none" />
                  <span className="text-[9px] tracking-[0.15em] text-sand/55">{formatPrice(f.product.price)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <FrameDetails
          frame={zoomed ? frames[active] : null}
          index={active ?? 0}
          count={frames.length}
          onSelect={select}
          onAdd={(product, el) => add(product, 1, el)}
          backLabel="Back to the arena"
        />
      </div>
    </section>
  );
}
