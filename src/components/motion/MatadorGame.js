"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { gsap, prefersReducedMotion } from "./gsap";
import { playBull } from "./bullSound";

const BEST_KEY = "rayve_ole_best";
const AIM_TIME = 0.75; // seconds the bull paws the ground before charging
const CHARGE_SPEED = 950; // px/s
const OVERSHOOT = 240; // how far past the target the bull runs
const MISS_DISTANCE = 70; // cape further than this from the bull when it arrives = Olé

const noSubscribe = () => () => {};
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

/**
 * 404 mini-game: the cursor (or finger) is the matador's cape. The bull locks on to where the cape is,
 * charges, and runs through — pull the cape away at the last moment for an Olé.
 */
export default function MatadorGame() {
  const area = useRef(null);
  const bullEl = useRef(null);
  const capeEl = useRef(null);
  const popEl = useRef(null);
  const [score, setScore] = useState(0);
  const storedBest = useSyncExternalStore(noSubscribe, readBest, () => 0);
  const [newBest, setNewBest] = useState(0);
  const best = Math.max(storedBest, newBest);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  // Reduced-motion visitors get a plain 404 without the game
  const enabled = !useSyncExternalStore(noSubscribe, prefersReducedMotion, () => false);

  useEffect(() => {
    if (!enabled) return;
    const el = area.current;
    const bull = bullEl.current;
    const cape = capeEl.current;
    const r = () => el.getBoundingClientRect();

    // Positions are relative to the play area
    const s = {
      cape: { x: r().width * 0.68, y: r().height * 0.55 },
      bull: { x: r().width * 0.22, y: r().height * 0.6 },
      dir: { x: 1, y: 0 },
      phase: "wait", // wait | aim | charge | recover
      timer: 0,
      target: null,
      travelled: 0,
      distance: 0,
      judged: false,
      score: 0,
      started: false,
    };
    const capeX = gsap.quickTo(cape, "x", { duration: 0.18, ease: "power3" });
    const capeY = gsap.quickTo(cape, "y", { duration: 0.18, ease: "power3" });
    gsap.set(cape, { x: s.cape.x, y: s.cape.y });
    gsap.set(bull, { x: s.bull.x, y: s.bull.y });

    const pop = (text, good) => {
      const p = popEl.current;
      p.textContent = text;
      p.style.color = good ? "#c9c27a" : "#e8b4a0";
      gsap.fromTo(p, { x: s.bull.x, y: s.bull.y - 40, opacity: 1, scale: 0.6 }, { y: s.bull.y - 110, scale: 1.15, opacity: 0, duration: 1.1, ease: "power2.out" });
    };

    const onMove = (e) => {
      const b = r();
      s.cape.x = Math.min(b.width - 20, Math.max(20, e.clientX - b.left));
      s.cape.y = Math.min(b.height - 20, Math.max(20, e.clientY - b.top));
      capeX(s.cape.x);
      capeY(s.cape.y);
      if (!s.started) {
        s.started = true;
        s.phase = "aim";
        s.timer = 0;
        setStarted(true);
      }
    };

    const tick = (_, deltaMs) => {
      const dt = Math.min(0.05, deltaMs / 1000);
      const b = r();
      if (s.phase === "aim") {
        s.timer += dt;
        // Face the cape and paw the ground
        const dx = s.cape.x - s.bull.x;
        const dy = s.cape.y - s.bull.y;
        const d = Math.hypot(dx, dy) || 1;
        s.dir = { x: dx / d, y: dy / d };
        gsap.set(bull, { scaleX: s.dir.x < 0 ? -1 : 1, rotation: Math.sin(s.timer * 28) * 4, scale: 1 });
        if (s.timer >= AIM_TIME) {
          // Lock on to where the cape is right now, then charge
          s.phase = "charge";
          s.target = { ...s.cape };
          s.distance = d;
          s.travelled = 0;
          s.judged = false;
          playBull();
        }
      } else if (s.phase === "charge") {
        const step = CHARGE_SPEED * dt;
        s.bull.x += s.dir.x * step;
        s.bull.y += s.dir.y * step;
        s.travelled += step;
        gsap.set(bull, { x: s.bull.x, y: s.bull.y, rotation: s.dir.y * 12 * (s.dir.x < 0 ? -1 : 1), scale: 1.12 });
        // Judge the pass once the bull reaches the spot it aimed at
        if (!s.judged && s.travelled >= s.distance) {
          s.judged = true;
          const miss = Math.hypot(s.cape.x - s.bull.x, s.cape.y - s.bull.y) > MISS_DISTANCE;
          if (miss) {
            s.score += 1;
            setScore(s.score);
            if (s.score > readBest()) {
              try {
                localStorage.setItem(BEST_KEY, String(s.score));
              } catch {}
            }
            setNewBest((prev) => Math.max(prev, s.score));
            pop("¡Olé!", true);
            setMessage("");
          } else {
            s.score = 0;
            setScore(0);
            pop("¡Ay!", false);
            setMessage("Caught the cape — pull it away just before the bull arrives.");
            gsap.fromTo(cape, { rotation: -30 }, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
          }
        }
        const out = s.bull.x < 30 || s.bull.x > b.width - 30 || s.bull.y < 30 || s.bull.y > b.height - 30;
        if (s.travelled >= s.distance + OVERSHOOT || out) {
          s.bull.x = Math.min(b.width - 30, Math.max(30, s.bull.x));
          s.bull.y = Math.min(b.height - 30, Math.max(30, s.bull.y));
          s.phase = "recover";
          s.timer = 0;
        }
      } else if (s.phase === "recover") {
        s.timer += dt;
        gsap.set(bull, { x: s.bull.x, y: s.bull.y, scale: 1, rotation: 0 });
        if (s.timer > 0.45) {
          s.phase = "aim";
          s.timer = 0;
        }
      }
    };

    gsap.ticker.add(tick);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onMove);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
    };
  }, [enabled]);

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-olive-950 text-sand">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(166,159,78,0.16),transparent_65%)]" />
      {/* Arena ring */}
      <div className="pointer-events-none absolute left-1/2 top-[58%] aspect-square w-[150vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sand/5 sm:w-[90vmax]" />

      <div className="container-x relative z-10 flex items-start justify-between gap-6 pt-8 sm:pt-12">
        <div>
          <Link href="/" aria-label="RAYVE home" className="inline-block text-olive-400">
            <LogoMark className="h-7 w-12" />
          </Link>
          <p className="mt-8 font-display text-[11px] uppercase tracking-[0.3em] text-olive-400">Error 404</p>
          <h1 className="display-title mt-3 text-3xl sm:text-5xl">This page ran off.</h1>
          <p className="mt-3 max-w-sm text-sm text-sand/60">
            {enabled
              ? "While you're here: you're the matador. Let the bull charge at the cape, then pull it away at the last moment."
              : "The page you're looking for has moved or no longer exists."}
          </p>
        </div>
        {enabled && (
          <div className="shrink-0 text-right" aria-live="polite">
            <p className="font-display text-3xl sm:text-5xl">{score}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-sand/50">Olé · best {best}</p>
          </div>
        )}
      </div>

      {enabled && (
        <div ref={area} className="relative z-0 flex-1 cursor-none touch-none select-none" aria-hidden="true">
          {/* Bull */}
          <div ref={bullEl} className="absolute left-0 top-0 -ml-9 -mt-6 will-change-transform">
            <span className="absolute -bottom-3 left-1/2 h-3 w-16 -translate-x-1/2 rounded-[50%] bg-black/40 blur-sm" />
            <LogoMark className="relative h-12 w-[72px] text-sand" />
          </div>
          {/* Cape (muleta) */}
          <div ref={capeEl} className="absolute left-0 top-0 -ml-2 -mt-2 will-change-transform">
            <svg width="70" height="58" viewBox="0 0 70 58" className="origin-top-left drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]">
              <path d="M4 4 L64 6 C62 22 66 38 58 54 C44 50 30 56 16 50 C10 36 8 20 4 4 Z" fill="#a3201b" />
              <path d="M4 4 L64 6" stroke="#5a4a2a" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <span ref={popEl} className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 font-display text-2xl uppercase tracking-[0.1em] opacity-0" />
          {!started && (
            <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-[11px] uppercase tracking-[0.3em] text-sand/50">
              Move your mouse — or drag your finger — to wave the cape
            </p>
          )}
        </div>
      )}

      <div className="container-x relative z-10 flex flex-wrap items-center justify-between gap-4 pb-8 pt-4">
        <p className="min-h-4 text-xs text-[#e8b4a0]">{message}</p>
        <div className="flex gap-2">
          <Link href="/" className="btn h-11 bg-sand text-olive-950 hover:bg-paper">
            Back to home
          </Link>
          <Link href="/shop" className="btn h-11 border border-sand/30 text-sand hover:border-sand">
            Shop sunglasses
          </Link>
        </div>
      </div>
    </div>
  );
}
