"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Magnetic from "@/components/motion/Magnetic";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";

// HD photography from Unsplash (free to use under the Unsplash License), served at the exact size
// each screen needs straight from Unsplash's image CDN via the loader below.
//   https://unsplash.com/photos/QoFhXdW_vc8  https://unsplash.com/photos/z3cm1MyYL7o
const unsplashLoader = ({ src, width, quality }) => `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 80}`;

const SLIDES = [
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
  const current = SLIDES[index] ?? SLIDES[0];
  const root = useRef(null);

  // Scroll parallax: the imagery sinks and the copy drifts up and fades as you leave the hero
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-media", { yPercent: 18, scale: 1.06, ease: "none", scrollTrigger: st });
      gsap.to(".hero-copy", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: st });

      // Mouse parallax (desktop): imagery drifts against the pointer, copy follows it slightly
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const mediaX = gsap.quickTo(".hero-media", "x", { duration: 1.2, ease: "power3" });
      const mediaY = gsap.quickTo(".hero-media", "y", { duration: 1.2, ease: "power3" });
      const copyX = gsap.quickTo(".hero-copy", "x", { duration: 1.2, ease: "power3" });
      const onMove = (e) => {
        const r = root.current.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        mediaX(nx * -24);
        mediaY(ny * -16);
        copyX(nx * 10);
      };
      root.current.addEventListener("pointermove", onMove);
      return () => root.current?.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [index, paused]);

  const go = (dir) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    // -mt matches the header height (64px + 1px border) so the hero sits flush under the announcement bar.
    // Height = viewport − announcement bar (32px), so the hero fills the first screen.
    <section
      ref={root}
      className="relative isolate -mt-[65px] h-[calc(100svh-32px)] min-h-[560px] overflow-hidden bg-olive-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="hero-media absolute -inset-6">
      {SLIDES.map((s, i) => (
        <div
          key={s.img}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute inset-0 overflow-hidden">
          <Image
            loader={unsplashLoader}
            src={s.img}
            alt=""
            fill
            priority={i === 0}
            quality={85}
            sizes="100vw"
            style={{ objectPosition: s.position }}
            className={`object-cover ${i === index ? "animate-ken-burns" : ""}`}
          />
          </div>
          <div className="absolute inset-0 bg-olive-950/25" />
          <div
            className={`absolute inset-0 ${
              s.align === "left" ? "bg-gradient-to-r" : s.align === "right" ? "bg-gradient-to-l" : "bg-gradient-to-b"
            } from-olive-950/75 via-olive-950/30 to-transparent`}
          />
        </div>
      ))}
      </div>

      <div
        className={`hero-copy relative flex h-full flex-col justify-center pt-16 ${
          current.align === "left"
            ? "container-x items-center text-center md:items-start md:text-left"
            : current.align === "right"
              ? "container-x items-center text-center md:items-end md:text-right"
              : "container-x items-center text-center"
        }`}
      >
        {SLIDES.map(
          (s, i) =>
            i === index && (
              <div
                key={s.title}
                className={`flex max-w-2xl flex-col text-sand ${
                  s.align === "left" ? "items-center md:items-start" : s.align === "right" ? "items-center md:items-end" : "items-center"
                }`}
              >
                <p className="eyebrow animate-fade-up text-sand/80">{s.eyebrow}</p>
                <h1
                  className="display-title mt-6 animate-fade-up text-4xl [animation-delay:100ms] sm:text-6xl lg:text-7xl"
                >
                  {s.title}
                </h1>
                <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-sand/85 [animation-delay:200ms]">{s.text}</p>
                <Magnetic className="mt-10">
                  <Link href={s.cta[1]} className="btn animate-fade-up bg-sand text-olive-950 [animation-delay:300ms] hover:bg-paper">
                    {s.cta[0]}
                  </Link>
                </Magnetic>
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
