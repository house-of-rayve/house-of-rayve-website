"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { Name, pad } from "./scene-parts";
import WaitlistButton from "@/components/store/WaitlistButton";
import { WAITLIST_MODE } from "@/lib/constants";

// How far each layer drifts with the pointer (px at the edge of the screen)
const DEPTH = { world: 10, word: 18, bull: 26 };
const LEAVE_MS = 450; // the bull jumping out before the next look lands

const KEYFRAMES = `
@keyframes tr-land{0%{transform:translateY(-120vh)}62%{transform:translateY(0) scaleY(.94) scaleX(1.04)}74%{transform:translateY(0) scaleY(1.03) scaleX(.98)}100%{transform:translateY(0) scale(1)}}
@keyframes tr-breathe{0%,100%{transform:scale(1,1)}45%{transform:scale(1.006,1.014)}}
@keyframes tr-steam{0%{opacity:0;transform:translate(0,0) scale(.3)}15%{opacity:.55}100%{opacity:0;transform:translate(var(--dx),-70%) scale(2.2)}}
@keyframes tr-glint{0%{left:-60%}100%{left:130%}}
@keyframes tr-dust{0%{opacity:.7;transform:translate(0,0) scale(.4)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1.6)}}
@keyframes tr-dapple{0%,100%{transform:translate(0,0)}50%{transform:translate(2%,1.5%)}}
`;
const SHAKE = [
  { transform: "translate(0,0)" },
  { transform: "translate(-6px,4px)" },
  { transform: "translate(5px,-3px)" },
  { transform: "translate(-3px,2px)" },
  { transform: "translate(2px,-1px)" },
  { transform: "translate(0,0)" },
];

// Leaves drifting down through the scene, drawn on a canvas
function Leaves({ running }) {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current;
    if (!c || !running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0,
      raf = 0;
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const leaf = () => ({ x: Math.random() * w * 1.2 - w * 0.1, y: -20 - Math.random() * h, s: 5 + Math.random() * 7, vx: 0.3 + Math.random() * 0.6, vy: 0.5 + Math.random() * 0.8, a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.04, t: Math.random() * 10, tone: Math.random() });
    const leaves = Array.from({ length: w < 700 ? 14 : 26 }, leaf).map((l) => ({ ...l, y: Math.random() * h }));
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const l of leaves) {
        l.t += 0.02;
        l.x += l.vx + Math.sin(l.t) * 0.6;
        l.y += l.vy;
        l.a += l.va + Math.cos(l.t) * 0.01;
        if (l.y > h + 20 || l.x > w + 20) Object.assign(l, leaf(), { y: -20 });
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.a);
        ctx.scale(1, 0.32 + Math.abs(Math.sin(l.t * 1.3)) * 0.68); // tumbling
        ctx.fillStyle = l.tone > 0.5 ? "rgba(120,136,88,0.85)" : "rgba(176,184,150,0.8)";
        ctx.beginPath();
        ctx.ellipse(0, 0, l.s, l.s * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [running]);
  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}

/**
 * Toro on the home page (a full-screen section after the brand line): Toro, the RAYVE bull, standing on a stone platform in a world made for the frame he's wearing.
 * He drops in and lands with a thud, then breathes, snorts steam and catches the light on his sunglasses. Picking
 * another frame sends him jumping out; the world changes and he lands again in that look.
 * `looks`: [{ slug, look, product, glow, index }] — `look` is the scene for that frame (see TORO_LOOKS).
 */
export default function ToroHero({ looks, start }) {
  const { add } = useCart();
  const [current, setCurrent] = useState(() => Math.max(0, looks.findIndex((l) => l.slug === start)));
  const [phase, setPhase] = useState(0); // 0 waiting → 1 world in → 2 bull landed
  const [landing, setLanding] = useState(0); // bumps on each landing, to replay it
  const [leaving, setLeaving] = useState(false);
  const [box, setBox] = useState(null); // where the world image and the bull sit, in px
  const [glint, setGlint] = useState(0);
  const stage = useRef(null);
  const layers = useRef({});
  const target = useRef({ x: 0, y: 0 });
  const timer = useRef(null);

  const { look, product, glow, index } = looks[current] ?? {};

  // Cover the screen with the world, and stand the bull on its platform
  useEffect(() => {
    const el = stage.current;
    if (!el || !look) return;
    const ratio = look.width / look.height;
    const place = () => {
      const { width: W, height: H } = el.getBoundingClientRect();
      const width = Math.max(W, H * ratio) * 1.04;
      const height = width / ratio;
      const left = (W - width) / 2;
      const top = (H - height) / 2;
      const footX = left + (look.platform[0] / 100) * width;
      const footY = top + (look.platform[1] / 100) * height;
      const bullH = H * (W < 768 ? 0.5 : 0.64);
      setBox({ world: { left, top, width, height }, bull: { left: footX - (bullH * look.bullAspect) / 2, top: footY - bullH, width: bullH * look.bullAspect, height: bullH } });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [look]);

  // The opening plays the first time the section scrolls into view
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const t = [];
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        t.push(setTimeout(() => setPhase(1), 100), setTimeout(() => setPhase(2), 1100));
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      t.forEach(clearTimeout);
    };
  }, []);

  // Each landing shakes the screen as he hits the platform
  useEffect(() => {
    if (phase < 2 || !stage.current) return;
    const anim = stage.current.animate(SHAKE, { duration: 450, delay: 850, easing: "ease-out" });
    return () => anim.cancel();
  }, [phase, landing]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Another frame: he jumps out, the world changes, and he lands again in the new look
  const pick = (i) => {
    if (i === current || leaving || phase < 2) return;
    setLeaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCurrent(i);
      setLeaving(false);
      setLanding((n) => n + 1);
    }, LEAVE_MS);
  };

  // Depth: each layer eases towards its offset for the pointer position
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.current.x - cur.x) * 0.06;
      cur.y += (target.current.y - cur.y) * 0.06;
      for (const [k, el] of Object.entries(layers.current)) {
        if (el) el.style.transform = `translate3d(${cur.x * DEPTH[k]}px, ${cur.y * DEPTH[k] * 0.4}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    target.current = { x: -((e.clientX - r.left) / r.width - 0.5) * 2, y: -((e.clientY - r.top) / r.height - 0.5) * 2 };
  };

  if (!look) return null;
  const [gl, gt, gw, gh] = look.glasses;
  const [nx, ny] = look.nose;

  return (
    <section aria-label={`RAYVE — ${product.name}`} className="relative overflow-hidden bg-[#15110e] text-sand">
      <style>{KEYFRAMES}</style>
      <div ref={stage} className="relative h-svh min-h-[560px] overflow-hidden" onMouseMove={onMove} onMouseLeave={() => (target.current = { x: 0, y: 0 })}>
        {box && (
          <>
            {/* The worlds, one per look, cross-fading; the first eases in from slightly closer and out of focus */}
            <div ref={(el) => void (layers.current.world = el)} className="pointer-events-none absolute inset-0 will-change-transform">
              <div className={`absolute transition-all duration-[2200ms] ease-out ${phase >= 1 ? "scale-100 opacity-100 blur-0" : "scale-110 opacity-0 blur-md"}`} style={box.world}>
                {looks.map((l, i) => (
                  <div key={l.slug} className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-out ${i === current ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}>
                    <Image src={l.look.world} alt="" fill unoptimized priority={i === current} className="object-cover" />
                  </div>
                ))}
                {/* Sunlight shifting over the scene */}
                <div className="absolute inset-0 opacity-50 mix-blend-soft-light [background:radial-gradient(circle_at_20%_30%,rgba(255,240,200,0.9),transparent_18%),radial-gradient(circle_at_70%_20%,rgba(255,240,200,0.8),transparent_14%),radial-gradient(circle_at_45%_60%,rgba(255,240,200,0.6),transparent_16%),radial-gradient(circle_at_85%_55%,rgba(255,240,200,0.7),transparent_12%)]" style={{ animation: "tr-dapple 9s ease-in-out infinite" }} />
              </div>
            </div>

            {/* The frame's name, huge, behind the bull */}
            <div ref={(el) => void (layers.current.word = el)} className="pointer-events-none absolute inset-0 will-change-transform">
              <p
                key={`word-${current}`}
                className={`absolute inset-x-0 whitespace-nowrap text-center font-display leading-none tracking-[0.04em] text-[#f4efe2] transition-all duration-1000 ${phase >= 2 && !leaving ? "translate-y-0 opacity-90 delay-[700ms]" : "translate-y-8 opacity-0"}`}
                // As big as fits: 17vw for short names, smaller for long ones so the word stays on screen
                style={{ top: `${box.bull.top + box.bull.height * 0.12}px`, fontSize: `min(17vw, ${(92 / (product.name.length * 1.02)).toFixed(1)}vw)`, textShadow: "0 10px 40px rgba(0,0,0,0.25)" }}
                aria-hidden="true"
              >
                {product.name.toUpperCase()}
              </p>
            </div>

            <Leaves running={phase >= 1} />

            {/* The bull: drops in, lands, then breathes; jumps out when another frame is picked */}
            <div ref={(el) => void (layers.current.bull = el)} className="pointer-events-none absolute inset-0 will-change-transform">
              <div className="absolute" style={box.bull}>
                <div className={`absolute left-1/2 top-full h-[7%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/55 blur-md transition-opacity duration-300 ${phase >= 2 && !leaving ? "opacity-100 delay-[900ms]" : "opacity-0"}`} />
                {phase >= 2 && (
                  <div
                    key={`bull-${landing}`}
                    className="absolute inset-0 transition-transform ease-in"
                    style={{ animation: leaving ? undefined : "tr-land 1.3s cubic-bezier(0.55,0,0.3,1) both", transform: leaving ? "translateY(-120vh)" : undefined, transitionDuration: `${LEAVE_MS}ms` }}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setGlint((n) => n + 1)}
                      onClick={() => setGlint((n) => n + 1)}
                      aria-label={`Toro wearing ${product.name}`}
                      className="pointer-events-auto absolute inset-0 origin-bottom cursor-pointer"
                      style={{ animation: "tr-breathe 3.6s ease-in-out 1.4s infinite" }}
                    >
                      <Image src={look.bull} alt="" fill unoptimized priority className="object-contain object-bottom [filter:brightness(1.04)_sepia(0.08)_saturate(1.05)]" />
                      {/* Warm sun on the bull only */}
                      <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(105deg, rgba(255,232,180,0.8), transparent 45%)", maskImage: `url(${look.bull})`, maskSize: "contain", maskPosition: "bottom", maskRepeat: "no-repeat" }} />
                      {/* A glint sliding across the sunglasses */}
                      <span className="absolute overflow-hidden rounded-[40%]" style={{ left: `${gl}%`, top: `${gt}%`, width: `${gw}%`, height: `${gh}%` }}>
                        <span key={glint} className="absolute inset-y-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent mix-blend-screen" style={{ animation: "tr-glint 0.9s ease-out both", animationDelay: glint ? "0s" : "1.6s" }} />
                      </span>
                      {/* Steam from the nostrils on each breath out */}
                      {[-1, 1].map((side) => (
                        <span key={side} className="absolute size-[9%] rounded-full bg-white/70 blur-md" style={{ left: `${nx + side * 3}%`, top: `${ny}%`, "--dx": `${side * 60}%`, animation: "tr-steam 3.6s ease-out infinite", animationDelay: `${1.4 + (side > 0 ? 0.08 : 0)}s` }} />
                      ))}
                    </button>
                  </div>
                )}
                {/* Dust kicked up by the landing */}
                {phase >= 2 &&
                  !leaving &&
                  Array.from({ length: 14 }, (_, i) => {
                    const a = (i / 14) * Math.PI;
                    return (
                      <span
                        key={`${landing}-${i}`}
                        className="absolute top-full size-[16%] rounded-full bg-[#d9cbb0]/70 blur-lg"
                        style={{ left: `${42 + Math.cos(a) * 10}%`, "--dx": `${Math.cos(a) * 160}%`, "--dy": `${-20 - Math.sin(a) * 60}%`, opacity: 0, animation: "tr-dust 1.2s ease-out 0.85s both" }}
                      />
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* Film: vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_80%_at_50%_45%,transparent_60%,rgba(0,0,0,0.4))]" />

        <div className={`absolute inset-x-5 bottom-24 flex flex-wrap items-end justify-between gap-4 transition-all delay-[2200ms] duration-1000 sm:inset-x-8 lg:inset-x-14 lg:bottom-10 ${phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          {/* The frame he's wearing */}
          <div key={current} className="rounded-2xl border border-white/15 bg-black/35 p-5 backdrop-blur-md">
            <p className="text-[8px] uppercase tracking-[0.35em] text-sand/70">
              N°{pad(index + 1)} · {product.frameColor}
            </p>
            <Name name={product.name} glow={glow} className="mt-1 block text-4xl leading-none" />
            <p className="mt-2 text-sm font-light">{formatPrice(product.price)}</p>
            <div className="mt-4 flex items-center gap-5">
              {WAITLIST_MODE ? (
                <WaitlistButton product={product} className="flex cursor-pointer items-center gap-2 rounded-full bg-sand px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.25em] text-ink hover:bg-cream disabled:opacity-50" />
              ) : (
                <button
                  type="button"
                  disabled={product.stock < 1}
                  onClick={(e) => add(product, 1, e.currentTarget)}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-sand px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.25em] text-ink hover:bg-cream disabled:opacity-50"
                >
                  {product.stock < 1 ? "Sold out" : "Add to bag"} <ArrowRight className="size-3" />
                </button>
              )}
              <Link href={`/product/${product.slug}`} className="text-[10px] uppercase tracking-[0.25em] text-sand/80 hover:text-sand">
                Details
              </Link>
            </div>
          </div>

          {/* The other looks */}
          {looks.length > 1 && (
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/35 p-2 backdrop-blur-md">
              {looks.map((l, i) => (
                <button
                  key={l.slug}
                  type="button"
                  onClick={() => pick(i)}
                  aria-label={`Show ${l.product.name}`}
                  aria-pressed={i === current}
                  className={`flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 transition-colors ${i === current ? "bg-sand text-ink" : "text-sand/80 hover:bg-white/10 hover:text-sand"}`}
                >
                  <span className="relative size-9 overflow-hidden rounded-full bg-mist">
                    <Image src={l.product.images[0]} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em]">{l.product.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
