"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

// HD photography from Unsplash (free to use under the Unsplash License), served at the exact size
// each screen needs straight from Unsplash's image CDN via the loader below.
//   https://unsplash.com/photos/jS-vBufwKyY  https://unsplash.com/photos/QoFhXdW_vc8  https://unsplash.com/photos/z3cm1MyYL7o
const unsplashLoader = ({ src, width, quality }) => `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 80}`;

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1760446032400-506ec8963e6a",
    position: "50% 60%",
    align: "right",
    split: true, // product shot: image on the left 60%, text on a solid panel (desktop)
    eyebrow: "New season · Collection 01",
    title: "Own the energy",
    text: "A frame you recognise — altered. Distinctive silhouettes, made for ordinary days, not just special ones.",
    cta: ["Shop the collection", "/shop"],
  },
  {
    img: "https://images.unsplash.com/photo-1600076280106-22cb8bd62b22",
    position: "35% 45%",
    align: "right",
    eyebrow: "The Sevilla edit",
    title: "Poise. Precision. Command.",
    text: "Eyewear that commands attention without asking for it.",
    cta: ["Explore sunglasses", "/shop?category=Sunglasses"],
  },
  {
    img: "https://images.unsplash.com/photo-1715875892986-10edbca5c6fb",
    position: "95% 50%",
    align: "left",
    eyebrow: "Premium, in the everyday",
    title: "Golden hour",
    text: "100% UV400 lenses and hand-polished frames — the pair you reach for without thinking.",
    cta: ["Shop all frames", "/shop"],
  },
];

const DURATION = 6500;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [index, paused]);

  const go = (dir) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    // -mt matches the header height (64px + 1px border) so the hero sits flush under the announcement bar.
    // Height = viewport − announcement bar (32px) − perks bar (64px / 80px), so hero + perks fill the first screen.
    <section
      className="relative isolate -mt-[65px] h-[calc(100svh-96px)] min-h-[560px] md:h-[calc(100svh-112px)] overflow-hidden bg-olive-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.img}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {s.split && <div className="absolute inset-y-0 right-0 hidden w-[40%] bg-olive-950 md:block" />}
          <div className={`absolute inset-y-0 left-0 overflow-hidden ${s.split ? "w-full md:w-[60%]" : "w-full"}`}>
          <Image
            loader={unsplashLoader}
            src={s.img}
            alt=""
            fill
            priority={i === 0}
            quality={85}
            sizes={s.split ? "(min-width:768px) 60vw, 100vw" : "100vw"}
            style={{ objectPosition: s.position }}
            className={`object-cover ${i === index ? "animate-ken-burns" : ""}`}
          />
          </div>
          {s.split ? (
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/90 via-olive-950/45 to-olive-950/10 md:hidden" />
          ) : (
            <>
              <div className="absolute inset-0 bg-olive-950/25" />
              <div
                className={`absolute inset-0 ${
                  s.align === "left" ? "bg-gradient-to-r" : s.align === "right" ? "bg-gradient-to-l" : "bg-gradient-to-b"
                } from-olive-950/75 via-olive-950/30 to-transparent`}
              />
            </>
          )}
        </div>
      ))}

      <div
        className={`container-x relative flex h-full flex-col justify-center pt-16 ${SLIDES[index].split ? "max-md:justify-end max-md:pb-20" : ""} ${
          SLIDES[index].align === "left"
            ? "items-center text-center md:items-start md:text-left"
            : SLIDES[index].align === "right"
              ? "items-center text-center md:items-end md:text-right"
              : "items-center text-center"
        }`}
      >
        {SLIDES.map(
          (s, i) =>
            i === index && (
              <div
                key={s.title}
                className={`flex flex-col text-sand ${
                  s.split
                    ? "items-center md:w-[calc(40%-3rem)] md:items-start md:text-left"
                    : `max-w-2xl ${s.align === "left" ? "items-center md:items-start" : s.align === "right" ? "items-center md:items-end" : "items-center"}`
                }`}
              >
                <p className="eyebrow animate-fade-up text-sand/80">{s.eyebrow}</p>
                <h1 className="display-title mt-6 animate-fade-up text-4xl [animation-delay:100ms] sm:text-6xl lg:text-7xl">{s.title}</h1>
                <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-sand/85 [animation-delay:200ms]">{s.text}</p>
                <Link href={s.cta[1]} className="btn mt-10 animate-fade-up bg-sand text-olive-950 [animation-delay:300ms] hover:bg-paper">
                  {s.cta[0]}
                </Link>
              </div>
            ),
        )}
      </div>

      <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-5">
        <button onClick={() => go(-1)} className="grid size-9 place-items-center rounded-full text-sand/70 transition-colors hover:text-sand max-sm:hidden" aria-label="Previous slide">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex gap-2">
          {SLIDES.map((s, i) => (
            <button key={s.title} onClick={() => setIndex(i)} className="grid h-6 w-12 place-items-center" aria-label={`Show slide ${i + 1}`} aria-current={i === index}>
              <span className="block h-0.5 w-full overflow-hidden bg-sand/30">
                <span
                  key={`${index}-${paused}`}
                  className="block h-full origin-left bg-sand"
                  style={{
                    transform: i < index ? "scaleX(1)" : "scaleX(0)",
                    animation: i === index && !paused ? `hero-progress ${DURATION}ms linear forwards` : undefined,
                  }}
                />
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => go(1)} className="grid size-9 place-items-center rounded-full text-sand/70 transition-colors hover:text-sand max-sm:hidden" aria-label="Next slide">
          <ArrowRight className="size-4" />
        </button>
      </div>
      <style>{`@keyframes hero-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </section>
  );
}
