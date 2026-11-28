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

// Black and quiet: the bull and RAYVE centred, the links in one row, the newsletter, then the legal line
export default function Footer() {
  const links = COLUMNS.flatMap((c) => c.links);
  return (
    <footer className="mt-auto bg-olive-950 text-sand">
      <div className="container-x flex flex-col items-center py-20 text-center lg:py-28">
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

        <div className="mt-14 w-full max-w-sm">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-sand/50">First access</p>
          <NewsletterForm />
        </div>
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
