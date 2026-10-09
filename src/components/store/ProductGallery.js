"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export default function ProductGallery({ images, name, badge }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null); // { x, y } in % while hovering
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
      <div className="flex flex-col-reverse gap-3 lg:flex-row">
        {images.length > 1 && (
          <div className="no-scrollbar hidden gap-3 lg:flex lg:w-20 lg:flex-col">
            {images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => select(i)}
                onMouseEnter={() => setActive(i)}
                className={`relative aspect-[4/5] w-full overflow-hidden bg-mist transition-all ${active === i ? "ring-1 ring-olive-800 ring-offset-2 ring-offset-canvas" : "opacity-50 hover:opacity-100"}`}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Desktop: hover-to-zoom main image */}
        <div
          className="relative hidden aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-mist lg:block"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(true)}
        >
          <Image
            key={images[active]}
            src={images[active]}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="animate-fade-in object-cover transition-transform duration-200 ease-out"
            style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          {badge && <span className="absolute left-4 top-4 bg-olive-800 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-sand">{badge}</span>}
          <span className={`absolute bottom-4 right-4 flex items-center gap-2 bg-paper/90 px-3 py-2 text-[10px] uppercase tracking-[0.2em] backdrop-blur transition-opacity ${zoom ? "opacity-0" : ""}`}>
            <Expand className="size-3.5" /> Hover to zoom · click to expand
          </span>
        </div>

        {/* Mobile: swipeable rail */}
        <div className="relative lg:hidden">
          <div
            ref={rail}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory overflow-x-auto sm:-mx-8 lg:mx-0"
            onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {images.map((src, i) => (
              <button key={src + i} onClick={() => setLightbox(true)} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-mist" aria-label="Expand image">
                <Image src={src} alt={i === 0 ? name : ""} fill priority={i === 0} sizes="100vw" className="object-cover" />
              </button>
            ))}
          </div>
          {badge && <span className="absolute left-0 top-4 bg-olive-800 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-sand">{badge}</span>}
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <button key={src + i} onClick={() => select(i)} aria-label={`Image ${i + 1}`} className={`h-1.5 rounded-full transition-all ${active === i ? "w-6 bg-paper" : "w-1.5 bg-paper/50"}`} />
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
