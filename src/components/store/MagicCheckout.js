"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import OrderSummary from "@/components/cart/OrderSummary";
import { api } from "@/components/ui/fetcher";
import { formatPrice } from "@/lib/format";

function loadMagicCheckout() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/magic-checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Checkout through Razorpay Magic Checkout: the customer's address, discount code and payment (or cash on delivery)
 * are all taken in Razorpay's window. When it finishes, the server confirms with Razorpay and places the order.
 */
export default function MagicCheckout({ user }) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0 && !busy) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary mt-8">Shop the collection</Link>
      </div>
    );
  }

  // Asks the server to place the order if Razorpay reports it paid or placed (cash on delivery)
  const complete = async (session, response = {}) => {
    try {
      const r = await api("/api/magic/complete", { method: "POST", body: { razorpay_order_id: session.razorpayOrderId, ...response } });
      if (r.open) {
        setBusy(false);
        return;
      }
      clear();
      router.push(`/account/orders/${r.order.id}?placed=1`);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const open = async () => {
    setError("");
    setBusy(true);
    let session;
    try {
      if (!(await loadMagicCheckout())) throw new Error("Couldn't load the checkout. Check your connection and try again.");
      session = await api("/api/magic/start", { method: "POST", body: { items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    let finished = false;
    const rzp = new window.Razorpay({
      key: session.keyId,
      one_click_checkout: true,
      name: "RAYVE",
      image: `${window.location.origin}/brand/admin-app/icon-512.png`, // the bull mark, square, shown in the checkout header
      order_id: session.razorpayOrderId,
      show_coupons: true,
      prefill: { name: user.name, email: user.email, ...(user.phone ? { contact: `+91${user.phone}` } : {}) },
      theme: { color: "#44442a" },
      handler: (response) => {
        finished = true;
        complete(session, response);
      },
      modal: {
        // Closing the window may still mean a cash-on-delivery order was placed, so check before giving up
        ondismiss: () => !finished && complete(session),
      },
    });
    rzp.on("payment.failed", (r) => setError(r?.error?.description ?? "The payment failed. Please try again."));
    rzp.open();
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="card p-6 sm:p-8">
          <p className="font-display text-xs uppercase tracking-[0.25em]">Signed in as</p>
          <p className="mt-3 font-medium">{user.name}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Next, our secure checkout (powered by Razorpay) asks for your delivery address and how you&apos;d like to pay — UPI,
            card, netbanking or cash on delivery. Saved addresses are filled in for you. Delivery is free across Delhi NCR.
          </p>
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <OrderSummary compact>
            {error && <p className="mt-5 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="button" onClick={open} disabled={busy} className="btn-primary mt-6 w-full">
              <Lock className="size-3.5" /> {busy ? "Opening checkout…" : `Continue to secure checkout · ${formatPrice(subtotal)}`}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted">
              Shipping and any discount code are added in the next step. By placing this order you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2">terms</Link>,{" "}
              <Link href="/shipping-policy" className="underline underline-offset-2">shipping</Link> and{" "}
              <Link href="/refund-policy" className="underline underline-offset-2">refund</Link> policies.
            </p>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
