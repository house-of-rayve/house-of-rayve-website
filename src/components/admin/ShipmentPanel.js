"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileDown, RefreshCw, Truck } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime, formatPrice } from "@/lib/format";

const select = "h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-olive-700";
const primary = "flex h-10 w-full items-center justify-center gap-2 rounded-md bg-olive-800 text-sm font-medium text-sand hover:bg-olive-950 disabled:opacity-40";
const secondary = "flex h-9 items-center justify-center gap-1.5 rounded-md border border-line px-3 text-xs font-medium hover:border-olive-700 disabled:opacity-40";

/** Book the order with iThink Logistics, then print the label, follow tracking or cancel the pickup. */
export default function ShipmentPanel({ order, enabled }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState("");
  const [rates, setRates] = useState(null); // null while loading
  const [ratesError, setRatesError] = useState("");
  const [courier, setCourier] = useState("");
  const shippable = enabled && !order.awb && ["PENDING", "CONFIRMED"].includes(order.status) && !(order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID");

  useEffect(() => {
    if (!shippable) return;
    let live = true;
    api(`/api/admin/orders/${order.id}/shipment`)
      .then((r) => live && setRates(r.rates))
      .catch((e) => live && (setRates([]), setRatesError(e.message)));
    return () => {
      live = false;
    };
  }, [order.id, shippable]);

  const run = async (action, body = {}) => {
    setBusy(action);
    try {
      const r = await api(`/api/admin/orders/${order.id}/shipment`, { method: "POST", body: { action, ...body } });
      return r;
    } catch (e) {
      toast(e.message, { type: "error" });
      return null;
    } finally {
      setBusy("");
    }
  };

  const book = async () => {
    const pick = rates?.find((r) => r.id === courier);
    if (!confirm(`Book this order with ${pick ? pick.name : "iThink's chosen courier"}? A pickup will be scheduled and the shipping charge taken from your iThink wallet.`)) return;
    if (await run("create", { courier })) {
      toast("Shipment booked — the customer has been emailed the tracking link.");
      router.refresh();
    }
  };
  const refresh = async () => {
    if (await run("track")) router.refresh();
  };
  const cancel = async () => {
    if (!confirm("Cancel the courier pickup? The order goes back to Confirmed so it can be shipped again.")) return;
    if (await run("cancel")) {
      toast("Shipment cancelled.");
      router.refresh();
    }
  };

  if (!enabled) return <p className="p-5 text-sm text-muted">iThink Logistics isn&apos;t set up. Add the API keys in Vercel to ship from here.</p>;

  if (order.awb) {
    return (
      <div className="space-y-4 p-5 text-sm">
        <dl className="space-y-2">
          <div className="flex justify-between gap-3"><dt className="text-muted">Courier</dt><dd className="capitalize">{order.courier ?? "—"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">AWB</dt><dd className="font-mono text-xs">{order.awb}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted">Status</dt><dd className="text-right font-medium">{order.shipmentStatus ?? "—"}</dd></div>
          {order.shipmentLocation && <div className="flex justify-between gap-3"><dt className="text-muted">Last seen</dt><dd className="text-right">{order.shipmentLocation}</dd></div>}
          {order.trackedAt && <div className="flex justify-between gap-3"><dt className="text-muted">Checked</dt><dd className="text-right text-xs text-muted">{formatDateTime(order.trackedAt)}</dd></div>}
        </dl>
        {order.trackingUrl && (
          <a href={order.trackingUrl} target="_blank" rel="noreferrer" className={primary}>
            <Truck className="size-4" /> Live tracking <ExternalLink className="size-3.5" />
          </a>
        )}
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/labels?order=${order.id}`} target="_blank" rel="noreferrer" className={secondary}>
            <FileDown className="size-3.5" /> Shipping label
          </a>
          <button onClick={refresh} disabled={!!busy} className={secondary}>
            <RefreshCw className={`size-3.5 ${busy === "track" ? "animate-spin" : ""}`} /> Refresh status
          </button>
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <button onClick={cancel} disabled={!!busy} className={`${secondary} text-red-700`}>
              {busy === "cancel" ? "Cancelling…" : "Cancel pickup"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!shippable) {
    const why = order.status === "CANCELLED" ? "This order was cancelled." : order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID" ? "Waiting for the online payment." : "Not shipped through iThink.";
    return <p className="p-5 text-sm text-muted">{why}</p>;
  }

  return (
    <div className="space-y-4 p-5">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/80">Courier to {order.shipPostalCode}</label>
        <select className={select} value={courier} onChange={(e) => setCourier(e.target.value)} disabled={rates === null}>
          <option value="">{rates === null ? "Checking couriers…" : "Auto — iThink picks the best"}</option>
          {rates?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} · {formatPrice(r.rate)}{r.days ? ` · ${r.days} ${r.days === 1 ? "day" : "days"}` : ""}
            </option>
          ))}
        </select>
        {ratesError && <p className="mt-1.5 text-xs text-red-700">{ratesError}</p>}
        {rates?.length === 0 && !ratesError && <p className="mt-1.5 text-xs text-red-700">No courier delivers to this pincode.</p>}
      </div>
      {order.shipmentStatus?.startsWith("Not booked") && (
        <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">Automatic booking failed — {order.shipmentStatus.replace(/^Not booked: /, "")}</p>
      )}
      <button onClick={book} disabled={!!busy || rates?.length === 0} className={primary}>
        <Truck className="size-4" /> {busy === "create" ? "Booking…" : "Ship with iThink"}
      </button>
      <p className="text-xs text-muted">New orders are booked automatically. Use this if that didn&apos;t happen — it books the pickup and adds the tracking link.</p>
    </div>
  );
}
