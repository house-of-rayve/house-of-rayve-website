"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AddressFields, { EMPTY_ADDRESS } from "./AddressFields";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";

export default function AddressBook({ addresses }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null); // null | "new" | address id
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [makeDefault, setMakeDefault] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = (address) => {
    setEditing(address?.id ?? "new");
    setForm(address ? { ...EMPTY_ADDRESS, ...address, line2: address.line2 ?? "" } : EMPTY_ADDRESS);
    setMakeDefault(Boolean(address?.isDefault));
  };

  const run = async (fn, message) => {
    setBusy(true);
    try {
      await fn();
      toast(message);
      setEditing(null);
      router.refresh();
    } catch (err) {
      toast(err.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const save = (e) => {
    e.preventDefault();
    const body = { ...form, isDefault: makeDefault };
    run(
      () =>
        editing === "new"
          ? api("/api/account/addresses", { method: "POST", body })
          : api(`/api/account/addresses/${editing}`, { method: "PATCH", body }),
      "Address saved.",
    );
  };

  const remove = (id) => {
    if (!confirm("Delete this address?")) return;
    run(() => api(`/api/account/addresses/${id}`, { method: "DELETE" }), "Address removed.");
  };

  const setDefault = (a) =>
    run(() => api(`/api/account/addresses/${a.id}`, { method: "PATCH", body: { ...a, isDefault: true } }), "Default address updated.");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.25em]">Saved addresses</h2>
        {editing === null && (
          <button onClick={() => open(null)} className="btn-outline btn-sm">
            <Plus className="size-3.5" /> Add address
          </button>
        )}
      </div>

      {editing !== null && (
        <form onSubmit={save} className="card p-6 sm:p-8">
          <h3 className="mb-6 text-sm font-medium">{editing === "new" ? "New address" : "Edit address"}</h3>
          <AddressFields value={form} onChange={setForm} showLabel />
          <label className="mt-5 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" className="accent-olive-800" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} />
            Set as default address
          </label>
          <div className="mt-6 flex gap-3">
            <button disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save address"}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && editing === null ? (
        <div className="card p-10 text-center text-sm text-muted">No saved addresses yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className={`card flex flex-col p-6 ${a.isDefault ? "border-olive-800" : ""}`}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">{a.label}</span>
                {a.isDefault && <span className="bg-olive-800 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-sand">Default</span>}
              </div>
              <address className="mt-3 flex-1 text-sm not-italic leading-relaxed text-ink/80">
                <span className="font-medium text-ink">{a.fullName}</span><br />
                {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                {a.city}, {a.state} {a.postalCode}<br />
                {a.country} · {a.phone}
              </address>
              <div className="mt-5 flex gap-4 text-xs">
                <button onClick={() => open(a)} className="link-underline">Edit</button>
                {!a.isDefault && <button onClick={() => setDefault(a)} className="link-underline">Make default</button>}
                <button onClick={() => remove(a.id)} className="link-underline text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
