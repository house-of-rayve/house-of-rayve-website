"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ScanFace, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { TRY_ON_ENABLED } from "@/lib/constants";

// Pages with their own bottom bar (sticky add-to-bag, checkout) don't get the tab bar
const HIDDEN = /^\/(product|checkout|cart)(\/|$)/;

/** Thumb-friendly navigation fixed to the bottom of the screen on phones and small tablets. */
export default function MobileTabBar() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const { count: wishCount } = useWishlist();
  if (HIDDEN.test(pathname)) return null;

  const tabs = [
    { href: "/", label: "Home", Icon: Home, active: pathname === "/" },
    { href: "/shop", label: "Shop", Icon: Store, active: pathname.startsWith("/shop") },
    ...(TRY_ON_ENABLED ? [{ href: "/try-on", label: "Try on", Icon: ScanFace, active: pathname.startsWith("/try-on") }] : []),
    { href: "/wishlist", label: "Wishlist", Icon: Heart, active: pathname.startsWith("/wishlist"), badge: wishCount },
  ];
  const item = (active) => `relative flex flex-1 flex-col items-center gap-1 pt-2.5 text-[9px] uppercase tracking-[0.12em] transition-colors ${active ? "text-olive-800" : "text-muted"}`;
  const badge = (n) =>
    n > 0 && <span className="absolute left-1/2 top-1.5 ml-2 grid size-4 place-items-center rounded-full bg-olive-500 text-[9px] font-semibold text-olive-950">{n}</span>;

  return (
    <>
      {/* keeps the footer clear of the bar */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-canvas/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur-md lg:hidden"
      >
        {tabs.map(({ href, label, Icon, active, badge: n }) => (
          <Link key={href} href={href} className={item(active)} aria-current={active ? "page" : undefined}>
            {active && <span className="absolute inset-x-6 top-0 h-0.5 bg-olive-800" />}
            <Icon className="size-5" strokeWidth={1.5} />
            {label}
            {badge(n)}
          </Link>
        ))}
        <button onClick={() => setOpen(true)} className={item(false)} aria-label={`Bag, ${count} items`}>
          <ShoppingBag className="size-5" strokeWidth={1.5} />
          Bag
          {badge(count)}
        </button>
      </nav>
    </>
  );
}
