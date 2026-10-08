"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import CartLines from "@/components/cart/CartLines";
import OrderSummary from "@/components/cart/OrderSummary";

export default function CartPage() {
  const { items } = useCart();

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="display-title text-3xl sm:text-4xl">Your bag</h1>
      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted">Your bag is empty.</p>
          <Link href="/shop" className="btn-primary mt-8">
            Shop the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="border-t border-line lg:col-span-7">
            <CartLines />
          </div>
          <div className="lg:col-span-5">
            <OrderSummary>
              <Link href="/checkout" className="btn-primary mt-6 w-full">
                Proceed to checkout
              </Link>
              <Link href="/shop" className="btn-ghost mt-2 w-full">
                Continue shopping
              </Link>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}
