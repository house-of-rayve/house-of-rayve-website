"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";

/** Add or take away a customer's RAYVE points by hand, with a reason they'll see in their history. */
export default function PointsAdjust({ customerId }) {
  const router = useRouter();
  const { toast } = useToast();
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/api/admin/customers/${customerId}/points`, { method: "POST", body: { points: Number(points), note } });
      toast("Points updated.");
      setPoints("");
      setNote("");
      router.refresh();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
    setBusy(false);
  };

  const field = "h-9 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-olive-700";
  return (
    <form onSubmit={submit} className="space-y-2">
      <p className="text-xs font-medium text-ink/80">Adjust points</p>
      <div className="flex gap-2">
        <input type="number" required value={points} onChange={(e) => setPoints(e.target.value)} placeholder="+100 or −50" className={`${field} w-28`} />
        <input required value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason, e.g. Festive bonus" maxLength={120} className={`${field} min-w-0 flex-1`} />
      </div>
      <button disabled={busy || !points || !note} className="h-9 w-full rounded-md bg-olive-800 text-sm font-medium text-sand hover:bg-olive-950 disabled:opacity-40">
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
