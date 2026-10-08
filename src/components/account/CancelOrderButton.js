"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";

export default function CancelOrderButton({ orderId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const cancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setBusy(true);
    try {
      await api(`/api/account/orders/${orderId}/cancel`, { method: "POST" });
      toast("Your order has been cancelled.");
      router.refresh();
    } catch (e) {
      toast(e.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <button onClick={cancel} disabled={busy} className="btn-outline btn-sm">
      {busy ? "Cancelling…" : "Cancel order"}
    </button>
  );
}
