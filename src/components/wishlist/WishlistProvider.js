"use client";

import { createContext, useContext } from "react";
import { createLocalStore, useLocalStore } from "@/components/ui/localStore";
import { useToast } from "@/components/ui/Toast";

const wishlistStore = createLocalStore("rayve_wishlist_v1");
export const recentStore = createLocalStore("rayve_recent_v1");

const WishlistContext = createContext(null);

const snapshot = (p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  comparePrice: p.comparePrice ?? null,
  frameColor: p.frameColor ?? null,
  images: p.images?.slice(0, 2) ?? [],
  stock: p.stock,
});

export function WishlistProvider({ children }) {
  const { toast } = useToast();
  const items = useLocalStore(wishlistStore);

  const has = (id) => items.some((i) => i.id === id);
  const toggle = (product) => {
    const current = wishlistStore.get();
    if (current.some((i) => i.id === product.id)) {
      wishlistStore.set(current.filter((i) => i.id !== product.id));
      toast(`${product.name} removed from your wishlist.`);
    } else {
      wishlistStore.set([snapshot(product), ...current]);
      toast(`${product.name} saved to your wishlist.`);
    }
  };
  const remove = (id) => wishlistStore.set(wishlistStore.get().filter((i) => i.id !== id));

  return <WishlistContext value={{ items, count: items.length, has, toggle, remove }}>{children}</WishlistContext>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

export function rememberViewed(product) {
  const rest = recentStore.get().filter((p) => p.id !== product.id);
  recentStore.set([snapshot(product), ...rest].slice(0, 8));
}
