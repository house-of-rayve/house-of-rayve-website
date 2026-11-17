"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { Dust, FrameDetails } from "./scene-parts";

// Camera moves: the selected frame's view is scaled to `fill` of the screen height and its middle placed at (x, y)
const ZOOM = { desktop: { fill: 0.42, x: 0.64, y: 0.44 }, mobile: { fill: 0.24, x: 0.5, y: 0.26 } };
const TINT = "#0a0a09";
// How far each layer drifts with the pointer (px at the edge of the screen): far things move least
const DEPTH = { room: 8, plinths: 18, rope: 44 };
// Each pair of sunglasses is drawn this much wider than its plinth's top
const SPRITE = 1.05;

const KEYFRAMES = `
@keyframes rv-flicker{0%{opacity:0}8%{opacity:.9}12%{opacity:.1}20%{opacity:1}26%{opacity:.35}34%,100%{opacity:1}}
@keyframes rv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9%)}}
@keyframes rv-turn{0%,100%{transform:rotateY(-16deg)}50%{transform:rotateY(16deg)}}
@keyframes rv-flicker-off{0%{opacity:1}8%{opacity:.1}12%{opacity:.9}20%{opacity:0}26%{opacity:.65}34%,100%{opacity:0}}
`;

/**
 * The home page hero, a single screen: the launch frames floating above black marble plinths in a dark gallery.
 * The room is three layers (walls, plinths, the velvet rope in front) that drift with the pointer. Only the middle
 * spotlight is on to begin with; pointing at another frame switches its light on and lifts it higher, and selecting
 * one moves the camera in, turns it slowly and brings up its details.
 */
export default function MuseumHero({ scene: art, frames }) {
  const { add } = useCart();
  const [active, setActive] = useState(null);
  const [hover, setHover] = useState(null);
  const [phase, setPhase] = useState(0); // opening: 0 dark → 1 room → 2 middle light on
  const [box, setBox] = useState(null);
  const [camera, setCamera] = useState("");
  const stage = useRef(null);
  const layers = useRef({});
  const target = useRef({ x: 0, y: 0 });

  // Size the scene to cover the screen; phones get it narrower so all three plinths fit across
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ratio = art.width / art.height;
    const place = () => {
      const { width: W, height: H } = el.getBoundingClientRect();
      if (W >= 768) {
        const width = Math.max(W, H * ratio) * 1.04;
        const height = width / ratio;
        setBox({ width, height, left: (W - width) / 2, top: (H - height) / 2 });
      } else {
        const width = W / 0.6;
        const height = width / ratio;
        setBox({ width, height, left: (W - width) / 2, top: H * 0.16 });
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [art]);

  // The opening, once the site's brand intro has lifted: the room fades up, then the middle spotlight flickers on
  useEffect(() => {
    const t = [];
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      t.push(setTimeout(() => setPhase(1), 200), setTimeout(() => setPhase(2), 1600));
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

  // Where frame i's cut-out sits, resting on its plinth before it lifts: [left, top, width, height] in % of the scene
  const place = useCallback(
    (i) => {
      const { x, width, aspect } = art.frames[i];
      const w = width * SPRITE;
      const h = (w / aspect) * (art.width / art.height);
      return [x - w / 2, art.plinthTop - h, w, h];
    },
    [art],
  );

  // Moves the camera onto frame i, floating above its plinth (null = the whole room)
  const aim = useCallback(
    (i) => {
      if (i === null || !stage.current || !box) return setCamera("");
      const { width: W, height: H } = stage.current.getBoundingClientRect();
      const z = W >= 1024 ? ZOOM.desktop : ZOOM.mobile;
      const [l, t, w, h] = place(i);
      const view = h * 3.4; // the frame, the air under it and the top of the plinth
      const cx = box.left + ((l + w / 2) / 100) * box.width;
      const cy = box.top + ((t + h / 2 - h * 0.7) / 100) * box.height;
      const scale = (z.fill * H) / ((view / 100) * box.height);
      setCamera(`translate(${z.x * W - scale * cx}px, ${z.y * H - scale * cy}px) scale(${scale})`);
    },
    [box, place],
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
  const roomLight = phase < 1 ? "brightness-[0.03]" : zoomed ? "brightness-[0.3]" : "brightness-100";
  // The rendered room has all three spotlights on. The middle one stays on; the others are dimmed until pointed at.
  const middle = Math.floor(frames.length / 2);
  const isOn = (i) => phase >= 2 && (zoomed ? active === i : i === middle || hover === i);
  // The plinths layer is shown from the plinth tops down: the frames standing on them are drawn floating instead
  const belowTops = `inset(${art.plinthTop}% 0 0 0)`;

  // A spotlight switched off: a soft shadow over its beam, plinth and pool of light on the floor
  const shade = (i) => {
    const { x, width } = art.frames[i];
    return (
      <div
        key={`shade-${i}`}
        className="absolute transition-opacity duration-700"
        style={{
          left: `${x - width * 1.1}%`,
          top: "-2%",
          width: `${width * 2.2}%`,
          height: `${art.plinthBottom + 12}%`,
          background: TINT,
          opacity: isOn(i) ? 0 : 0.78,
          maskImage: "radial-gradient(ellipse 50% 52% at 50% 48%, #000 45%, transparent 100%)",
          animation: phase === 2 && i === middle ? "rv-flicker-off 0.7s linear" : undefined,
        }}
      />
    );
  };

  return (
    <section aria-label="RAYVE — the first collection" className="relative -mt-[65px] overflow-hidden text-sand" style={{ background: TINT }}>
      <style>{KEYFRAMES}</style>
      <div
        ref={stage}
        className="relative h-svh min-h-[560px] overflow-hidden"
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHover(null);
          target.current = { x: 0, y: 0 };
        }}
      >
        {/* Camera: the whole room moves as one */}
        <div className="absolute inset-0 origin-top-left transition-transform duration-[1300ms] ease-[cubic-bezier(0.7,0,0.2,1)]" style={{ transform: camera }}>
          {box && (
            <>
              {/* Back: the room, dark until the lights come on, and darker again behind a frame that's been opened */}
              <div ref={(el) => void (layers.current.room = el)} className="pointer-events-none absolute inset-0 will-change-transform">
                <div className="absolute" style={box}>
                  <Image src={art.room} alt="" fill unoptimized priority className={`object-cover transition-[filter] duration-[1500ms] ${roomLight}`} />
                  {/* Phones: the room's edges melt into the dark */}
                  <div className="absolute inset-0 md:hidden" style={{ background: `linear-gradient(to right, ${TINT}, transparent 12%, transparent 88%, ${TINT}), linear-gradient(to bottom, ${TINT}, transparent 15%, transparent 85%, ${TINT})` }} />
                </div>
              </div>
              <Dust running={phase >= 1} colour="#fff1d6" density={0.6} />

              {/* Middle: the plinths, and the frames floating above them */}
              <div ref={(el) => void (layers.current.plinths = el)} className="pointer-events-none absolute inset-0 will-change-transform">
                <div className="absolute" style={box}>
                  <div className="absolute inset-0" style={{ clipPath: belowTops }}>
                    <Image src={art.plinths} alt="" fill unoptimized priority className={`object-cover transition-[filter] duration-[1500ms] ${roomLight}`} />
                  </div>

                  {art.frames.map((_, i) => shade(i))}

                  {art.frames.map((spec, i) => {
                    const f = frames[i];
                    if (!f) return null;
                    const [l, t, w, h] = place(i);
                    const lit = isOn(i);
                    const lift = active === i ? -95 : hover === i ? -70 : -45; // % of the frame's own height
                    return (
                      <div key={f.product.id}>
                        {/* The frame, lifted off the plinth and floating */}
                        <div
                          className={`absolute transition-[transform,opacity,filter] duration-[1200ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] ${phase >= 2 ? "opacity-100" : "opacity-0"} ${lit ? "brightness-110" : "brightness-[0.45]"}`}
                          style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, transform: `translateY(${phase >= 2 ? lift : 0}%) scale(${hover === i || active === i ? 1.06 : 1})`, perspective: "600px" }}
                        >
                          <div className="size-full" style={{ animation: "rv-float 4.5s ease-in-out infinite", animationDelay: `${i * -1.4}s` }}>
                            <div className="relative size-full" style={{ animation: active === i ? "rv-turn 6s ease-in-out infinite" : undefined }}>
                              <Image src={spec.sprite} alt={f.product.name} fill unoptimized className="object-contain drop-shadow-[0_18px_14px_rgba(0,0,0,0.55)]" />
                            </div>
                          </div>
                        </div>

                        {/* Hit area: the frame and its plinth */}
                        <button
                          type="button"
                          onMouseEnter={() => setHover(i)}
                          onFocus={() => setHover(i)}
                          onClick={() => active !== i && phase >= 2 && select(i)}
                          aria-label={`Look closer at ${f.product.name}`}
                          className="pointer-events-auto absolute cursor-pointer"
                          style={{ left: `${l}%`, top: `${t - h * 1.2}%`, width: `${w}%`, height: `${art.plinthBottom - t + h * 1.2}%` }}
                        />

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Front: the velvet rope, close to the lens */}
              <div ref={(el) => void (layers.current.rope = el)} className="pointer-events-none absolute inset-0 will-change-transform max-md:hidden">
                <div className={`absolute blur-[1.5px] transition-opacity duration-1000 ${phase >= 1 && !zoomed ? "opacity-100" : "opacity-0"}`} style={box}>
                  <Image src={art.rope} alt="" fill unoptimized priority className="object-cover" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Film: vignette, grain, and a shade at the top for the header */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_75%_at_50%_45%,transparent_55%,rgba(0,0,0,0.6))]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E&quot;)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

        {/* The page's heading, for screen readers: the scene carries no text */}
        <h1 className="sr-only">RAYVE — the first collection</h1>

        <FrameDetails
          frame={zoomed ? frames[active] : null}
          index={active ?? 0}
          count={frames.length}
          onSelect={select}
          onAdd={(product, el) => add(product, 1, el)}
          backLabel="Back to the gallery"
          tint={TINT}
        />
      </div>
    </section>
  );
}
