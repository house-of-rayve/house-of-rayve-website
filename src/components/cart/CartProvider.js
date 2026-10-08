"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { getSnapshot, getServerSnapshot, setItems, subscribe } from "./store";
import { shippingFor } from "@/lib/constants";
import CartDrawer from "./CartDrawer";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);

  const add = (product, quantity = 1) => {
    const current = getSnapshot();
    const existing = current.find((i) => i.productId === product.id);
    const max = Math.min(product.stock ?? 10, 10);
    if (existing) {
      setItems(
        current.map((i) =>
          i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + quantity, max), stock: product.stock } : i,
        ),
      );
    } else {
      setItems([
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
    setOpen(true);
  };

  const update = (productId, quantity) => {
    const current = getSnapshot();
    if (quantity < 1) return setItems(current.filter((i) => i.productId !== productId));
    setItems(
      current.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, Math.min(i.stock ?? 10, 10)) } : i,
      ),
    );
  };

  const remove = (productId) => setItems(getSnapshot().filter((i) => i.productId !== productId));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  const value = { items, count, subtotal, shipping, total: subtotal + shipping, add, update, remove, clear, open, setOpen };

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
