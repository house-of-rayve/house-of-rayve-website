// Simple line drawings of each frame shape
export const FRAME_SHAPES = {
  Rectangle: <><rect x="4" y="12" width="22" height="13" rx="3" /><rect x="38" y="12" width="22" height="13" rx="3" /></>,
  Square: <><rect x="5" y="9" width="20" height="18" rx="3" /><rect x="39" y="9" width="20" height="18" rx="3" /></>,
  Oval: <><ellipse cx="15" cy="18" rx="12" ry="7.5" /><ellipse cx="49" cy="18" rx="12" ry="7.5" /></>,
  Round: <><circle cx="15" cy="18" r="10" /><circle cx="49" cy="18" r="10" /></>,
  "Cat-eye": <><path d="M3 13c8-3 17-3 24 1-1 8-6 12-12 12S4 21 3 13Z" /><path d="M61 13c-8-3-17-3-24 1 1 8 6 12 12 12s11-5 12-13Z" /></>,
  Shield: <path d="M3 12c18-3 40-3 58 0-1 9-6 14-14 14-6 0-10-3-15-7-5 4-9 7-15 7-8 0-13-5-14-14Z" />,
  Aviator: <><path d="M4 11c7-2 16-2 22 0 1 9-3 16-10 16S3 20 4 11Z" /><path d="M60 11c-7-2-16-2-22 0-1 9 3 16 10 16s13-7 12-16Z" /></>,
};

export default function FrameShapeIcon({ shape, className = "h-9 w-16" }) {
  return (
    <svg viewBox="0 0 64 36" className={`fill-none stroke-current stroke-[1.5] ${className}`} aria-hidden="true">
      {FRAME_SHAPES[shape]}
      <path d="M27 15c2-2 8-2 10 0" />
    </svg>
  );
}
