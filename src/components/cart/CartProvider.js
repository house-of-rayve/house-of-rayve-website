"use client";

import { createContext, useContext, useState } from "react";
import { cartStore } from "./store";
import { useLocalStore } from "@/components/ui/localStore";
import { shippingFor } from "@/lib/constants";
import CartDrawer from "./CartDrawer";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const items = useLocalStore(cartStore);
  const [bump, setBump] = useState(0);
  const [open, setOpen] = useState(false);

  const add = (product, quantity = 1) => {
    const current = cartStore.get();
    const existing = current.find((i) => i.productId === product.id);
    const max = Math.min(product.stock ?? 10, 10);
    if (existing) {
      cartStore.set(
        current.map((i) =>
          i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, max), stock: product.stock } : i,
        ),
      );
    } else {
      cartStore.set([
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? null,
          variant: product.frameColor,
          stock: product.stock,
          quantity: Math.min(quantity, max),
        },
      ]);
    }
    setBump((b) => b + 1);
    setOpen(true);
  };

  const update = (productId, quantity) => {
    const current = cartStore.get();
    if (quantity < 1) return cartStore.set(current.filter((i) => i.productId !== productId));
    cartStore.set(
      current.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, Math.min(i.stock ?? 10, 10)) } : i,
      ),
    );
  };

  const remove = (productId) => cartStore.set(cartStore.get().filter((i) => i.productId !== productId));
  const clear = () => cartStore.set([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  const has = (productId) => items.some((i) => i.productId === productId);
  const value = { items, count, subtotal, shipping, total: subtotal + shipping, add, update, remove, clear, open, setOpen, has, bump };

  return (
    <CartContext value={value}>
      {children}
      <CartDrawer />
    </CartContext>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
