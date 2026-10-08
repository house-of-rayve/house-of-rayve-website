"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";
import { EMPTY_ADDRESS } from "@/components/account/AddressFields";

const input = "h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-500/20";
const lbl = "mb-1.5 block text-xs font-medium text-ink/80";

const ADDRESS_INPUTS = [
  ["fullName", "Recipient name", "sm:col-span-1"],
  ["phone", "Recipient phone", "sm:col-span-1"],
  ["line1", "Address line 1", "sm:col-span-2"],
  ["line2", "Address line 2", "sm:col-span-2"],
  ["city", "City"],
  ["state", "State"],
  ["postalCode", "PIN code"],
  ["country", "Country"],
];

export default function CustomerForm({ customer }) {
  const router = useRouter();
  const { toast } = useToast();
  const primary = customer.addresses[0];
  const [form, setForm] = useState({ name: customer.name, email: customer.email, phone: customer.phone ?? "" });
  const [address, setAddress] = useState(
    primary ? { ...EMPTY_ADDRESS, ...primary, line2: primary.line2 ?? "" } : { ...EMPTY_ADDRESS, fullName: customer.name, phone: customer.phone ?? "" },
  );
  const [editAddress, setEditAddress] = useState(Boolean(primary));
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        body: { ...form, ...(editAddress ? { address: { ...address, id: primary?.id } } : {}) },
      });
      toast("Customer updated.");
      router.refresh();
    } catch (err) {
      toast(err.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">Contact details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={lbl}>Name</label>
            <input className={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input type="email" className={input} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{primary ? "Primary address" : "Address"}</h2>
          {!primary && (
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" className="accent-olive-800" checked={editAddress} onChange={(e) => setEditAddress(e.target.checked)} />
              Add an address
            </label>
          )}
        </div>
        {editAddress ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {ADDRESS_INPUTS.map(([k, label, span]) => (
              <div key={k} className={span}>
                <label className={lbl}>{label}</label>
                <input
                  className={input}
                  required={k !== "line2"}
                  value={address[k] ?? ""}
                  onChange={(e) => setAddress({ ...address, [k]: e.target.value })}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">This customer hasn&apos;t saved an address yet.</p>
        )}
      </section>

      <button disabled={busy} className="h-10 rounded-md bg-olive-800 px-6 text-sm font-medium text-sand hover:bg-olive-950 disabled:opacity-50">
        {busy ? "Saving…" : "Save customer"}
      </button>
    </form>
  );
}
