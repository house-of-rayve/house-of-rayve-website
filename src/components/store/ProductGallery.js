"use client";

import { useEffect, useRef, useState, useSyncExternalStore, ViewTransition } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

// Desktop and mobile galleries are both in the DOM; only the visible one may carry the shared transition name
const DESKTOP = "(min-width: 1024px)";
const subscribeDesktop = (cb) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useIsDesktop = () => useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => true);

/** Mobile slide: double-tap to zoom in where you tapped, drag a finger to look around, double-tap again to reset. */
function ZoomSlide({ src, alt, priority, children }) {
  const [zoom, setZoom] = useState(null); // { x, y } transform-origin in % while zoomed
  const lastTap = useRef(0);
  const at = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  return (
    <div
      className={`relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-mist ${zoom ? "touch-none" : ""}`}
      onPointerUp={(e) => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
          setZoom((z) => (z ? null : at(e)));
          lastTap.current = 0;
        } else lastTap.current = now;
      }}
      onPointerMove={(e) => zoom && e.buttons !== 0 && setZoom(at(e))}
    >
      <div className="absolute inset-0 transition-transform duration-300 ease-out" style={zoom ? { transform: "scale(2.4)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
        {children ?? <Image src={src} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />}
      </div>
      {zoom && <span className="absolute left-3 top-3 bg-paper/90 px-2 py-1 text-[9px] uppercase tracking-[0.2em]">Double-tap to reset</span>}
    </div>
  );
}

function Morph({ slug, enabled, children }) {
  if (!enabled) return children;
  return (
    <ViewTransition name={`product-${slug}`} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

export default function ProductGallery({ images, name, badge, slug }) {
  const isDesktop = useIsDesktop();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const rail = useRef(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length]);

  if (!images.length) return <div className="aspect-[4/5] bg-mist" />;

  const select = (i) => {
    setActive(i);
    const el = rail.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };

  return (
    <>
      <div>
        {/* Desktop: every photo stacked (the details column beside it stays put); click to expand */}
        <div data-gallery-main className="hidden flex-col gap-3 lg:flex">
          {images.map((src, i) => (
            <div key={src + i} className="relative">
              <button onClick={() => (setActive(i), setLightbox(true))} className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-mist" aria-label={`Expand image ${i + 1}`}>
                {i === 0 ? (
                  // Same transition name as the shop card, so the photo morphs into place
                  <Morph slug={slug} enabled={isDesktop}>
                    <div className="absolute inset-0">
                      <Image src={src} alt={name} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                    </div>
                  </Morph>
                ) : (
                  <Image src={src} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
                )}
              </button>
              {i === 0 && badge && <span className="pointer-events-none absolute left-4 top-4 bg-olive-800 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-sand">{badge}</span>}
              {i === 0 && (
                <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 bg-paper/90 px-3 py-2 text-[10px] uppercase tracking-[0.2em] backdrop-blur">
                  <Expand className="size-3.5" /> Click to expand
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: swipeable rail */}
        <div data-gallery-main className="relative lg:hidden">
          <div
            ref={rail}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto sm:-mx-8 lg:mx-0"
            onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {images.map((src, i) => (
              <ZoomSlide key={src + i} src={src} alt={i === 0 ? name : ""} priority={i === 0}>
                {i === 0 ? (
                  <Morph slug={slug} enabled={!isDesktop}>
                    <div className="absolute inset-0">
                      <Image src={src} alt={name} fill priority sizes="100vw" className="object-cover" />
                    </div>
                  </Morph>
                ) : undefined}
              </ZoomSlide>
            ))}
          </div>
          {badge && <span className="absolute left-0 top-4 bg-olive-800 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-sand">{badge}</span>}
          <button onClick={() => setLightbox(true)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-paper/90 backdrop-blur" aria-label="Expand images">
            <Expand className="size-4" />
          </button>
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((src, i) => (
                // the visible dot is small; the button around it is a full-size touch target
                <button key={src + i} onClick={() => select(i)} aria-label={`Image ${i + 1}`} className="grid h-6 min-w-6 place-items-center">
                  <span className={`block h-1.5 rounded-full transition-all ${active === i ? "w-6 bg-paper" : "w-1.5 bg-paper/50"}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-olive-950/95 animate-fade-in" role="dialog" aria-label={`${name} images`}>
          <button onClick={() => setLightbox(false)} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Close">
            <X className="size-5" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={() => setActive((i) => (i - 1 + images.length) % images.length)} className="absolute left-4 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Previous image">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => setActive((i) => (i + 1) % images.length)} className="absolute right-4 grid size-11 place-items-center rounded-full bg-sand/10 text-sand hover:bg-sand/20" aria-label="Next image">
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <div className="relative h-[85svh] w-[min(90vw,68svh)]">
            <Image key={images[active]} src={images[active]} alt={name} fill sizes="90vw" className="animate-fade-in object-contain" />
          </div>
          <p className="absolute bottom-6 text-xs tracking-[0.2em] text-sand/60">
            {active + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
