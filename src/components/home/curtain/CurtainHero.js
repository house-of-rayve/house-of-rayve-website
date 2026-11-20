"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import "./curtain-hero.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"], variable: "--rv-serif", display: "swap" });

/**
 * Home hero: olive velvet stage curtains (three.js) part to reveal the arena with three RAYVE frames.
 * Sits under the site's transparent header (pass the same -mt as the header height via className).
 */
export default function CurtainHero({ className = "" }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let dispose = null;
    let cancelled = false;
    // safety net: if the 3D layer can't start, still show the arena after a few seconds
    const safety = setTimeout(() => {
      if (!hero.classList.contains("gl-ready")) hero.classList.add("is-playing", "is-revealed");
    }, 8000);

    const q = new URLSearchParams(window.location.search).get("curtain"); // QA: ?curtain=0.5 freezes the curtain
    const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
    import("./curtainEngine").then(({ mountCurtain }) => {
      if (cancelled) return;
      mountCurtain(hero, {
        markSrc: "/images/curtain/rayve-mark.png",
        wordSrc: "/images/curtain/rayve-wordmark.png",
        fontFamily,
        freeze: q !== null ? parseFloat(q) : null,
      }).then((d) => {
        if (cancelled) d();
        else dispose = d;
      });
    }).catch(() => hero.classList.add("is-playing", "is-revealed"));

    return () => {
      cancelled = true;
      clearTimeout(safety);
      dispose?.();
    };
  }, []);

  return (
    <section ref={heroRef} className={`rv-curtain ${serif.variable} ${className}`} aria-label="RAYVE — the arena">
      <div className="rv-ambient" aria-hidden="true" />
      <div className="rv-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/curtain/arena-v3@2x.webp"
          srcSet="/images/curtain/arena-v3.webp 1672w, /images/curtain/arena-v3@2x.webp 3344w"
          sizes="100vw"
          alt="Three RAYVE sunglasses displayed in lit stone niches in a bullring arena at sunset"
          fetchPriority="high"
        />
      </div>
      <div className="rv-shade" aria-hidden="true" />
      <div className="rv-scrim" aria-hidden="true" />

      <div className="rv-ui">
        <div className="rv-headline">
          <p className="rv-eyebrow rv-up rv-d1">Collection No. 1 · The Arena</p>
          <p className="rv-title rv-up rv-d2">Stare down the <em>sun.</em></p>
        </div>
        <div className="rv-cta rv-up rv-d3">
          <Link className="rv-btn" href="/shop">Shop the collection</Link>
          <Link className="rv-btn rv-btn--ghost" href="/about">The story</Link>
        </div>
      </div>

      <div className="rv-cover" aria-hidden="true" />
      <canvas className="rv-gl" data-curtain-gl aria-hidden="true" />
      <p className="rv-prompt">Click to open</p>
      <button className="rv-replay" type="button" data-curtain-replay>↺ Replay the curtain</button>
    </section>
  );
}
