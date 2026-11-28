import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * A campaign banner with its type already in the artwork: shown whole at its own proportions on larger screens,
 * and cropped to a taller 4:3 frame on phones (keeping `focus` in view) so it isn't a thin strip.
 */
// `reveal`: lift a curtain off it on scroll (off for banners at the top of a page)
// `full`: fill the screen below the header from tablet up (cropped to fit, keeping `focus` in view); phones get 4:3
// `whole`: show the artwork uncropped at 16:9 on every screen (for banners with type near the edges)
// `laptopSrc` (with `whole`): a 16:10 version of the artwork for screens narrower than 1536px (laptops, tablets,
// phones); `src` then shows only on wider desktop screens
// `cta`: a visible button label at the bottom of the banner (the whole banner is the link either way)
export default function FullBanner({ src, alt, href = "/shop", focus = "50% 50%", priority = false, reveal = true, full = false, whole = false, laptopSrc = null, cta = null, underHeader = false, className = "" }) {
  // underHeader: a soft shade at the top keeps the transparent header readable over bright artwork
  return (
    <Link href={href} data-reveal={reveal || undefined} className={`group relative block overflow-hidden bg-olive-950 ${whole ? (laptopSrc ? "aspect-[16/10] 2xl:aspect-video" : "aspect-video") : full ? "aspect-[4/3] sm:aspect-auto sm:h-[calc(100svh-65px)] sm:min-h-[520px]" : "aspect-[4/3] sm:aspect-[1942/809]"} ${className}`} aria-label={alt}>
      {[
        laptopSrc && { src: laptopSrc, only: "2xl:hidden" },
        { src, only: laptopSrc ? "hidden 2xl:block" : "" },
      ]
        .filter(Boolean)
        .map((art) => (
          <Image
            key={art.src}
            src={art.src}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            className={`object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03] [object-position:var(--focus)] ${art.only}`}
            style={{ "--focus": focus }}
          />
        ))}
      {cta && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/45 via-black/15 to-transparent pb-6 pt-24 sm:pb-10 lg:pb-14">
          <span className="inline-flex items-center gap-3 bg-sand px-6 py-3.5 font-display text-[10px] uppercase tracking-[0.3em] text-olive-800 shadow-lg transition-colors duration-300 group-hover:bg-olive-800 group-hover:text-sand sm:px-8 sm:py-4 sm:text-[11px]">
            {cta}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </span>
      )}
      {underHeader && <span className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" aria-hidden="true" />}
    </Link>
  );
}
