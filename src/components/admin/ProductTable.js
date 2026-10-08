"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Search, ExternalLink } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";

export default function ProductTable({ products }) {
  const router = useRouter();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState(null);

  const filtered = products.filter((p) =>
    [p.name, p.category, p.shape, p.frameColor].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const toggle = async (p) => {
    setBusyId(p.id);
    try {
      await api(`/api/admin/products/${p.id}`, { method: "PATCH", body: { isActive: !p.isActive } });
      toast(`${p.name} ${p.isActive ? "hidden from" : "published to"} the store.`);
      router.refresh();
    } catch (e) {
      toast(e.message, { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    setBusyId(p.id);
    try {
      await api(`/api/admin/products/${p.id}`, { method: "DELETE" });
      toast(`${p.name} deleted.`);
      router.refresh();
    } catch (e) {
      toast(e.message, { type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="border-b border-line p-3">
        <label className="flex h-9 max-w-xs items-center gap-2 rounded-md border border-line px-3">
          <Search className="size-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="flex-1 bg-transparent text-sm outline-none" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Visible</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id} className={`hover:bg-[#faf9f5] ${busyId === p.id ? "opacity-50" : ""}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded bg-sand">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:underline">{p.name}</Link>
                      <p className="text-xs text-muted">{[p.shape, p.frameColor].filter(Boolean).join(" · ")}</p>
                    </div>
                    {p.featured && <span className="rounded bg-olive-500/15 px-1.5 py-0.5 text-[10px] font-medium text-olive-700">Featured</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">{p.category}</td>
                <td className="px-5 py-3 tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-5 py-3">
                  <span className={`tabular-nums ${p.stock === 0 ? "text-red-700" : p.stock <= 5 ? "text-amber-700" : ""}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggle(p)}
                    disabled={busyId === p.id}
                    role="switch"
                    aria-checked={p.isActive}
                    aria-label={`Toggle ${p.name} visibility`}
                    className={`relative h-5 w-9 rounded-full transition-colors ${p.isActive ? "bg-olive-800" : "bg-stone-300"}`}
                  >
                    <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${p.isActive ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="rounded p-2 text-muted hover:bg-stone-100 hover:text-ink" title="View in store">
                      <ExternalLink className="size-4" />
                    </a>
                    <Link href={`/admin/products/${p.id}`} className="rounded p-2 text-muted hover:bg-stone-100 hover:text-ink" title="Edit">
                      <Pencil className="size-4" />
                    </Link>
                    <button onClick={() => remove(p)} className="rounded p-2 text-muted hover:bg-red-50 hover:text-red-700" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
