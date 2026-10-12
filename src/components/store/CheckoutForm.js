"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Banknote, CreditCard, TicketPercent, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import OrderSummary from "@/components/cart/OrderSummary";
import AddressFields, { EMPTY_ADDRESS } from "@/components/account/AddressFields";
import { api } from "@/components/ui/fetcher";
import { formatPrice } from "@/lib/format";

// Loads Razorpay's checkout script once, when an online payment starts
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutForm({ user, addresses, onlinePayments = false }) {
  const router = useRouter();
  const { items, subtotal, total, clear } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, amount, label }
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "new");
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, fullName: user.name, phone: user.phone ?? "" });
  const [saveAddress, setSaveAddress] = useState(true);
  const [payment, setPayment] = useState("COD");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (items.length === 0 && !busy) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary mt-8">Shop the collection</Link>
      </div>
    );
  }

  const applyCode = async () => {
    setCodeError("");
    setChecking(true);
    try {
      const r = await api("/api/coupons/check", { method: "POST", body: { code: codeInput, subtotal } });
      setCoupon({ code: r.code, amount: r.discount, label: r.label });
      setCodeInput("");
    } catch (err) {
      setCodeError(err.message);
    }
    setChecking(false);
  };

  const finish = (order) => {
    clear();
    router.push(`/account/orders/${order.id}?placed=1`);
    router.refresh();
  };

  // Online: open Razorpay; the order only counts as paid once the server verifies the payment signature.
  // Closing the window cancels the unpaid order so its stock is released.
  const payOnline = async (order) => {
    const cancel = (message) => {
      api(`/api/account/orders/${order.id}/cancel`, { method: "POST" }).catch(() => {});
      setError(message);
      setBusy(false);
    };
    if (!(await loadRazorpay())) return cancel("Couldn't load the payment window. Check your connection and try again.");
    let session;
    try {
      session = await api("/api/payments/razorpay/order", { method: "POST", body: { orderId: order.id } });
    } catch (err) {
      return cancel(err.message);
    }
    const rzp = new window.Razorpay({
      key: session.keyId,
      order_id: session.razorpayOrderId,
      amount: session.amount,
      currency: session.currency,
      name: "RAYVE",
      description: `Order ${session.orderNumber}`,
      prefill: session.customer,
      theme: { color: "#44442a" },
      handler: async (response) => {
        try {
          await api("/api/payments/razorpay/verify", { method: "POST", body: { orderId: order.id, ...response } });
          finish(order);
        } catch (err) {
          setError(`${err.message} If money was taken, write to info@houseofrayve.com with order ${order.orderNumber}.`);
          setBusy(false);
        }
      },
      modal: { ondismiss: () => cancel("Payment cancelled — your order wasn't placed. You can try again.") },
    });
    rzp.on("payment.failed", (r) => setError(r?.error?.description ?? "The payment failed. Please try again."));
    rzp.open();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { order } = await api("/api/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          ...(addressId === "new" ? { address, saveAddress } : { addressId }),
          paymentMethod: payment,
          couponCode: coupon?.code ?? "",
          notes,
        },
      });
      if (order.paymentMethod === "ONLINE") await payOnline(order);
      else finish(order);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const payable = total - (coupon?.amount ?? 0);
  const paymentOptions = [
    { id: "COD", title: "Cash on delivery", text: "Pay when your order arrives.", Icon: Banknote },
    ...(onlinePayments ? [{ id: "ONLINE", title: "Pay online", text: "UPI, cards & netbanking, secured by Razorpay.", Icon: CreditCard }] : []),
  ];

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-12 lg:col-span-7">
        <section>
          <h2 className="font-display text-xs uppercase tracking-[0.25em]">1 · Contact</h2>
          <div className="card mt-5 flex items-center justify-between p-5 text-sm">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted">{user.email}</p>
            </div>
            <Link href="/account/profile" className="link-underline text-xs">Edit</Link>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xs uppercase tracking-[0.25em]">2 · Shipping address</h2>
          <div className="mt-5 grid gap-3">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`card flex cursor-pointer gap-4 p-5 text-sm transition-colors ${addressId === a.id ? "border-olive-800" : ""}`}
              >
                <input type="radio" name="address" className="mt-1 accent-olive-800" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                <span>
                  <span className="font-medium">{a.fullName}</span>
                  <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-muted">{a.label}</span>
                  <span className="mt-1 block text-muted">
                    {[a.line1, a.line2, a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
                  </span>
                  <span className="block text-muted">{a.phone}</span>
                </span>
              </label>
            ))}
            {addresses.length > 0 && (
              <label className={`card flex cursor-pointer items-center gap-4 p-5 text-sm ${addressId === "new" ? "border-olive-800" : ""}`}>
                <input type="radio" name="address" className="accent-olive-800" checked={addressId === "new"} onChange={() => setAddressId("new")} />
                Use a new address
              </label>
            )}
          </div>
          {addressId === "new" && (
            <div className="mt-6">
              <AddressFields value={address} onChange={setAddress} />
              <label className="mt-4 flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" className="accent-olive-800" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                Save this address to my account
              </label>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xs uppercase tracking-[0.25em]">3 · Payment</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {paymentOptions.map(({ id, title, text, Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setPayment(id)}
                className={`card relative flex gap-4 p-5 text-left text-sm transition-colors ${payment === id ? "border-olive-800" : "hover:border-olive-200"}`}
              >
                <Icon className="size-5 shrink-0 text-olive-500" strokeWidth={1.5} />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="mt-1 block text-xs text-muted">{text}</span>
                </span>
                {payment === id && <Check className="absolute right-4 top-4 size-4 text-olive-800" />}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <label className="label">Order notes (optional)</label>
            <textarea rows={3} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery instructions, gift message…" />
          </div>
        </section>
      </div>

      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <OrderSummary
            compact
            discount={coupon}
            couponSlot={
              <div className="mt-6 border-t border-line pt-5">
                {coupon ? (
                  <p className="flex items-center justify-between bg-olive-500/10 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-olive-800">
                      <TicketPercent className="size-4" /> <strong className="font-medium">{coupon.code}</strong> · {coupon.label}
                    </span>
                    <button type="button" onClick={() => setCoupon(null)} className="text-muted hover:text-ink" aria-label="Remove code">
                      <X className="size-4" />
                    </button>
                  </p>
                ) : (
                  <>
                    <label className="label" htmlFor="coupon">Discount code</label>
                    <div className="flex">
                      <input
                        id="coupon"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), codeInput && applyCode())}
                        className="field rounded-r-none uppercase"
                        placeholder="Enter code"
                      />
                      <button type="button" disabled={!codeInput || checking} onClick={applyCode} className="btn h-11 shrink-0 border border-l-0 border-line bg-paper px-4 text-[10px] hover:border-olive-800 disabled:opacity-50">
                        {checking ? "…" : "Apply"}
                      </button>
                    </div>
                    {codeError && <p className="mt-2 text-xs text-red-700">{codeError}</p>}
                  </>
                )}
              </div>
            }
          >
            {error && <p className="mt-5 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="btn-primary mt-6 w-full">
              {busy ? (payment === "ONLINE" ? "Waiting for payment…" : "Placing order…") : `${payment === "ONLINE" ? "Pay" : "Place order"} · ${formatPrice(payable)}`}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted">By placing this order you agree to our terms of sale.</p>
          </OrderSummary>
        </div>
      </div>
    </form>
  );
}
