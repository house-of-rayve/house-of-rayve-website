"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { EDITORIAL_EXCLUDE } from "@/lib/constants";

const DURATION = 5000; // ms per story

/**
 * Instagram-style lookbook: a row of story bubbles; tapping one opens full-screen stories that advance on
 * their own (tap the right side for next, the left for previous, hold to pause).
 */
export default function LookbookStories({ products }) {
  // Stories use the on-model photo (second image) of each frame
  const stories = products.filter((p) => p.images[1] && !EDITORIAL_EXCLUDE.includes(p.images[1])).slice(0, 10);
  const [open, setOpen] = useState(null); // index of the story being viewed
  const [seen, setSeen] = useState(() => new Set());
  const [progress, setProgress] = useState(0);
  const paused = useRef(false);
  const elapsed = useRef(0);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (i) => {
      elapsed.current = 0;
      setProgress(0);
      if (i < 0 || i >= stories.length) return setOpen(null);
      setOpen(i);
      setSeen((s) => new Set(s).add(stories[i].id));
    },
    [stories],
  );

  // Advance timer
  useEffect(() => {
    if (open === null) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now) => {
      if (!paused.current) elapsed.current += now - last;
      last = now;
      const p = Math.min(1, elapsed.current / DURATION);
      setProgress(p);
      if (p >= 1) go(open + 1);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, go]);

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(open + 1);
      if (e.key === "ArrowLeft") go(open - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, go]);

  if (!stories.length) return null;
  const story = open !== null ? stories[open] : null;

  return (
    <>
      {/* Phones/tablets: scrolls from the first story. Desktop: bubbles scale with the screen so all fit in one row */}
      <div className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-2 pt-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        <div className="mx-auto flex w-max gap-5 sm:gap-8 lg:gap-[min(40px,1.4vw)]">
        {stories.map((p, i) => (
          <button
            key={p.id}
            onClick={() => go(i)}
            className="group flex w-20 shrink-0 flex-col items-center sm:w-24 lg:w-[min(122px,calc(6vw+18px))]"
          >
            {/* thin brushed-gold ring (grey once seen), a little air, then the photo */}
            <span
              className={`rounded-full p-px transition-transform duration-500 ease-out group-hover:-translate-y-1 ${
                seen.has(p.id) ? "bg-line" : "bg-[conic-gradient(from_210deg,#e3cf8f,#a69f4e,#5c5a35,#c9a85b,#e3cf8f)]"
              }`}
            >
              <span className="block rounded-full bg-canvas p-1 sm:p-1.5">
                <span className="relative block size-[72px] overflow-hidden rounded-full bg-mist sm:size-[84px] lg:size-[min(104px,6vw)]">
                  <Image src={p.images[1]} alt="" fill sizes="104px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5" />
                </span>
              </span>
            </span>
            <span className="mt-3 w-full truncate text-center font-display text-[9px] uppercase leading-tight tracking-[0.18em] transition-colors group-hover:text-olive-700 sm:text-[10px]">
              {p.name}
            </span>
            {p.shape && <span className="mt-1 text-[10px] text-muted">{p.shape}</span>}
            <span className="sr-only">— open story</span>
          </button>
        ))}
        </div>
      </div>

      {story && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-olive-950/95 animate-fade-in" role="dialog" aria-modal="true" aria-label={`${story.name} story`}>
          <div
            className="relative h-full w-full overflow-hidden bg-olive-950 sm:h-[min(92svh,860px)] sm:w-auto sm:aspect-[9/16] sm:rounded-sm"
            onPointerDown={() => (paused.current = true)}
            onPointerUp={() => (paused.current = false)}
            onPointerLeave={() => (paused.current = false)}
          >
            <Image key={story.id} src={story.images[1]} alt={story.name} fill priority sizes="(min-width:640px) 480px, 100vw" className="animate-fade-in object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

            {/* progress bars */}
            <div className="absolute inset-x-3 top-3 flex gap-1">
              {stories.map((s, i) => (
                <span key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-sand/30">
                  <span className="block h-full bg-sand" style={{ width: `${i < open ? 100 : i === open ? progress * 100 : 0}%` }} />
                </span>
              ))}
            </div>
            <div className="absolute inset-x-3 top-6 flex items-center justify-between text-sand">
              <p className="font-display text-[10px] uppercase tracking-[0.25em]">RAYVE · {story.name}</p>
              <button onClick={close} className="grid size-9 place-items-center" aria-label="Close stories">
                <X className="size-5" />
              </button>
            </div>

            {/* tap zones */}
            <button className="absolute inset-y-16 left-0 w-1/3" onClick={() => go(open - 1)} aria-label="Previous story" />
            <button className="absolute inset-y-16 right-0 w-2/3" onClick={() => go(open + 1)} aria-label="Next story" />

            <div className="absolute inset-x-0 bottom-0 p-5 text-sand">
              <p className="display-title text-2xl" data-no-split>
                {story.name}
              </p>
              {story.tagline && <p className="mt-1 text-sm text-sand/75">{story.tagline}</p>}
              <Link href={`/product/${story.slug}`} onClick={close} className="btn mt-5 h-11 w-full bg-sand text-olive-950 hover:bg-paper">
                Shop {story.name} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
