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
      className="relative isolate -mt-16 h-[92svh] min-h-[560px] overflow-hidden bg-olive-950"
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
          <div className="absolute inset-0 bg-gradient-to-r from-olive-950/80 via-olive-950/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-olive-950/60 to-transparent" />
        </div>
      ))}

      <div className="container-x relative flex h-full flex-col justify-end pb-24 sm:pb-28">
        {SLIDES.map(
          (s, i) =>
            i === index && (
              <div key={s.title} className="max-w-2xl text-sand">
                <p className="eyebrow animate-fade-up text-sand/70">{s.eyebrow}</p>
                <h1 className="display-title mt-5 animate-fade-up text-4xl [animation-delay:100ms] sm:text-6xl lg:text-7xl">{s.title}</h1>
                <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-sand/80 [animation-delay:200ms]">{s.text}</p>
                <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:300ms]">
                  <Link href={s.cta[1]} className="btn-accent">
                    {s.cta[0]}
                  </Link>
                  <Link href="/about" className="btn border border-sand/40 text-sand hover:bg-sand hover:text-olive-900">
                    Our story
                  </Link>
                </div>
              </div>
            ),
        )}
      </div>

      <div className="container-x absolute inset-x-0 bottom-8 flex items-center gap-6">
        <div className="flex flex-1 gap-2">
          {SLIDES.map((s, i) => (
            <button key={s.title} onClick={() => setIndex(i)} className="group h-6 flex-1 sm:max-w-24" aria-label={`Show slide ${i + 1}`}>
              <span className="block h-0.5 overflow-hidden bg-sand/25">
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
        <div className="flex gap-2 text-sand">
          <button onClick={() => go(-1)} className="grid size-10 place-items-center rounded-full border border-sand/30 hover:bg-sand hover:text-olive-900" aria-label="Previous slide">
            <ArrowLeft className="size-4" />
          </button>
          <button onClick={() => go(1)} className="grid size-10 place-items-center rounded-full border border-sand/30 hover:bg-sand hover:text-olive-900" aria-label="Next slide">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <style>{`@keyframes hero-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </section>
  );
}
