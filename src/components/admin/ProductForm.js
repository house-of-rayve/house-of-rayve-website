"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, SHAPES } from "@/lib/constants";

const input = "h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-olive-700 focus:ring-2 focus:ring-olive-500/20";
const lbl = "mb-1.5 block text-xs font-medium text-ink/80";

export default function ProductForm({ product }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const editing = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "Sunglasses",
    shape: product?.shape ?? "",
    frameColor: product?.frameColor ?? "",
    lensColor: product?.lensColor ?? "",
    material: product?.material ?? "",
    price: product?.price ?? "",
    comparePrice: product?.comparePrice ?? "",
    stock: product?.stock ?? 0,
    images: product?.images ?? [],
    featured: product?.featured ?? false,
    isActive: product?.isActive ?? true,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const upload = async (files) => {
    if (!files?.length) return;
    const body = new FormData();
    for (const f of files) body.append("files", f);
    setUploading(true);
    try {
      const { urls } = await api("/api/admin/upload", { method: "POST", body });
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (e) {
      toast(e.message, { type: "error" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = () => {
    const url = imageUrl.trim();
    // next/image only loads site paths and Supabase Storage URLs (see next.config.mjs)
    if (!url.startsWith("/") && !url.includes(".supabase.co/storage/v1/object/public/")) {
      return toast("Use a site path (/images/toro.jpg) or a Supabase Storage public URL.", { type: "error" });
    }
    setForm({ ...form, images: [...form.images, url] });
    setImageUrl("");
  };

  const move = (i, dir) => {
    const images = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    [images[i], images[j]] = [images[j], images[i]];
    setForm({ ...form, images });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...form, stock: Number(form.stock) };
      if (editing) {
        await api(`/api/admin/products/${product.id}`, { method: "PATCH", body });
        toast("Product updated.");
        router.refresh();
      } else {
        await api("/api/admin/products", { method: "POST", body });
        toast("Product created.");
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      toast(err.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/products/${product.id}`, { method: "DELETE" });
      toast("Product deleted.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Name *</label>
              <input className={input} required value={form.name} onChange={set("name")} />
            </div>
            <div>
              <label className={lbl}>URL slug</label>
              <input className={input} value={form.slug} onChange={set("slug")} placeholder="Generated from name" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Tagline</label>
              <input className={input} value={form.tagline} onChange={set("tagline")} placeholder="One short line" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Description *</label>
              <textarea rows={5} className={`${input} h-auto py-2`} required value={form.description} onChange={set("description")} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold">Images</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {form.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-md border border-line bg-sand">
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 text-[10px] font-medium">Main</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} className="text-white" aria-label="Move left"><ArrowLeft className="size-3.5" /></button>
                  <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="text-white" aria-label="Remove image"><X className="size-3.5" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="text-white" aria-label="Move right"><ArrowRight className="size-3.5" /></button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line text-xs text-muted hover:border-olive-500 hover:text-ink"
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              {uploading ? "Uploading" : "Upload"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
          <div className="mt-4 flex gap-2">
            <input className={input} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or add an existing path, e.g. /images/toro.jpg" />
            <button type="button" onClick={addUrl} className="h-10 shrink-0 rounded-md border border-line px-4 text-sm hover:bg-stone-50">Add</button>
          </div>
          <p className="mt-2 text-xs text-muted">The first image is the main photo; the second shows on hover in the shop.</p>
        </section>

        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold">Attributes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Shape</label>
              <select className={input} value={form.shape} onChange={set("shape")}>
                <option value="">—</option>
                {SHAPES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Material</label>
              <input className={input} value={form.material} onChange={set("material")} />
            </div>
            <div>
              <label className={lbl}>Frame colour</label>
              <input className={input} value={form.frameColor} onChange={set("frameColor")} />
            </div>
            <div>
              <label className={lbl}>Lens colour</label>
              <input className={input} value={form.lensColor} onChange={set("lensColor")} />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold">Status</h2>
          <label className="flex items-center justify-between py-1 text-sm">
            Visible in store
            <input type="checkbox" className="size-4 accent-olive-800" checked={form.isActive} onChange={set("isActive")} />
          </label>
          <label className="mt-2 flex items-center justify-between py-1 text-sm">
            Featured on home page
            <input type="checkbox" className="size-4 accent-olive-800" checked={form.featured} onChange={set("featured")} />
          </label>
          <div className="mt-4">
            <label className={lbl}>Category</label>
            <select className={input} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold">Pricing & inventory</h2>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Price (₹) *</label>
              <input type="number" min="1" className={input} required value={form.price} onChange={set("price")} />
            </div>
            <div>
              <label className={lbl}>Compare-at price (₹)</label>
              <input type="number" min="0" className={input} value={form.comparePrice} onChange={set("comparePrice")} placeholder="Shows as strikethrough" />
            </div>
            <div>
              <label className={lbl}>Stock *</label>
              <input type="number" min="0" step="1" className={input} required value={form.stock} onChange={set("stock")} />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <button disabled={busy || uploading} className="h-10 rounded-md bg-olive-800 text-sm font-medium text-sand hover:bg-olive-950 disabled:opacity-50">
            {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
          </button>
          {editing && (
            <button type="button" onClick={remove} className="h-10 rounded-md border border-red-200 text-sm text-red-700 hover:bg-red-50">
              Delete product
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
