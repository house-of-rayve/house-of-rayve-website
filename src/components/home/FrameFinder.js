"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ScanFace } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import FrameShapeIcon, { FRAME_SHAPES } from "./FrameShapeIcon";
import { FACE_SHAPES as FACES } from "@/lib/constants";

// Each face is drawn from the same five widths and heights, so the outline can morph smoothly from one to the next.
// t = top of the head, b = chin, tw / cw / jw = half-width at the temples, cheekbones and jaw (viewBox 200 × 230).
const FACE_GEOMETRY = {
  round: { t: 38, b: 186, tw: 54, cw: 62, jw: 52 },
  oval: { t: 26, b: 196, tw: 46, cw: 52, jw: 38 },
  square: { t: 32, b: 190, tw: 58, cw: 60, jw: 58 },
  heart: { t: 32, b: 192, tw: 60, cw: 56, jw: 36 },
  long: { t: 14, b: 208, tw: 44, cw: 46, jw: 40 },
};
const EYE_LINE = 100;

function facePath({ t, b, tw, cw, jw }) {
  const y1 = t + 34; // temples
  const y2 = 116; // cheekbones
  const y3 = b - 40; // jaw corner
  const side = (s) => {
    const x = (d) => 100 + s * d;
    return [
      [x(tw * 0.62), t, x(tw), y1 - 24, x(tw), y1],
      [x(tw), y1 + 18, x(cw), y2 - 26, x(cw), y2],
      [x(cw), y2 + 26, x(jw + 4), y3 - 18, x(jw), y3],
      [x(jw - 6), y3 + 24, x(14), b, 100, b],
    ];
  };
  const right = side(1);
  const left = side(-1).reverse();
  // the left side is walked from the chin back up to the top of the head
  const back = left.map((seg, i) => {
    const prevEnd = i === left.length - 1 ? [100, t] : [left[i + 1][4], left[i + 1][5]];
    return [seg[2], seg[3], seg[0], seg[1], ...prevEnd];
  });
  const c = (s) => `C${s.join(" ")}`;
  return `M100 ${t} ${right.map(c).join(" ")} ${back.map(c).join(" ")} Z`;
}

function FaceIcon({ id }) {
  return (
    <svg viewBox="0 0 200 230" className="h-5 w-4 fill-none stroke-current stroke-[10]" aria-hidden="true">
      <path d={facePath(FACE_GEOMETRY[id])} />
    </svg>
  );
}

/** The face outline wearing the chosen frame. Both change with a smooth transition. */
function Mirror({ face, frame }) {
  const g = FACE_GEOMETRY[face.id];
  const d = facePath(g);
  const width = g.cw * 2 * 0.98;
  const height = width * (36 / 64);
  return (
    <svg viewBox="0 0 200 230" className="h-full w-full overflow-visible" role="img" aria-label={`A ${face.label.toLowerCase()} face wearing ${frame} frames`}>
      <defs>
        <radialGradient id="ff-skin" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fdfcf9" />
          <stop offset="100%" stopColor="#ebe6d8" />
        </radialGradient>
      </defs>
      {/* neck and shoulders, fixed */}
      <path d="M84 196 C84 214 80 222 52 230 M116 196 C116 214 120 222 148 230" className="fill-none stroke-olive-800/25" strokeWidth="1.2" />
      <path
        d={d}
        style={{ d: `path("${d}")`, transition: "d 700ms cubic-bezier(.2,.8,.2,1)" }}
        fill="url(#ff-skin)"
        className="stroke-olive-800"
        strokeWidth="1.4"
      />
      {/* nose and mouth, kept faint */}
      <path d="M100 112 C98 128 96 136 92 142 C96 145 104 145 108 142" className="fill-none stroke-olive-800/30" strokeWidth="1" />
      <path d="M90 162 C96 165 104 165 110 162" className="fill-none stroke-olive-800/30" strokeWidth="1" />
      {/* the frame, swapped with a quick fade-and-settle */}
      <g key={`${face.id}-${frame}`} className="animate-fade-in" style={{ transformOrigin: "100px 100px" }}>
        <svg x={100 - width / 2} y={EYE_LINE - height / 2} width={width} height={height} viewBox="0 0 64 36" className="overflow-visible">
          <g className="fill-olive-950/80 stroke-olive-950" strokeWidth="1.6" strokeLinejoin="round">
            {FRAME_SHAPES[frame]}
          </g>
          <path d="M27 15c2-2 8-2 10 0" className="fill-none stroke-olive-950" strokeWidth="1.6" />
          {/* a soft highlight on the lenses */}
          <path d="M8 15c3-2 7-2 10-1M42 15c3-2 7-2 10-1" className="fill-none stroke-white/35" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </g>
    </svg>
  );
}

const chip = (on) =>
  `flex shrink-0 items-center gap-2 border px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
    on ? "border-olive-800 bg-olive-800 text-sand" : "border-line bg-paper text-ink/80 hover:border-olive-800"
  }`;

export default function FrameFinder({ products }) {
  const [face, setFace] = useState(FACES[0]);
  const [frame, setFrame] = useState(FACES[0].shapes[0]);
  const [preview, setPreview] = useState(null); // frame shape being hovered
  const shown = preview ?? frame;
  const balances = face.shapes.includes(shown);

  const counts = products.reduce((acc, p) => ({ ...acc, [p.shape]: (acc[p.shape] ?? 0) + 1 }), {});
  // The chosen frame shape first, then other shapes that suit this face to fill the row
  const inStock = products.filter((p) => p.stock > 0);
  const exact = inStock.filter((p) => p.shape === frame);
  const matches = [...exact, ...inStock.filter((p) => p.shape !== frame && face.shapes.includes(p.shape))].slice(0, 3);
  const pickFace = (f) => {
    setFace(f);
    setFrame(f.shapes[0]);
  };

  return (
    // Phones: heading, mirror, then the controls. Desktop: the mirror on the left, everything else on the right.
    <div className="grid gap-x-14 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
      <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
        <p className="eyebrow">Frame finder</p>
        <h2 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">What suits your face?</h2>
      </div>

      {/* The mirror */}
      <div className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
        <div className="relative mx-auto aspect-[4/5] max-w-[300px] overflow-hidden border border-line bg-paper sm:max-w-md">
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.22em] text-muted">
            <span>{face.label} face</span>
            <span key={shown} className="animate-fade-in text-ink">{shown}</span>
          </div>
          <div className="absolute inset-x-[14%] bottom-[12%] top-[14%]">
            <Mirror face={face} frame={shown} />
          </div>
          <p key={`${face.id}-${shown}`} className={`absolute inset-x-0 bottom-0 flex animate-fade-in items-center justify-center gap-2 border-t border-line py-3 text-[11px] ${balances ? "text-olive-800" : "text-muted"}`}>
            {balances ? <Check className="size-3.5" /> : null}
            {balances ? `${shown} balances a ${face.label.toLowerCase()} face` : `${shown} works — but it won't balance a ${face.label.toLowerCase()} face as much`}
          </p>
        </div>
      </div>

      {/* Controls and matches */}
      <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Your face</p>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="radiogroup" aria-label="Face shape">
          {FACES.map((f) => (
            <button key={f.id} role="radio" aria-checked={face.id === f.id} onClick={() => pickFace(f)} className={chip(face.id === f.id)}>
              <FaceIcon id={f.id} /> {f.label}
            </button>
          ))}
        </div>

        <p className="mt-7 text-[10px] uppercase tracking-[0.25em] text-muted">
          Try a frame <span className="normal-case tracking-normal">— hover to see it on the face</span>
        </p>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" onMouseLeave={() => setPreview(null)}>
          {Object.keys(FRAME_SHAPES).map((s) => {
            const best = face.shapes.includes(s);
            return (
              <button
                key={s}
                aria-pressed={frame === s}
                onClick={() => setFrame(s)}
                onMouseEnter={() => setPreview(s)}
                onFocus={() => setPreview(s)}
                onBlur={() => setPreview(null)}
                className={`${chip(frame === s)} ${!best && frame !== s ? "opacity-55 hover:opacity-100" : ""}`}
              >
                <FrameShapeIcon shape={s} className="h-3.5 w-6" />
                {s}
                {best && <span className={`size-1.5 rounded-full ${frame === s ? "bg-olive-400" : "bg-olive-700"}`} title="Best match" />}
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-2 text-[11px] text-muted">
          <span className="size-1.5 rounded-full bg-olive-700" /> Best match for a {face.label.toLowerCase()} face
        </p>

        <div className="mt-8 border-t border-line pt-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="text-ink">{frame}</span> · {counts[frame] ? `${counts[frame]} ${counts[frame] === 1 ? "frame" : "frames"}` : "coming soon"}
              {exact.length < matches.length && <span> · plus more for a {face.label.toLowerCase()} face</span>}
            </p>
            <div className="flex items-center gap-5">
              <Link href="/try-on" className="group inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted hover:text-ink">
                <ScanFace className="size-3.5" /> Scan my face
              </Link>
              <Link href={`/shop?shape=${encodeURIComponent(frame)}`} className="group inline-flex items-center gap-2 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.2em]">
                Shop {frame} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div key={frame} className="grid animate-fade-in grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5">
            {matches.map((p, i) => (
              <div key={p.id} className={i === 2 ? "max-sm:hidden" : ""}>
                <ProductCard product={p} sizes="(min-width:1024px) 18vw, (min-width:640px) 30vw, 50vw" />
              </div>
            ))}
            {matches.length === 0 && <p className="col-span-full py-12 text-center text-sm text-muted">New {frame.toLowerCase()} frames are on their way.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
