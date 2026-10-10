"use client";

import { useRef } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistProvider";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";

// Ring + sparks that burst out of the heart when an item is saved
function burst(host, heart) {
  if (!host || prefersReducedMotion()) return;
  const ring = document.createElement("span");
  ring.className = "pointer-events-none absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-olive-500";
  host.appendChild(ring);
  const sparks = Array.from({ length: 8 }, (_, i) => {
    const s = document.createElement("span");
    s.className = `pointer-events-none absolute left-1/2 top-1/2 -ml-[2px] -mt-[2px] size-1 rounded-full ${i % 2 ? "bg-olive-500" : "bg-olive-800"}`;
    host.appendChild(s);
    return s;
  });

  const tl = gsap.timeline({ onComplete: () => [ring, ...sparks].forEach((el) => el.remove()) });
  tl.fromTo(heart, { scale: 0.4 }, { scale: 1, duration: 0.55, ease: "elastic.out(1.1, 0.45)" }, 0)
    .fromTo(ring, { scale: 0.2, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.5, ease: "power2.out" }, 0)
    .to(
      sparks,
      {
        x: (i) => Math.cos((i / sparks.length) * Math.PI * 2) * 20,
        y: (i) => Math.sin((i / sparks.length) * Math.PI * 2) * 20,
        scale: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      0.05,
    );
}

export default function WishlistButton({ product, className = "", withLabel = false }) {
  const { has, toggle } = useWishlist();
  const heart = useRef(null);
  const saved = has(product.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saved) burst(heart.current?.parentElement, heart.current);
        toggle(product);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={`group/heart inline-flex items-center justify-center gap-2 transition ${className}`}
    >
      <span className="relative grid place-items-center">
        <Heart
          ref={heart}
          className={`size-[18px] transition-[color,fill] duration-300 ${saved ? "fill-olive-800 text-olive-800" : ""}`}
          strokeWidth={1.5}
        />
      </span>
      {withLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
