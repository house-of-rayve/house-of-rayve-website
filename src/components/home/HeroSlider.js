"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    img: "/images/hero-green.jpg",
    position: "50% 30%",
    eyebrow: "New season · Collection 01",
    title: "Own the energy",
    text: "A frame you recognise — altered. Distinctive silhouettes, made for ordinary days, not just special ones.",
    cta: ["Shop the collection", "/shop"],
  },
  {
    img: "/images/campaign-matador.jpg",
    position: "50% 25%",
    eyebrow: "The Sevilla edit",
    title: "Poise. Precision. Command.",
    text: "Sculpted acetate and quiet confidence — eyewear that commands attention without asking for it.",
    cta: ["Explore sunglasses", "/shop?category=Sunglasses"],
  },
  {
    img: "/images/model-toro.jpg",
    position: "50% 35%",
    eyebrow: "Signature frame",
    title: "Meet Toro",
    text: "The everyday oval, sharpened. Gloss black acetate with amber-warm lenses.",
    cta: ["Shop Toro", "/product/toro"],
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
    <section
      className="relative isolate -mt-16 h-[88svh] min-h-[560px] overflow-hidden bg-olive-950"
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
          <Image
            src={s.img}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectPosition: s.position }}
            className={`object-cover ${i === index ? "animate-ken-burns" : ""}`}
          />
          <div className="absolute inset-0 bg-olive-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,34,26,0.35),transparent_70%)]" />
        </div>
      ))}

      <div className="container-x relative flex h-full flex-col items-center justify-center pt-16 text-center">
        {SLIDES.map(
          (s, i) =>
            i === index && (
              <div key={s.title} className="flex max-w-3xl flex-col items-center text-sand">
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
