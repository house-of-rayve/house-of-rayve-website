export function LogoMark({ className = "h-6 w-10" }) {
  return (
    <span
      aria-hidden="true"
      className={`logo-mask inline-block ${className}`}
      style={{ maskImage: "url(/brand/mark.png)", WebkitMaskImage: "url(/brand/mark.png)" }}
    />
  );
}

export function Wordmark({ className = "h-3.5 w-[106px]" }) {
  return (
    <span
      role="img"
      aria-label="RAYVE"
      className={`logo-mask inline-block ${className}`}
      style={{ maskImage: "url(/brand/wordmark.png)", WebkitMaskImage: "url(/brand/wordmark.png)" }}
    />
  );
}

export default function Logo({ className = "", stacked = false }) {
  if (stacked) {
    return (
      <span className={`inline-flex flex-col items-center gap-3 ${className}`}>
        <LogoMark className="h-12 w-20" />
        <Wordmark className="h-4 w-[122px]" />
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-[22px] w-[37px]" />
      <Wordmark className="h-[13px] w-[99px]" />
    </span>
  );
}
