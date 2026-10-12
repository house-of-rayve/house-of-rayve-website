"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { Panel } from "./PageHeader";
import { formatDate, formatPrice } from "@/lib/format";

const EMPTY = { code: "", type: "PERCENT", value: "", minSubtotal: "", maxUses: "", expiresAt: "" };

export default function CouponManager({ initial }) {
  const [coupons, setCoupons] = useState(initial);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { coupon } = await api("/api/admin/coupons", { method: "POST", body: form });
      setCoupons((c) => [coupon, ...c]);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };
  const toggle = async (c) => {
    const { coupon } = await api(`/api/admin/coupons/${c.id}`, { method: "PATCH", body: { active: !c.active } });
    setCoupons((list) => list.map((x) => (x.id === c.id ? coupon : x)));
  };
  const remove = async (c) => {
    if (!confirm(`Delete the code ${c.code}? Orders that used it keep their discount.`)) return;
    await api(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    setCoupons((list) => list.filter((x) => x.id !== c.id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="New code" className="h-max">
        <form onSubmit={create} className="space-y-4 p-5">
          <div>
            <label className="label">Code</label>
            <input className="field uppercase" value={form.code} onChange={set("code")} placeholder="LAUNCH10" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="field" value={form.type} onChange={set("type")}>
                <option value="PERCENT">% off</option>
                <option value="FLAT">₹ off</option>
              </select>
            </div>
            <div>
              <label className="label">{form.type === "FLAT" ? "Amount (₹)" : "Percent"}</label>
              <input className="field" type="number" min="1" value={form.value} onChange={set("value")} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Min. order (₹)</label>
              <input className="field" type="number" min="0" value={form.minSubtotal} onChange={set("minSubtotal")} placeholder="0" />
            </div>
            <div>
              <label className="label">Usage limit</label>
              <input className="field" type="number" min="1" value={form.maxUses} onChange={set("maxUses")} placeholder="Unlimited" />
            </div>
          </div>
          <div>
            <label className="label">Expires (optional)</label>
            <input className="field" type="date" value={form.expiresAt} onChange={set("expiresAt")} />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="btn-primary w-full">
            {busy ? "Saving…" : "Create code"}
          </button>
        </form>
      </Panel>

      <Panel title={`${coupons.length} codes`} className="lg:col-span-2">
        {coupons.length === 0 ? (
          <p className="p-5 text-sm text-muted">No codes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Discount</th>
                  <th className="px-5 py-3 font-medium">Rules</th>
                  <th className="px-5 py-3 font-medium">Used</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {coupons.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c.id}>
                      <td className="px-5 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-5 py-3">{c.type === "FLAT" ? formatPrice(c.value) : `${c.value}%`} off</td>
                      <td className="px-5 py-3 text-xs text-muted">
                        {c.minSubtotal ? `Min ${formatPrice(c.minSubtotal)}` : "Any order"}
                        {c.expiresAt && <span className="block">Until {formatDate(c.expiresAt)}</span>}
                      </td>
                      <td className="px-5 py-3">
                        {c.usedCount}
                        {c.maxUses ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggle(c)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${c.active && !expired ? "bg-emerald-50 text-emerald-700" : "bg-line text-muted"}`}
                          title="Click to switch on/off"
                        >
                          {expired ? "Expired" : c.active ? "Active" : "Off"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => remove(c)} className="text-muted hover:text-red-700" aria-label={`Delete ${c.code}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
