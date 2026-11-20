"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const DESKTOP = "(min-width: 1024px)";
const HEADER = 64; // px, the site header the strip pins under

/**
 * Product photos as a film strip. On desktop the section pins under the header with `panel` (name, price, waitlist,
 * details) held still on the left; scrolling down slides the photos sideways and they disappear behind the panel.
 * On phones it is a plain swipeable row with the panel underneath.
 */
export default function FilmStrip({ images, name, panel }) {
  const section = useRef(null);
  const track = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    let raf = 0;
    const measure = () => {
      const s = section.current;
      const t = track.current;
      if (!s || !t) return;
      if (!mq.matches) {
        s.style.height = "";
        t.style.transform = "";
        return;
      }
      const distance = Math.max(0, t.scrollWidth - t.parentElement.clientWidth);
      s.style.height = `${distance + window.innerHeight}px`;
      const travelled = Math.min(distance, Math.max(0, HEADER - s.getBoundingClientRect().top));
      t.style.transform = `translate3d(${-travelled}px,0,0)`;
      setProgress(distance ? travelled / distance : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
    };
  }, [images.length]);

  return (
    <section ref={section} className="relative">
      <div className="flex flex-col lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:flex-row">
        {/* Held still on desktop; the photos slide in behind it */}
        <div className="no-scrollbar relative z-10 order-2 shrink-0 bg-canvas px-5 py-10 sm:px-8 lg:order-1 lg:h-full lg:w-[min(520px,38vw)] lg:overflow-y-auto lg:px-12 lg:py-10 xl:px-14">
          {panel}
        </div>

        <div className="relative order-1 min-w-0 flex-1 overflow-hidden lg:order-2">
          <div
            ref={track}
            className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pt-6 will-change-transform sm:px-8 lg:h-full lg:snap-none lg:overflow-visible lg:px-0 lg:pr-2 lg:pt-0"
          >
            {images.map((src, i) => (
              <div key={src} className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center bg-mist sm:w-[60vw] lg:h-full lg:w-auto">
                <Image src={src} alt={i === 0 ? name : ""} fill priority={i < 2} loading="eager" sizes="(min-width: 1024px) 60vh, 82vw" className="object-cover" />
                <span className="pointer-events-none absolute bottom-5 left-5 font-display text-[10px] tracking-[0.3em] text-ink/45">
                  {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 hidden h-0.5 bg-line lg:block">
            <div className="h-full bg-olive-800" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
