"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

const wrap = (v, n) => ((v % n) + n) % n;

/**
 * Centre stage: one big photo of the frame with every angle as a thumbnail underneath. Arrows, thumbnails, arrow keys
 * or a swipe change the angle; clicking the photo opens it full screen.
 */
export default function ProductStage({ images, name }) {
  const n = images.length;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const swipe = useRef(null);
  const go = (d) => setActive((i) => wrap(i + d, n));

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setLightbox(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

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
        <div
          className="group relative aspect-[4/5] w-full cursor-zoom-in touch-pan-y select-none overflow-hidden bg-mist"
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = e.clientX - (swipe.current ?? e.clientX);
            swipe.current = null;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            else setLightbox(true);
          }}
        >
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={i === 0 ? name : ""}
              fill
              priority={i === 0}
              loading="eager"
              draggable={false}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={`pointer-events-none object-cover transition-[opacity,scale] duration-700 ease-out ${i === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
            />
          ))}

          {n > 1 && (
            <>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={() => go(-1)}
                aria-label="Previous angle"
                className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 opacity-100 backdrop-blur transition hover:bg-paper lg:opacity-0 lg:group-hover:opacity-100"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={() => go(1)}
                aria-label="Next angle"
                className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 opacity-100 backdrop-blur transition hover:bg-paper lg:opacity-0 lg:group-hover:opacity-100"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          <span className="pointer-events-none absolute bottom-4 left-4 font-display text-[10px] tracking-[0.25em] text-ink/60">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="pointer-events-none absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-paper/90 backdrop-blur">
            <Expand className="size-4" />
          </span>
        </div>

        {n > 1 && (
          <div className="no-scrollbar mt-3 flex justify-center gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Angle ${i + 1}`}
                aria-current={i === active}
                className={`relative aspect-square w-14 shrink-0 overflow-hidden bg-mist transition sm:w-16 ${i === active ? "opacity-100 ring-1 ring-ink" : "opacity-55 hover:opacity-100"}`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover object-[50%_68%]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-olive-950/95" role="dialog" aria-label={`${name} images`}>
          <button onClick={() => setLightbox(false)} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Close">
            <X className="size-5" />
          </button>
          {n > 1 && (
            <>
              <button onClick={() => go(-1)} className="absolute left-4 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Previous image">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => go(1)} className="absolute right-4 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Next image">
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <div className="relative h-[85svh] w-[min(90vw,68svh)]">
            <Image key={images[active]} src={images[active]} alt={name} fill sizes="90vw" className="animate-fade-in object-contain" />
          </div>
          <p className="absolute bottom-6 text-xs tracking-[0.2em] text-sand/60">
            {active + 1} / {n}
          </p>
        </div>
      )}
    </>
  );
}
