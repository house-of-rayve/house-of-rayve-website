"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./curtain-hero.css";

/**
 * Home hero: olive velvet stage curtains (three.js) part to reveal the arena with three RAYVE frames.
 * Sits under the site's transparent header (pass the same -mt as the header height via className).
 */
// The three frames on display in the arena photo: each niche links to its product page.
// Positions are % of the photo (arena-v3), so they stay on the niche at any screen size.
const NICHES = [
  { slug: "fiero", name: "Fiero", left: 18.5, width: 14.6 },
  { slug: "bravo", name: "Bravo", left: 42.9, width: 14.6 },
  { slug: "nobel", name: "Nobel", left: 67.5, width: 14.6 },
];

export default function CurtainHero({ className = "" }) {
  const heroRef = useRef(null);
  const [active, setActive] = useState(1); // phones: which niche is in view (starts on the middle one)
  const [swiped, setSwiped] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let dispose = null;
    let cancelled = false;
    // safety net: if the 3D layer can't start, still show the arena after a few seconds
    const safety = setTimeout(() => {
      if (!hero.classList.contains("gl-ready")) hero.classList.add("is-playing", "is-revealed");
    }, 8000);

    const params = new URLSearchParams(window.location.search);
    const q = params.get("curtain"); // QA: ?curtain=0.5 freezes the curtain; add &poster to keep the frame so it can be saved as the poster
    const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
    import("./curtainEngine").then(({ mountCurtain }) => {
      if (cancelled) return;
      mountCurtain(hero, {
        markSrc: "/images/curtain/rayve-mark.png",
        wordSrc: "/images/curtain/rayve-wordmark.png",
        fontFamily,
        freeze: q !== null ? parseFloat(q) : null,
        keepFrame: params.has("poster"),
      }).then((d) => {
        if (cancelled) d();
        else dispose = d;
      });
    }).catch(() => hero.classList.add("is-playing", "is-revealed"));

    // phones: the arena pans sideways one niche at a time, starting on the middle one. Mobile browsers can lay the
    // photo out (or reset the snap position) after mount, so keep re-centring until the visitor swipes themselves.
    const pan = hero.querySelector("[data-curtain-pan]");
    let touched = false;
    const centre = () => {
      if (!pan || touched || pan.scrollWidth <= pan.clientWidth) return;
      const mid = pan.querySelectorAll(".rv-niche")[1];
      pan.scrollLeft = mid ? mid.offsetLeft + mid.offsetWidth / 2 - pan.clientWidth / 2 : (pan.scrollWidth - pan.clientWidth) / 2;
    };
    const onTouch = () => (touched = true);
    const onScroll = () => {
      if (!pan) return;
      const mid = pan.scrollLeft + pan.clientWidth / 2;
      let best = 0;
      pan.querySelectorAll(".rv-niche").forEach((el, i, all) => {
        const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (d < Math.abs(all[best].offsetLeft + all[best].offsetWidth / 2 - mid)) best = i;
      });
      setActive(best);
      if (touched && best !== 1) setSwiped(true);
    };
    centre();
    const raf = requestAnimationFrame(() => requestAnimationFrame(centre));
    const ro = pan ? new ResizeObserver(centre) : null;
    if (pan) {
      ro.observe(pan.firstElementChild);
      pan.addEventListener("pointerdown", onTouch, { passive: true });
      pan.addEventListener("touchstart", onTouch, { passive: true });
      pan.addEventListener("scroll", onScroll, { passive: true });
      pan.querySelector("img")?.addEventListener("load", centre);
    }
    // the curtain opening changes the layout under it: line the middle frame up again
    const mo = new MutationObserver(centre);
    mo.observe(hero, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", centre);
    hero.rvShow = (i) => {
      const el = pan?.querySelectorAll(".rv-niche")[i];
      if (!el) return;
      touched = true;
      pan.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - pan.clientWidth / 2, behavior: "smooth" });
    };

    return () => {
      window.removeEventListener("resize", centre);
      cancelAnimationFrame(raf);
      ro?.disconnect();
      mo.disconnect();
      pan?.removeEventListener("pointerdown", onTouch);
      pan?.removeEventListener("touchstart", onTouch);
      pan?.removeEventListener("scroll", onScroll);
      cancelled = true;
      clearTimeout(safety);
      dispose?.();
    };
  }, []);

  return (
    <section ref={heroRef} className={`rv-curtain ${className}`} aria-label="RAYVE — the arena">
      <div className="rv-ambient" aria-hidden="true" />
      {/* the arena photo; on phones it fills the screen height and pans sideways between the niches */}
      <div className="rv-stage" data-curtain-pan>
        <div className="rv-stage-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/curtain/arena-v3@2x.webp"
            srcSet="/images/curtain/arena-v3.webp 1672w, /images/curtain/arena-v3@2x.webp 3344w"
            sizes="(max-aspect-ratio: 3/4) 260vh, 100vw"
            alt="Three RAYVE sunglasses displayed in lit stone niches in a bullring arena at sunset"
            fetchPriority="high"
          />
          {NICHES.map((n) => (
            <Link key={n.slug} href={`/product/${n.slug}`} className="rv-niche" style={{ left: `${n.left}%`, width: `${n.width}%` }} aria-label={`View ${n.name}`}>
              <span className="rv-niche-label">{n.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="rv-shade" aria-hidden="true" />
      <div className="rv-scrim" aria-hidden="true" />

      <div className="rv-ui">
        <div className="rv-headline">
          <p className="rv-title rv-up rv-d2">
            Stare down
            <br />
            <em>the sun</em>
          </p>
          <span className="rv-rule rv-up rv-d3" aria-hidden="true" />
        </div>
        {/* phones: which frame is in view; tap a dot to slide to it */}
        <div className="rv-dots rv-up rv-d3">
          <p className={`rv-hint ${swiped ? "is-gone" : ""}`}>Swipe for more</p>
          <div className="rv-dots-row">
            {NICHES.map((n, i) => (
              <button
                key={n.slug}
                type="button"
                className={i === active ? "is-active" : ""}
                aria-label={`Show ${n.name}`}
                aria-current={i === active}
                onClick={() => heroRef.current?.rvShow?.(i)}
              >
                <span>{n.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* closed-curtain poster: shows instantly, the live 3D curtain takes over as soon as it's ready */}
      <picture className="rv-cover">
        <source media="(max-aspect-ratio: 3/4)" srcSet="/images/curtain/poster-tall.webp" />
        <img src="/images/curtain/poster-wide.webp" alt="" fetchPriority="high" decoding="async" />
      </picture>
      <canvas className="rv-gl" data-curtain-gl aria-hidden="true" />
      <button className="rv-replay" type="button" data-curtain-replay>Replay</button>
    </section>
  );
}
