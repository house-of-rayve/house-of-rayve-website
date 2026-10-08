"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, LayoutDashboard } from "lucide-react";
import Logo, { LogoMark, Wordmark } from "@/components/ui/Logo";
import { useCart } from "@/components/cart/CartProvider";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=Sunglasses", label: "Sunglasses" },
  { href: "/shop?category=Optical", label: "Optical" },
  { href: "/about", label: "The brand" },
];

export default function Header({ user }) {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(false);
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  return (
    <>
      <div className="bg-olive-800 py-2 text-center text-[10px] uppercase tracking-[0.25em] text-sand/90">
        Complimentary shipping above ₹2,999<span className="hidden sm:inline"> · Easy 7-day returns</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur-md">
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-7">
            <button className="-ml-1 p-1 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-olive-800 xl:tracking-[0.2em] ${
                    pathname === n.href.split("?")[0] && n.href === "/shop" ? "text-ink" : "text-muted"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="RAYVE home" className="inline-flex items-center gap-2.5 text-olive-800">
            <LogoMark className="h-[22px] w-[37px]" />
            <Wordmark className="hidden h-[13px] w-[99px] sm:inline-block" />
          </Link>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button onClick={() => setSearch((s) => !s)} className="p-2 text-ink/80 hover:text-ink" aria-label="Search">
              <Search className="size-[18px]" strokeWidth={1.5} />
            </button>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="hidden p-2 text-ink/80 hover:text-ink sm:block" aria-label="Admin panel" title="Admin panel">
                <LayoutDashboard className="size-[18px]" strokeWidth={1.5} />
              </Link>
            )}
            <Link
              href={user ? "/account" : "/login"}
              className="flex items-center gap-2 p-2 text-ink/80 hover:text-ink"
              aria-label={user ? "My account" : "Sign in"}
            >
              <User className="size-[18px]" strokeWidth={1.5} />
              <span className="hidden text-[11px] uppercase tracking-[0.15em] xl:inline">
                {user ? user.name.split(" ")[0] : "Sign in"}
              </span>
            </Link>
            <button onClick={() => setOpen(true)} className="relative p-2 text-ink/80 hover:text-ink" aria-label={`Bag, ${count} items`}>
              <ShoppingBag className="size-[18px]" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-olive-500 text-[9px] font-semibold text-olive-950">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {search && (
          <form onSubmit={submitSearch} className="border-t border-line bg-cream">
            <div className="container-x flex h-14 items-center gap-3">
              <Search className="size-4 text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search frames, colours, shapes…"
                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
              <button type="button" onClick={() => setSearch(false)} aria-label="Close search" className="text-muted">
                <X className="size-4" />
              </button>
            </div>
          </form>
        )}
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setMenu(false)}
          className={`absolute inset-0 bg-olive-950/40 transition-opacity ${menu ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-cream transition-transform duration-300 ${menu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Logo className="text-olive-800" />
            <button onClick={() => setMenu(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col px-5 py-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenu(false)}
                className="border-b border-line py-4 font-display text-xs uppercase tracking-[0.2em]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={user ? "/account" : "/login"}
              onClick={() => setMenu(false)}
              className="border-b border-line py-4 font-display text-xs uppercase tracking-[0.2em]"
            >
              {user ? "My account" : "Sign in"}
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenu(false)}
                className="border-b border-line py-4 font-display text-xs uppercase tracking-[0.2em]"
              >
                Admin panel
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
