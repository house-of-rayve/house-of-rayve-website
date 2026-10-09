"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "./WishlistProvider";

export default function WishlistButton({ product, className = "", withLabel = false }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={`group/heart inline-flex items-center justify-center gap-2 transition ${className}`}
    >
      <Heart
        className={`size-[18px] transition-transform duration-300 group-active/heart:scale-75 ${saved ? "fill-olive-800 text-olive-800" : ""}`}
        strokeWidth={1.5}
      />
      {withLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
