"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { frameColorFor, lensColorFor } from "@/lib/frameColors";
import { gsap, useGSAP, prefersReducedMotion } from "@/components/motion/gsap";

const AnatomyScene = dynamic(() => import("./AnatomyScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[10px] uppercase tracking-[0.3em] text-sand/40">Loading 3D…</div>,
});

// Product page: the frame pulls apart as you scroll, with each part labelled from the product's own details
export default function FrameAnatomy({ product }) {
  const root = useRef(null);
  const progress = useRef(0);
  const labelEls = useRef([]);
  const listRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [near, setNear] = useState(false); // the 3D library (~1 MB) only loads once the section is close

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "600px 0px" });
    io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        progress.current = 0.7; // show it opened up, without the scroll animation
        if (listRef.current) listRef.current.style.opacity = "1";
        return;
      }
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          // On phones the parts are listed under the model; show the list once the frame has opened up
          onUpdate: (self) => {
            if (listRef.current && window.innerWidth < 768) listRef.current.style.opacity = String(Math.min(1, Math.max(0, (self.progress - 0.35) / 0.2)));
          },
        },
      });
    },
    { scope: root },
  );

  const frame = { shape: product.shape ?? "Oval", ...frameColorFor(product.frameColor), lens: lensColorFor(product.lensColor) };
  // Same order as the anchors in AnatomyScene: lens, front, temple, hinge
  const labels = [
    { title: "Lens", text: [product.lensColor, "100% UV400 protection"].filter(Boolean).join(" · ") },
    { title: "Front", text: [product.shape && `${product.shape} shape`, product.frameColor].filter(Boolean).join(" · "), above: true },
    { title: "Temples", text: product.material ?? "Shaped to sit behind the ear", left: true },
    { title: "Hinge", text: "Joins the front and the temples" },
  ];

  return (
    <section ref={root} className="relative h-[250svh] bg-olive-950 text-sand motion-reduce:h-svh">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(166,159,78,0.14),transparent_60%)]" />
        <div className="container-x relative z-10 pt-20 md:pt-24">
          <p className="eyebrow text-olive-400">Anatomy</p>
          <h2 className="display-title mt-4 text-3xl sm:text-5xl" data-no-split>
            Inside {product.name}
          </h2>
          <p className="mt-3 max-w-sm text-sm text-sand/60">Keep scrolling to take the frame apart.</p>
        </div>
        <div className="absolute inset-0">
          {near && <AnatomyScene progress={progress} frame={frame} labelEls={labelEls} active={inView} />}
          {/* Labels: positioned every frame by the scene, from points on the 3D model */}
          {labels.map((l, i) => (
            <div key={l.title} ref={(el) => (labelEls.current[i] = el)} className="pointer-events-none absolute left-0 top-0 opacity-0" aria-hidden="true">
              <div
                className={`flex w-max items-center gap-2 ${
                  l.above ? "-translate-x-1/2 -translate-y-full flex-col-reverse pb-1 text-center" : l.left ? "-translate-x-full -translate-y-1/2 flex-row-reverse text-right" : "-translate-y-1/2"
                }`}
              >
                {/* Phones: just a numbered dot (the details are listed below); larger screens: the full label */}
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-olive-400 font-display text-[9px] text-olive-950 ring-4 ring-olive-400/20 md:size-2 md:text-[0px]">
                  {i + 1}
                </span>
                <span className={`max-md:hidden ${l.above ? "h-6 w-px bg-sand/40" : "h-px w-6 bg-sand/40 sm:w-12"}`} />
                <span className="max-md:hidden">
                  <span className="block font-display text-[9px] uppercase tracking-[0.22em] text-olive-400 sm:text-[10px]">{l.title}</span>
                  <span className="mt-0.5 block max-w-[8.5rem] text-[11px] leading-snug text-sand/80 sm:max-w-[13rem] sm:text-xs">{l.text}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <ol ref={listRef} className="container-x relative z-10 mt-auto grid grid-cols-2 gap-x-4 gap-y-3 pb-4 opacity-0 md:sr-only md:opacity-100">
          {labels.map((l, i) => (
            <li key={l.title} className="flex gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-olive-400 font-display text-[9px] text-olive-950">{i + 1}</span>
              <span>
                <span className="block font-display text-[9px] uppercase tracking-[0.2em] text-olive-400">{l.title}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-sand/80">{l.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="container-x relative z-10 pb-6 text-[10px] uppercase tracking-[0.25em] text-sand/40">3D illustration · actual frame may differ</p>
      </div>
    </section>
  );
}
