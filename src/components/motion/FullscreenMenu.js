"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import RollText from "./RollText";
import { SHAPES } from "@/lib/constants";
import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

// Full-screen menu: the curtain drops, links rise in one by one, and on desktop
// hovering a link swaps the photo on the right.
export default function FullscreenMenu({ open, onClose, user }) {
  const root = useRef(null);
  const tl = useRef(null);
  const [preview, setPreview] = useState(0);

  const links = [
    { label: "Shop all", href: "/shop", img: "/images/collection.jpg" },
    { label: "Sunglasses", href: "/shop?category=Sunglasses", img: "/images/model-sevilla.jpg" },
    { label: "New arrivals", href: "/shop?sort=newest", img: "/images/model-arena.jpg" },
    { label: "Try on", href: "/try-on", img: "/images/model-sevilla.jpg" },
    { label: "The brand", href: "/about", img: "/images/campaign-matador.jpg" },
    { label: "Wishlist", href: "/wishlist", img: "/images/model-toro.jpg" },
    user ? { label: "My account", href: "/account", img: "/images/model-cordoba.jpg" } : { label: "Sign in", href: "/login", img: "/images/model-cordoba.jpg" },
    ...(user?.role === "ADMIN" ? [{ label: "Admin", href: "/admin", img: "/images/cards.jpg" }] : []),
  ];

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(root.current, { visibility: "visible" })
        .fromTo(root.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduced ? 0 : 0.9, ease: "expo.inOut" })
        .fromTo(".fm-link", { yPercent: 110 }, { yPercent: 0, duration: reduced ? 0 : 0.9, stagger: 0.06 }, "-=0.35")
        .fromTo(".fm-fade", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.6, stagger: 0.05 }, "-=0.7");
    },
    { scope: root, dependencies: [links.length], revertOnUpdate: true },
  );

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    if (open) {
      document.body.style.overflow = "hidden";
      t.timeScale(1).play();
    } else {
      document.body.style.overflow = "";
      t.timeScale(1.6).reverse();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      className="invisible fixed inset-0 z-[70] flex flex-col bg-olive-950 text-sand"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div className="container-x flex h-16 shrink-0 items-center justify-between border-b border-sand/10">
        <Logo className="text-sand" />
        <button onClick={onClose} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-sand/70 hover:text-sand" aria-label="Close menu">
          Close <X className="size-5" />
        </button>
      </div>

      <div data-lenis-prevent className="container-x grid flex-1 gap-10 overflow-y-auto py-10 lg:grid-cols-12 lg:py-14">
        <nav className="lg:col-span-7">
          <ul className="space-y-1 sm:space-y-2">
            {links.map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <Link
                  href={l.href}
                  onClick={onClose}
                  onMouseEnter={() => setPreview(i)}
                  onFocus={() => setPreview(i)}
                  className="fm-link group flex items-baseline gap-4 py-1 sm:gap-6"
                >
                  <span className="font-display text-[10px] text-olive-400 sm:text-xs">0{i + 1}</span>
                  <span className="display-title text-[1.6rem] transition-colors group-hover:text-olive-400 sm:text-5xl xl:text-6xl">
                    <RollText>{l.label}</RollText>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="fm-fade relative hidden overflow-hidden bg-olive-900 lg:col-span-5 lg:block">
          {links.map((l, i) => (
            <Image
              key={l.href}
              src={l.img}
              alt=""
              fill
              sizes="40vw"
              className={`object-cover transition-all duration-700 ${preview === i ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-olive-950/60 to-transparent" />
          <p className="absolute bottom-6 left-6 font-display text-[11px] uppercase tracking-[0.25em] text-sand/80">{links[preview]?.label}</p>
        </div>
      </div>

      <div className="container-x shrink-0 border-t border-sand/10 py-6">
        <div className="fm-fade flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <Link
                key={s}
                href={`/shop?shape=${encodeURIComponent(s)}`}
                onClick={onClose}
                className="border border-sand/20 px-3 py-1.5 text-[11px] text-sand/70 transition-colors hover:border-sand hover:text-sand"
              >
                {s}
              </Link>
            ))}
          </div>
          <a href="mailto:hello@rayve.in" className="text-[11px] uppercase tracking-[0.2em] text-sand/50 hover:text-sand">
            hello@rayve.in
          </a>
        </div>
      </div>
    </div>
  );
}
