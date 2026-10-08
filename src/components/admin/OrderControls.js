"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";
import { ORDER_STATUSES, PAYMENT_STATUSES, STATUS_LABELS } from "@/lib/constants";

const select = "h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-olive-700";

export default function OrderControls({ order }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [busy, setBusy] = useState(false);
  const locked = order.status === "CANCELLED";
  const dirty = status !== order.status || paymentStatus !== order.paymentStatus;

  const save = async () => {
    if (status === "CANCELLED" && !confirm("Cancel this order? Stock will be returned to inventory.")) return;
    setBusy(true);
    try {
      await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body: { status, paymentStatus } });
      toast("Order updated.");
      router.refresh();
    } catch (e) {
      toast(e.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/80">Order status</label>
        <select className={select} value={status} disabled={locked} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/80">Payment status</label>
        <select className={select} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <button onClick={save} disabled={!dirty || busy} className="h-10 w-full rounded-md bg-olive-800 text-sm font-medium text-sand hover:bg-olive-950 disabled:opacity-40">
        {busy ? "Saving…" : "Update order"}
      </button>
      {locked && <p className="text-xs text-muted">Cancelled orders can&apos;t be reopened.</p>}
    </div>
  );
}
