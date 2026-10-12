"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { LogoMark } from "@/components/ui/Logo";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "./gsap";

// The brand story in four chapters (copy from the brand book)
const CHAPTERS = [
  {
    title: "The idea",
    heading: "A different way of seeing the familiar",
    body: [
      "Rayve is about taking forms, codes and references we already recognise and shifting them through proportion, detail, contrast and attitude.",
      "Not creating novelty for its own sake. A frame you recognise — altered. A silhouette you know — reconsidered.",
    ],
    image: "/images/bullring.jpg",
  },
  {
    title: "The symbol",
    heading: "Not aggression — control",
    body: [
      "The bull is Rayve's symbol of precision, vision and presence. Not noise — confidence.",
      "Its strength lies in stillness, structure and the ability to command attention without asking for it.",
    ],
    image: "/images/bull-shadow.jpg",
  },
  {
    title: "The voice",
    heading: "Precise. Effortless. Progressive. Confident.",
    body: [
      "Short, considered, purposeful. Premium without trying too hard — active in attitude, refined in expression.",
      "Forward-looking and culturally aware; clear, assured and self-aware.",
    ],
    image: "/images/campaign-matador.jpg",
  },
  {
    title: "The promise",
    heading: "Premium, in the everyday",
    body: ["Distinctive silhouettes, refined details and an elevated finish.", "The pair you reach for without thinking."],
    image: "/images/collection.jpg",
  },
];

/**
 * Scroll story: the photo and the bull mark stay pinned on one side while the chapters scroll past on the
 * other. The mark fills in as you read; the photo changes with each chapter.
 */
export default function BrandStory() {
  const root = useRef(null);
  const mark = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // The mark draws in from the bottom across the whole story
      gsap.fromTo(
        mark.current,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 60%", end: "bottom bottom", scrub: 0.6 } },
      );
      gsap.utils.toArray(".bs-chapter").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
        gsap.fromTo(el.querySelectorAll(".bs-line"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 75%" } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-olive-950 text-sand">
      <div className="lg:grid lg:grid-cols-2">
        {/* Pinned side: photo for the current chapter, chapter counter and the bull mark */}
        <div className="sticky top-16 z-20 h-[45svh] overflow-hidden lg:top-0 lg:h-svh">
          {CHAPTERS.map((c, i) => (
            <Image
              key={c.image}
              src={c.image}
              alt=""
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className={`object-cover transition-all duration-1000 ease-out ${active === i ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-olive-950 via-olive-950/30 to-olive-950/10" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-8 lg:p-12">
            <div>
              <p className="font-display text-5xl text-sand/90 sm:text-7xl">0{active + 1}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-olive-400">{CHAPTERS[active].title}</p>
            </div>
            <span ref={mark} className="block text-olive-400" style={{ clipPath: "inset(0 0 0 0)" }}>
              <LogoMark className="h-14 w-24 sm:h-20 sm:w-32" />
            </span>
          </div>
          {/* progress ticks */}
          <div className="absolute right-5 top-5 flex gap-1.5 sm:right-8 sm:top-8 lg:right-12 lg:top-24">
            {CHAPTERS.map((c, i) => (
              <span key={c.title} className={`h-0.5 transition-all duration-500 ${i <= active ? "w-8 bg-olive-400" : "w-4 bg-sand/20"}`} />
            ))}
          </div>
        </div>

        {/* Scrolling side: the chapters */}
        <div className="relative z-0 bg-olive-950">
          {CHAPTERS.map((c, i) => (
            <article key={c.title} className="bs-chapter flex min-h-[80svh] flex-col justify-center px-5 py-20 sm:px-8 md:px-16 lg:min-h-svh lg:px-20 xl:px-24">
              <p className="bs-line font-display text-[11px] uppercase tracking-[0.3em] text-olive-400">
                0{i + 1} · {c.title}
              </p>
              <h2 className="bs-line display-title mt-6 text-3xl sm:text-4xl xl:text-5xl" data-no-split>
                {c.heading}
              </h2>
              {c.body.map((t) => (
                <p key={t} className="bs-line mt-6 max-w-md text-lg font-light leading-relaxed text-sand/75">
                  {t}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
