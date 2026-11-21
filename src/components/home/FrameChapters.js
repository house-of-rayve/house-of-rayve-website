"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";

/**
 * The three launch frames as chapters, one after another: a big photo that drifts slower than the page (parallax)
 * with a sweep of light across it on hover, and the frame's name, line, colours and key specs beside it.
 * Desktop alternates photo left / right; phones stack photo then text.
 */
export default function FrameChapters({ frames }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      root.current.querySelectorAll("[data-chapter]").forEach((ch) => {
        const img = ch.querySelector("[data-parallax]");
        const name = ch.querySelector("[data-name]");
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.fromTo(name, { xPercent: ch.dataset.flip ? -8 : 8 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "center center", scrub: true } });
        gsap.from(ch.querySelectorAll("[data-rise]"), {
          y: 28,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ch, start: "top 70%", once: true },
        });
      });
    },
    { scope: root },
  );

  if (!frames.length) return null;

  return (
    <section ref={root} className="overflow-hidden bg-canvas">
      <div className="container-home pb-6 pt-24 text-center md:pt-32">
        <p className="eyebrow">Collection 01</p>
        <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">Three frames</h2>
      </div>

      {frames.map((p, i) => {
        const flip = i % 2 === 1;
        const total = String(frames.length).padStart(2, "0");
        return (
          <article
            key={p.slug}
            data-chapter
            data-flip={flip || undefined}
            className="container-home grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-0 lg:py-28"
          >
            <Link
              href={`/product/${p.slug}`}
              aria-label={`Discover ${p.name}`}
              className={`rv-sheen group relative -mx-5 block aspect-[4/5] sm:-mx-8 lg:mx-0 overflow-hidden bg-white lg:col-span-7 lg:aspect-auto lg:h-[min(80svh,780px)] ${flip ? "lg:order-2 lg:col-start-6" : ""}`}
            >
              <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
                <Image
                  src={p.images[0]}
                  alt={`RAYVE ${p.name}`}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <span className="pointer-events-none absolute left-5 top-5 z-[2] font-display text-[10px] tracking-[0.3em] text-ink/50">
                {String(i + 1).padStart(2, "0")} / {total}
              </span>
              {/* the page-colour curtain that lifts off the photo as it scrolls in (see RevealImages) */}
              <div data-reveal className="pointer-events-none h-full w-full" aria-hidden="true" />
            </Link>

            <div className={`@container relative lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1 lg:pr-12 lg:text-right" : "lg:pl-14"}`}>
              <p data-name className="display-title whitespace-nowrap text-[min(17cqw,150px)] leading-[0.9] text-olive-800">
                {p.name}
              </p>
              {p.tagline && (
                <p data-rise className="mt-6 font-display text-[11px] uppercase tracking-[0.3em] text-olive-500">
                  {p.tagline}
                </p>
              )}
              {p.blurb && (
                <p data-rise className={`mt-5 max-w-md text-sm leading-relaxed text-muted ${flip ? "lg:ml-auto" : ""}`}>
                  {p.blurb}
                </p>
              )}

              {p.colors.length > 0 && (
                <div data-rise className={`mt-8 flex items-center gap-3 ${flip ? "lg:justify-end" : ""}`}>
                  <div className="flex -space-x-1.5">
                    {p.colors.map((c) => (
                      <span
                        key={c.code}
                        title={c.name}
                        className="size-5 rounded-full ring-2 ring-canvas"
                        style={{ background: `linear-gradient(135deg, ${c.swatch?.[0] ?? "#888"} 50%, ${c.swatch?.[1] ?? c.swatch?.[0] ?? "#888"} 50%)` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
                    {p.colors.length} {p.colors.length === 1 ? "colour" : "colours"}
                  </span>
                </div>
              )}

              {p.facts.length > 0 && (
                <dl data-rise className={`mt-8 flex gap-8 border-t border-line pt-6 ${flip ? "lg:justify-end" : ""}`}>
                  {p.facts.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{k}</dt>
                      <dd className="mt-1.5 font-display text-sm text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <Link
                data-rise
                href={`/product/${p.slug}`}
                className="group/cta mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.25em]"
              >
                Discover {p.name}
                <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-1" />
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}
