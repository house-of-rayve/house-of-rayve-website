import Link from "next/link";

// Simple line drawings of each frame shape
const LENS = {
  Rectangle: <><rect x="4" y="12" width="22" height="13" rx="3" /><rect x="38" y="12" width="22" height="13" rx="3" /></>,
  Square: <><rect x="5" y="9" width="20" height="18" rx="3" /><rect x="39" y="9" width="20" height="18" rx="3" /></>,
  Oval: <><ellipse cx="15" cy="18" rx="12" ry="7.5" /><ellipse cx="49" cy="18" rx="12" ry="7.5" /></>,
  Round: <><circle cx="15" cy="18" r="10" /><circle cx="49" cy="18" r="10" /></>,
  "Cat-eye": <><path d="M3 13c8-3 17-3 24 1-1 8-6 12-12 12S4 21 3 13Z" /><path d="M61 13c-8-3-17-3-24 1 1 8 6 12 12 12s11-5 12-13Z" /></>,
  Shield: <path d="M3 12c18-3 40-3 58 0-1 9-6 14-14 14-6 0-10-3-15-7-5 4-9 7-15 7-8 0-13-5-14-14Z" />,
  Aviator: <><path d="M4 11c7-2 16-2 22 0 1 9-3 16-10 16S3 20 4 11Z" /><path d="M60 11c-7-2-16-2-22 0-1 9 3 16 10 16s13-7 12-16Z" /></>,
};

export default function ShapeRail({ counts = {} }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-7">
      {Object.entries(LENS).map(([shape, lens]) => (
        <Link
          key={shape}
          href={`/shop?shape=${encodeURIComponent(shape)}`}
          className="group flex w-32 shrink-0 flex-col items-center gap-4 border border-line bg-paper px-4 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-olive-800 hover:shadow-lg sm:w-auto"
        >
          <svg viewBox="0 0 64 36" className="h-9 w-16 fill-none stroke-olive-800 stroke-[1.5] transition-colors group-hover:stroke-olive-500" aria-hidden="true">
            {lens}
            <path d="M27 15c2-2 8-2 10 0" />
          </svg>
          <span className="text-center">
            <span className="block font-display text-[10px] uppercase tracking-[0.2em]">{shape}</span>
            <span className="mt-1 block text-[11px] text-muted">{counts[shape] ? `${counts[shape]} ${counts[shape] === 1 ? "frame" : "frames"}` : "Coming soon"}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
