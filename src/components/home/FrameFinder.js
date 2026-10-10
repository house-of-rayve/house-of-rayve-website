"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import FrameShapeIcon, { FRAME_SHAPES } from "./FrameShapeIcon";
import { FACE_SHAPES as FACES } from "@/lib/constants";

function FaceIcon({ id }) {
  const paths = {
    round: <circle cx="20" cy="22" r="15" />,
    oval: <ellipse cx="20" cy="22" rx="12" ry="17" />,
    square: <rect x="6" y="7" width="28" height="30" rx="6" />,
    heart: <path d="M6 10c0-3 3-4 6-4h16c3 0 6 1 6 4 0 13-8 25-14 28C14 35 6 23 6 10Z" />,
    long: <rect x="9" y="3" width="22" height="38" rx="10" />,
  };
  return (
    <svg viewBox="0 0 40 44" className="h-10 w-9 fill-none stroke-current stroke-[1.5]" aria-hidden="true">
      {paths[id]}
    </svg>
  );
}

function StepLabel({ n, children }) {
  return (
    <p className="mb-5 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted">
      <span className="grid size-6 place-items-center rounded-full border border-olive-800 font-display text-[9px] text-olive-800">{n}</span>
      {children}
    </p>
  );
}

export default function FrameFinder({ products }) {
  const [face, setFace] = useState(FACES[0]);
  const [shape, setShape] = useState(null); // null = all recommended shapes

  const counts = products.reduce((acc, p) => ({ ...acc, [p.shape]: (acc[p.shape] ?? 0) + 1 }), {});
  const wanted = shape ? [shape] : face.shapes;
  const matches = products.filter((p) => wanted.includes(p.shape) && p.stock > 0).slice(0, 4);
  const shopHref = `/shop?shape=${encodeURIComponent(wanted.join(","))}`;

  return (
    <div>
      <div className="section-head mx-auto max-w-3xl text-center">
        <p className="eyebrow">Frame finder</p>
        <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">What suits your face?</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Pick your face shape, then explore the frame shapes that balance it — or browse any shape you like.
        </p>
        <Link href="/try-on" className="group mt-5 inline-flex items-center gap-2 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.2em]">
          Not sure? Scan your face with the camera <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Step 1: face shape */}
      <StepLabel n="1">Your face shape</StepLabel>
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-label="Face shape">
        {FACES.map((f) => (
          <button
            key={f.id}
            role="radio"
            aria-checked={face.id === f.id}
            onClick={() => {
              setFace(f);
              setShape(null);
            }}
            className={`flex flex-col items-center gap-2 border px-1 py-4 transition-all sm:gap-3 sm:py-5 ${
              face.id === f.id ? "border-olive-800 bg-olive-800 text-sand" : "border-line bg-paper text-olive-800 hover:border-olive-800"
            }`}
          >
            <FaceIcon id={f.id} />
            <span className="text-[9px] uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.18em]">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Step 2: frame shapes, recommended ones highlighted */}
      <div className="mt-12">
        <StepLabel n="2">Frames that suit you</StepLabel>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pt-3 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:gap-y-5 sm:overflow-visible sm:px-0 lg:grid-cols-7">
          {Object.keys(FRAME_SHAPES).map((s) => {
            const recommended = face.shapes.includes(s);
            const active = shape === s;
            return (
              <button
                key={s}
                onClick={() => setShape(active ? null : s)}
                aria-pressed={active}
                className={`relative flex w-28 shrink-0 flex-col items-center gap-3 border px-3 pb-4 pt-6 transition-all duration-300 sm:w-auto ${
                  active
                    ? "border-olive-800 bg-olive-800 text-sand"
                    : recommended
                      ? "border-olive-800/40 bg-paper text-olive-800 hover:border-olive-800"
                      : "border-line bg-paper/50 text-olive-800/35 hover:text-olive-800"
                }`}
              >
                {recommended && (
                  <span className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] ${active ? "bg-olive-500 text-olive-950" : "bg-olive-800 text-sand"}`}>
                    Best match
                  </span>
                )}
                <FrameShapeIcon shape={s} className="h-8 w-14" />
                <span className="text-center">
                  <span className="block font-display text-[10px] uppercase tracking-[0.18em]">{s}</span>
                  <span className={`mt-1 block text-[11px] ${active ? "text-sand/70" : "text-muted"}`}>
                    {counts[s] ? `${counts[s]} ${counts[s] === 1 ? "frame" : "frames"}` : "Coming soon"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="mt-14 border-t border-line pt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-muted">
            {shape ? (
              <>
                Showing <span className="text-ink">{shape}</span> frames
              </>
            ) : (
              <>
                Best for a <span className="text-ink">{face.label.toLowerCase()}</span> face
              </>
            )}
          </p>
          <Link href={shopHref} className="group inline-flex items-center gap-2 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.2em]">
            Shop all matches <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div key={`${face.id}-${shape}`} className="grid animate-fade-in grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
          {matches.map((p) => (
            <ProductCard key={p.id} product={p} sizes="(min-width:768px) 25vw, 50vw" />
          ))}
          {matches.length === 0 && <p className="col-span-full py-16 text-center text-sm text-muted">New {shape ?? ""} frames are on their way.</p>}
        </div>
      </div>
    </div>
  );
}
