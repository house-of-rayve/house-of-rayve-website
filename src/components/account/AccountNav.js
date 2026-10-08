"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, UserRound, MapPin } from "lucide-react";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/account", label: "Overview", Icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", Icon: Package },
  { href: "/account/profile", label: "Profile", Icon: UserRound },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin },
];

export default function AccountNav() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/account" ? pathname === href : pathname.startsWith(href));
  return (
    <nav className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 lg:mx-0 lg:flex-col lg:border-b-0 lg:px-0">
      {LINKS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex shrink-0 items-center gap-3 border-b-2 px-3 py-3 text-sm transition-colors lg:border-b-0 lg:border-l-2 lg:px-4 ${
            isActive(href) ? "border-olive-800 text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          <Icon className="size-4" strokeWidth={1.5} /> {label}
        </Link>
      ))}
      <LogoutButton className="hidden px-4 py-3 text-sm text-muted hover:text-ink lg:flex lg:border-l-2 lg:border-transparent" />
    </nav>
  );
}
