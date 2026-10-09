"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, LayoutDashboard, Heart, ArrowRight, ChevronDown } from "lucide-react";
import Logo, { LogoMark, Wordmark } from "@/components/ui/Logo";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { formatPrice } from "@/lib/format";
import { SHAPES } from "@/lib/constants";

const ANNOUNCEMENTS = [
  "Free shipping on orders above ₹2,999",
  "Easy 7-day returns & exchanges",
  "100% UV400 protection on every pair",
];

const NAV = [
  { href: "/shop?category=Sunglasses", label: "Sunglasses" },
  { href: "/shop?category=Optical", label: "Optical" },
  { href: "/about", label: "The brand" },
];

const POPULAR = ["Oval", "Tortoise", "Gold", "Round", "Black"];

function Announcements() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-8 overflow-hidden bg-olive-800 text-[9px] uppercase tracking-[0.18em] text-sand/90 sm:text-[10px] sm:tracking-[0.25em]">
      {ANNOUNCEMENTS.map((text, n) => (
        <p
          key={text}
          aria-hidden={n !== i}
          className={`absolute inset-0 flex items-center justify-center px-4 text-center transition-all duration-500 ${
            n === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

function SearchPanel({ onClose }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {}
      setLoading(false);
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const term = q.trim();
  const shown = term ? results : null;

  const submit = (e) => {
    e.preventDefault();
    onClose();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  return (
    <div className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-xl animate-fade-up">
      <form onSubmit={submit} className="container-x flex h-16 items-center gap-3 border-b border-line">
        <Search className="size-4 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search frames, colours, shapes…"
          className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          aria-label="Search products"
        />
        {loading && <span className="size-4 animate-spin rounded-full border-2 border-line border-t-olive-800" />}
        <button type="button" onClick={onClose} aria-label="Close search" className="p-1 text-muted hover:text-ink">
          <X className="size-5" />
        </button>
      </form>
      <div className="container-x max-h-[70svh] overflow-y-auto py-6">
        {!shown ? (
          <div>
            <p className="eyebrow">Popular searches</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQ(p)}
                  className="border border-line bg-paper px-4 py-2 text-xs transition-colors hover:border-olive-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : shown.length === 0 ? (
          <p className="py-6 text-sm text-muted">No frames match “{term}”. Try a shape or colour.</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow">
                {shown.length} {shown.length === 1 ? "result" : "results"}
              </p>
              <button type="button" onClick={submit} className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] hover:text-olive-700">
                View all <ArrowRight className="size-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {shown.slice(0, 6).map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} onClick={onClose} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-mist">
                    {p.images[0] && (
                      <Image src={p.images[0]} alt={p.name} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <p className="mt-2 font-display text-[11px] uppercase tracking-[0.15em]">{p.name}</p>
                  <p className="text-xs text-muted">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MegaMenu({ onNavigate }) {
  return (
    <div className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-xl animate-fade-up">
      <div className="container-x grid grid-cols-12 gap-8 py-10">
        <div className="col-span-3">
          <p className="eyebrow">Shop</p>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              ["All eyewear", "/shop"],
              ["Sunglasses", "/shop?category=Sunglasses"],
              ["Optical", "/shop?category=Optical"],
              ["New arrivals", "/shop?sort=newest"],
              ["Wishlist", "/wishlist"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={onNavigate} className="group inline-flex items-center gap-2 hover:text-olive-700">
                  {label}
                  <ArrowRight className="size-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="eyebrow">By shape</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {SHAPES.map((s) => (
              <li key={s}>
                <Link href={`/shop?shape=${encodeURIComponent(s)}`} onClick={onNavigate} className="hover:text-olive-700">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {[
          { title: "Sunglasses", sub: "Collection 01", href: "/shop?category=Sunglasses", img: "/images/collection.jpg" },
          { title: "Optical", sub: "Everyday clarity", href: "/shop?category=Optical", img: "/images/malaga.jpg" },
        ].map((tile) => (
          <Link key={tile.title} href={tile.href} onClick={onNavigate} className="group relative col-span-3 block aspect-[4/3] overflow-hidden bg-mist">
            <Image src={tile.img} alt={tile.title} fill sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-sand">
              <p className="text-[10px] uppercase tracking-[0.25em] text-sand/70">{tile.sub}</p>
              <p className="display-title mt-1 text-lg">{tile.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header({ user }) {
  const { count, setOpen, bump } = useCart();
  const { count: wishCount } = useWishlist();
  const pathname = usePathname();
  const [panel, setPanel] = useState(null); // "shop" | "search" | null
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e) => e.key === "Escape" && setPanel(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  const overlay = pathname === "/" && !scrolled && !panel;
  const close = () => setPanel(null);
  const openShop = () => {
    clearTimeout(closeTimer.current);
    setPanel("shop");
  };
  const leaveShop = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanel((p) => (p === "shop" ? null : p)), 150);
  };

  const iconBtn = "relative grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/5";

  return (
    <>
      <Announcements />
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          overlay ? "border-b border-transparent bg-transparent text-sand" : "border-b border-line bg-canvas/95 text-ink backdrop-blur-md"
        }`}
        onMouseLeave={leaveShop}
      >
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-6">
            <button className="-ml-2 grid size-10 place-items-center lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
            <nav className="hidden items-center gap-6 lg:flex">
              <button
                onMouseEnter={openShop}
                onClick={() => setPanel((p) => (p === "shop" ? null : "shop"))}
                aria-expanded={panel === "shop"}
                className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] opacity-80 transition-opacity hover:opacity-100"
              >
                Shop <ChevronDown className={`size-3 transition-transform ${panel === "shop" ? "rotate-180" : ""}`} />
              </button>
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onMouseEnter={leaveShop}
                  className="text-[11px] uppercase tracking-[0.18em] opacity-80 transition-opacity hover:opacity-100"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label="RAYVE home" className={`inline-flex items-center gap-2.5 ${overlay ? "text-sand" : "text-olive-800"}`}>
            <LogoMark className="h-[22px] w-[37px]" />
            <span className="hidden sm:inline-flex">
              <Wordmark className="h-[13px] w-[99px]" />
            </span>
          </Link>

          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setPanel((p) => (p === "search" ? null : "search"))} className={iconBtn} aria-label="Search">
              <Search className="size-[18px]" strokeWidth={1.5} />
            </button>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className={`${iconBtn} max-sm:hidden`} aria-label="Admin panel" title="Admin panel">
                <LayoutDashboard className="size-[18px]" strokeWidth={1.5} />
              </Link>
            )}
            <Link href={user ? "/account" : "/login"} className={iconBtn} aria-label={user ? "My account" : "Sign in"} title={user ? user.name : "Sign in"}>
              <User className="size-[18px]" strokeWidth={1.5} />
            </Link>
            <Link href="/wishlist" className={`${iconBtn} max-sm:hidden`} aria-label={`Wishlist, ${wishCount} items`}>
              <Heart className="size-[18px]" strokeWidth={1.5} />
              {wishCount > 0 && (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-olive-500 text-[9px] font-semibold text-olive-950">
                  {wishCount}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(true)} className={iconBtn} aria-label={`Bag, ${count} items`}>
              <ShoppingBag key={bump} className={`size-[18px] ${bump ? "animate-pop" : ""}`} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-olive-500 text-[9px] font-semibold text-olive-950">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {panel === "shop" && (
          <div onMouseEnter={openShop} className="max-lg:hidden">
            <MegaMenu onNavigate={close} />
          </div>
        )}
        {panel === "search" && <SearchPanel onClose={close} />}
      </header>
      {panel && <div onClick={close} className="fixed inset-0 z-30 bg-olive-950/30 animate-fade-in" aria-hidden="true" />}

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`}>
        <div onClick={() => setMenu(false)} className={`absolute inset-0 bg-olive-950/40 transition-opacity ${menu ? "opacity-100" : "opacity-0"}`} />
        <div
          className={`absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-canvas transition-transform duration-300 ${menu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Logo className="text-olive-800" />
            <button onClick={() => setMenu(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-2">
            {[["Shop all", "/shop"], ...NAV.map((n) => [n.label, n.href]), ["Wishlist", "/wishlist"], [user ? "My account" : "Sign in", user ? "/account" : "/login"], ...(user?.role === "ADMIN" ? [["Admin panel", "/admin"]] : [])].map(
              ([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenu(false)}
                  className="flex items-center justify-between border-b border-line py-4 font-display text-xs uppercase tracking-[0.2em]"
                >
                  {label} <ArrowRight className="size-3.5 text-muted" />
                </Link>
              ),
            )}
            <p className="eyebrow mt-8">By shape</p>
            <div className="mt-4 flex flex-wrap gap-2 pb-8">
              {SHAPES.map((s) => (
                <Link
                  key={s}
                  href={`/shop?shape=${encodeURIComponent(s)}`}
                  onClick={() => setMenu(false)}
                  className="border border-line bg-paper px-3 py-1.5 text-xs"
                >
                  {s}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
