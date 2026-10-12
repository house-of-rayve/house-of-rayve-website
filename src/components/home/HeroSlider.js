"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

// Time-of-day mood, from the visitor's own clock: a tint over the photography and a small greeting.
// Evening visitors open on the "Golden hour" slide.
const MOODS = {
  morning: { label: "Good morning", tint: "bg-gradient-to-b from-[#fff2d6]/25 via-transparent to-transparent mix-blend-soft-light" },
  afternoon: { label: "Good afternoon", tint: "" },
  golden: { label: "Golden hour", tint: "bg-gradient-to-t from-[#c4691c]/40 via-[#c9a85b]/15 to-transparent mix-blend-soft-light", startOn: 1 },
  night: { label: "After dark", tint: "bg-[#0d0d0a]/40" },
};
const dayPart = () => {
  const h = new Date().getHours();
  return h >= 5 && h < 12 ? "morning" : h < 17 && h >= 12 ? "afternoon" : h >= 17 && h < 20 ? "golden" : "night";
};
const noSubscribe = () => () => {};

export default function HeroSlider() {
  const [step, setStep] = useState(0); // slides advanced since load
  const [paused, setPaused] = useState(false);
  const part = useSyncExternalStore(noSubscribe, dayPart, () => null); // null while rendering on the server
  const mood = part ? MOODS[part] : null;
  const index = (step + (mood?.startOn ?? 0)) % SLIDES.length; // the slide on screen
  const setIndex = (i) => setStep((i - (mood?.startOn ?? 0) + SLIDES.length) % SLIDES.length);
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
    const t = setTimeout(() => setStep((i) => (i + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [step, paused]);

  const go = (dir) => setStep((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    // -mt matches the header height (64px + 1px border) so the hero slides up under the transparent header
    // and fills the first screen.
    <section
      ref={root}
      className="relative isolate -mt-[65px] h-svh min-h-[560px] overflow-hidden bg-olive-950"
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
      {/* time-of-day tint */}
      {mood?.tint && <div className={`pointer-events-none absolute inset-0 animate-fade-in ${mood.tint}`} aria-hidden="true" />}
      </div>

      {/* time-of-day greeting */}
      {mood && (
        <p className="absolute left-5 top-[88px] z-10 flex animate-fade-in items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-sand/70 sm:left-8 lg:left-12">
          <span className="size-1.5 rounded-full bg-olive-400" /> {mood.label}
        </p>
      )}

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
