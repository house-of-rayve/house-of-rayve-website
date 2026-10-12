import Image from "next/image";
import Link from "next/link";

/**
 * A campaign banner with its type already in the artwork: shown whole at its own proportions on larger screens,
 * and cropped to a taller 4:3 frame on phones (keeping `focus` in view) so it isn't a thin strip.
 */
// `reveal`: lift a curtain off it on scroll (off for banners at the top of a page)
// `full`: fill the screen below the header from tablet up (cropped to fit, keeping `focus` in view); phones get 4:3
export default function FullBanner({ src, alt, href = "/shop", focus = "50% 50%", priority = false, reveal = true, full = false, underHeader = false, className = "" }) {
  // underHeader: a soft shade at the top keeps the transparent header readable over bright artwork
  return (
    <Link href={href} data-reveal={reveal || undefined} className={`group relative block overflow-hidden bg-olive-950 ${full ? "aspect-[4/3] sm:aspect-auto sm:h-[calc(100svh-65px)] sm:min-h-[520px]" : "aspect-[4/3] sm:aspect-[1942/809]"} ${className}`} aria-label={alt}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03] [object-position:var(--focus)]`}
        style={{ "--focus": focus }}
      />
      {underHeader && <span className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" aria-hidden="true" />}
    </Link>
  );
}
