"use client";

import { useId, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

/**
 * "RAYVE" cut out of a dark layer, with the campaign photo behind it.
 *  1. Scrolling zooms into the Y until its stem is a tall window onto the photo, centred on the screen.
 *  2. The dark layer then splits at the edges of that window and slides away left and right like doors.
 *  3. The full photo is revealed and the closing line fades in.
 * The photo itself is never scaled up, so it stays sharp throughout.
 */
const WINDOW = 0.36; // the stem window's width as a share of the screen, before the doors open

// The Y's stem, measured from the real font on a canvas (in px at the current font size):
// half its width, its length, its horizontal offset from the glyph centre, and the font's em-box metrics.
function measureStem(el) {
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize);
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(size * 1.6);
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.font = `${size}px ${cs.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const cx = c.width / 2;
  const base = Math.round(c.height * 0.8);
  ctx.fillText("Y", cx, base);
  const ink = (x, y) => ctx.getImageData(x, y, 1, 1).data[3] > 128;
  // stem edges, a little above the baseline
  const row = ctx.getImageData(0, base - Math.round(size * 0.04), c.width, 1).data;
  let left = -1;
  let right = -1;
  for (let x = 0; x < c.width; x++) if (row[x * 4 + 3] > 128) (left < 0 && (left = x), (right = x));
  const mid = left >= 0 ? Math.round((left + right) / 2) : Math.round(cx);
  // stem length: up the middle from the baseline until the ink runs out (the fork of the Y)
  let top = base - 1;
  while (top > 0 && ink(mid, top - 1)) top--;
  const m = ctx.measureText("Y");
  return {
    half: left >= 0 ? (right - left + 1) / 2 : size * 0.05,
    offset: mid - cx,
    length: base - top,
    ascent: m.fontBoundingBoxAscent ?? size * 0.8,
    descent: m.fontBoundingBoxDescent ?? size * 0.2,
  };
}

export default function PhotoInWord({ image, alt = "", focus = "50% 50%", line, sub }) {
  const root = useRef(null);
  const maskId = `piw-${useId().replace(/:/g, "")}`;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const svg = root.current.querySelector(".piw-mask");
      const y = root.current.querySelector(".piw-y");

      // Geometry for the current screen and font, recalculated on every refresh (resize, font load)
      let g;
      const measure = () => {
        const W = svg.clientWidth;
        const H = svg.clientHeight;
        const s = measureStem(y);
        // SVG "central" baseline: the em box is centred on y = H/2
        const baseline = H / 2 + (s.ascent - s.descent) / 2;
        const stemMid = baseline - s.length / 2;
        // zoom so the stem is WINDOW wide — and always taller than the screen
        const scale = Math.max((W * WINDOW) / 2 / s.half, (H * 1.15) / s.length);
        const ox = W / 2 + s.offset;
        g = { W, origin: `${ox} ${stemMid}`, scale, edge: s.half * scale, ox };
      };
      measure();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
        },
      });
      document.fonts?.ready.then(() => tl.scrollTrigger?.refresh());

      tl
        // 1. into the Y, speeding up — so the doors can carry the same momentum without a pause
        .fromTo(".piw-letters", { scale: 1, svgOrigin: () => g.origin }, { scale: () => g.scale, svgOrigin: () => g.origin, ease: "power2.in", duration: 0.45 }, 0)
        .fromTo(".piw-photo", { scale: 1.12 }, { scale: 1, ease: "none", duration: 0.8 }, 0)
        // 2. swap the SVG for two doors whose inner edges sit exactly on the stem's edges…
        .set(".piw-door-l", { width: () => g.ox - g.edge, xPercent: 0 }, 0.45)
        .set(".piw-door-r", { width: () => g.W - (g.ox + g.edge), xPercent: 0 }, 0.45)
        .set(".piw-doors", { autoAlpha: 1 }, 0.45)
        .set(".piw-mask", { autoAlpha: 0 }, 0.45)
        // …and slide them away straight away, starting fast and easing out: one continuous move
        .to(".piw-door-l", { xPercent: -100, ease: "power2.out", duration: 0.35 }, 0.45)
        .to(".piw-door-r", { xPercent: 100, ease: "power2.out", duration: 0.35 }, 0.45)
        // 3. the closing line
        .fromTo(".piw-shade", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.78)
        .fromTo(".piw-line", { opacity: 0, y: 28 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.15 }, 0.82);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[320svh] bg-olive-950 motion-reduce:h-svh">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* the photograph: one image, full resolution, never stretched */}
        <div className="piw-photo absolute inset-0 will-change-transform">
          <Image src={image} alt={alt} fill sizes="100vw" quality={75} className="object-cover" style={{ objectPosition: focus }} />
        </div>
        {/* gentle shade so the closing line reads */}
        <div className="piw-shade absolute inset-0 bg-gradient-to-t from-olive-950/70 via-olive-950/20 to-olive-950/10 opacity-0 motion-reduce:opacity-100" />

        {/* dark layer with RAYVE cut out of it (an SVG mask), so the photo shows through the letters */}
        <svg className="piw-mask absolute inset-0 size-full motion-reduce:hidden" aria-hidden="true">
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect width="100%" height="100%" fill="white" />
              <g className="piw-letters" fill="black" style={{ fontFamily: "var(--font-michroma)", fontSize: "17vw" }}>
                {/* Y centred on the screen; RA and VE set against it */}
                <text className="piw-y" x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                  Y
                </text>
                <text x="50%" dx="-0.5em" y="50%" textAnchor="end" dominantBaseline="central">
                  RA
                </text>
                <text x="50%" dx="0.5em" y="50%" textAnchor="start" dominantBaseline="central">
                  VE
                </text>
              </g>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="#22221a" mask={`url(#${maskId})`} />
        </svg>

        {/* the two doors that take over from the mask and slide apart */}
        <div className="piw-doors invisible absolute inset-0" aria-hidden="true">
          <div className="piw-door-l absolute inset-y-0 left-0 bg-[#22221a] shadow-[12px_0_40px_rgba(0,0,0,0.35)]" />
          <div className="piw-door-r absolute inset-y-0 right-0 bg-[#22221a] shadow-[-12px_0_40px_rgba(0,0,0,0.35)]" />
        </div>

        <div className="piw-line absolute inset-x-0 bottom-[13%] px-5 text-center text-sand opacity-0 motion-reduce:opacity-100">
          <p className="display-title text-3xl sm:text-5xl" data-no-split>
            {line}
          </p>
          {sub && <p className="mx-auto mt-4 max-w-md text-sm text-sand/85">{sub}</p>}
        </div>
      </div>
    </section>
  );
}
