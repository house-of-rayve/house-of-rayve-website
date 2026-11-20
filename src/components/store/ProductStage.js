"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

const wrap = (v, n) => ((v % n) + n) % n;

/**
 * The product photos on phones (and the centre-stage layout): a swipeable row that snaps photo to photo, a counter,
 * and every angle as a thumbnail underneath. Tapping a photo opens it full screen, where swiping also moves between
 * photos. Arrow keys work too.
 */
export default function ProductStage({ images, name }) {
  const n = images.length;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const rail = useRef(null);
  const swipe = useRef(null);

  // Move the row to a photo (thumbnails, keys); the row's own scrolling keeps `active` in step
  const show = (i) => {
    const el = rail.current;
    const next = wrap(i, n);
    setActive(next);
    if (el) el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
  };
  // arrow keys (re-bound each time the photo changes, so they always step from the current one)
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") show(active + 1);
      if (e.key === "ArrowLeft") show(active - 1);
      if (e.key === "Escape") setLightbox(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (!n) return <div className="aspect-[4/5] bg-mist" />;

  return (
    <>
      <div className="relative mx-auto w-full max-w-[calc((100svh-13rem)*0.8)]">
        <div className="relative">
          <div
            ref={rail}
            onScroll={(e) => {
              const el = e.currentTarget;
              const i = Math.round(el.scrollLeft / el.clientWidth);
              if (i !== active) setActive(i);
            }}
            className="no-scrollbar flex aspect-[4/5] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-mist"
          >
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setLightbox(true)}
                aria-label={`Open photo ${i + 1} full screen`}
                className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
              >
                <Image src={src} alt={i === 0 ? name : ""} fill priority={i === 0} loading={i < 2 ? "eager" : undefined} draggable={false} sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </button>
            ))}
          </div>

          <span className="pointer-events-none absolute bottom-4 left-4 font-display text-[10px] tracking-[0.25em] text-ink/60">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="pointer-events-none absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-paper/90 backdrop-blur">
            <Expand className="size-4" />
          </span>
        </div>

        {n > 1 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto min-[400px]:justify-center">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => show(i)}
                aria-label={`Angle ${i + 1}`}
                aria-current={i === active}
                className={`relative aspect-square w-12 shrink-0 overflow-hidden bg-mist transition sm:w-16 ${i === active ? "opacity-100 ring-1 ring-ink" : "opacity-55 hover:opacity-100"}`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover object-[50%_68%]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex animate-fade-in touch-pan-y items-center justify-center bg-olive-950/95"
          role="dialog"
          aria-label={`${name} images`}
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = e.clientX - (swipe.current ?? e.clientX);
            swipe.current = null;
            if (Math.abs(dx) > 40) show(active + (dx < 0 ? 1 : -1));
          }}
        >
          <button onClick={() => setLightbox(false)} className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Close">
            <X className="size-5" />
          </button>
          {n > 1 && (
            // arrows on larger screens only; phones swipe
            <>
              <button onClick={() => show(active - 1)} className="absolute left-4 hidden size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20 sm:grid" aria-label="Previous image">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => show(active + 1)} className="absolute right-4 hidden size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20 sm:grid" aria-label="Next image">
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <div className="relative h-[85svh] w-[min(90vw,68svh)]">
            <Image key={images[active]} src={images[active]} alt={name} fill sizes="90vw" draggable={false} className="pointer-events-none animate-fade-in object-contain" />
          </div>
          <p className="absolute bottom-6 text-xs tracking-[0.2em] text-sand/60">
            {active + 1} / {n}
          </p>
        </div>
      )}
    </>
  );
}
