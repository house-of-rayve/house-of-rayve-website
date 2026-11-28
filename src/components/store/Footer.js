import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import ScrambleText from "@/components/motion/ScrambleText";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { BUSINESS } from "@/lib/business";
import { NEW_ARRIVALS_ENABLED, WISHLIST_ENABLED } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      ["All eyewear", "/shop"],
      ["Sunglasses", "/shop?category=Sunglasses"],
      ...(NEW_ARRIVALS_ENABLED ? [["New arrivals", "/shop?sort=newest"]] : []),
    ],
  },
  {
    title: "Rayve",
    links: [
      ["The brand", "/about"],
      ["My account", "/account"],
      ...(WISHLIST_ENABLED ? [["Wishlist", "/wishlist"]] : []),
      ["Order history", "/account/orders"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Contact us", "/contact"],
      ["Shipping & delivery", "/shipping-policy"],
      ["Cancellation & refunds", "/refund-policy"],
      ["Terms & conditions", "/terms"],
      ["Privacy policy", "/privacy"],
    ],
  },
];

// Black and quiet: the newsletter on top, then the bull and RAYVE centred with the links in one row, then the legal line
export default function Footer() {
  const links = COLUMNS.flatMap((c) => c.links);
  return (
    <footer className="mt-auto bg-olive-950 text-sand">
      {/* The RAYVE list: the one newsletter sign-up on the site */}
      <div className="border-b border-sand/10">
        <div className="container-x flex flex-col items-center py-16 text-center lg:py-20">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-olive-500">The RAYVE list</p>
          <p className="display-title mt-4 text-[clamp(24px,3.4vw,40px)] leading-tight">New frames, first</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-sand/60">Early access to new drops, restocks and private previews. No noise.</p>
          <div className="mt-8 w-full max-w-md">
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </div>

      <div className="container-x flex flex-col items-center py-16 text-center lg:py-20">
        <LogoMark className="h-[44px] w-[74px] text-olive-500" />
        <Wordmark className="mt-6 h-[18px] w-[137px] text-sand" />
        <p className="mt-5 font-display text-[10px] uppercase tracking-[0.35em] text-sand/50">Own the energy</p>

        <nav aria-label="Footer" className="mt-14 flex max-w-3xl flex-wrap justify-center gap-x-9 gap-y-4 text-[13px] text-sand/75">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="transition-colors hover:text-sand">
              <ScrambleText>{label}</ScrambleText>
            </Link>
          ))}
        </nav>

      </div>
      <div className="border-t border-sand/10">
        <div className="container-x flex flex-col items-center gap-2 py-6 text-[10px] uppercase tracking-[0.25em] text-sand/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {BUSINESS.name}</span>
          <a href={`mailto:${BUSINESS.email}`} className="hover:text-sand">{BUSINESS.email}</a>
          <span>GSTIN {BUSINESS.gstin}</span>
        </div>
      </div>
    </footer>
  );
}
