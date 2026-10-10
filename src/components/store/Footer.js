import Link from "next/link";
import Logo from "@/components/ui/Logo";
import NewsletterForm from "./NewsletterForm";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      ["All eyewear", "/shop"],
      ["Sunglasses", "/shop?category=Sunglasses"],
      ["New arrivals", "/shop?sort=newest"],
    ],
  },
  {
    title: "Rayve",
    links: [
      ["The brand", "/about"],
      ["My account", "/account"],
      ["Wishlist", "/wishlist"],
      ["Order history", "/account/orders"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Shipping & returns", "/about#care"],
      ["Care guide", "/about#care"],
      ["Contact", "mailto:hello@rayve.in"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-olive-800 text-sand">
      <div className="container-x grid grid-cols-2 gap-x-8 gap-y-12 py-16 lg:grid-cols-12">
        <div className="col-span-2 lg:col-span-4">
          <Logo stacked className="items-start text-sand [&>span:first-child]:self-start" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-sand/70">
            Premium, in the everyday. Distinctive silhouettes, refined details and an elevated finish.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-olive-400">{col.title}</p>
            <ul className="mt-5 space-y-3 text-sm text-sand/75">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-sand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="lg:col-span-2">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-olive-400">Newsletter</p>
          <p className="mt-5 text-sm text-sand/75">New frames, first.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-sand/10">
        <div className="container-x flex flex-col gap-2 py-6 text-[11px] uppercase tracking-[0.2em] text-sand/50 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Rayve. All rights reserved.</span>
          <span>Own the energy</span>
        </div>
      </div>
    </footer>
  );
}
