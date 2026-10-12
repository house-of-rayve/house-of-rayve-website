"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { formatDate } from "@/lib/format";

export default function ReviewModeration({ initial }) {
  const [reviews, setReviews] = useState(initial);
  const setApproved = async (r, approved) => {
    await api(`/api/admin/reviews/${r.id}`, { method: "PATCH", body: { approved } });
    setReviews((list) => list.map((x) => (x.id === r.id ? { ...x, approved } : x)));
  };
  const remove = async (r) => {
    if (!confirm("Delete this review permanently?")) return;
    await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
    setReviews((list) => list.filter((x) => x.id !== r.id));
  };

  if (!reviews.length) return <p className="rounded-lg border border-line bg-white p-6 text-sm text-muted">No reviews yet.</p>;
  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <article key={r.id} className={`flex gap-4 rounded-lg border bg-white p-5 ${r.approved ? "border-line" : "border-amber-300"}`}>
          {r.photo && (
            <a href={r.photo} target="_blank" rel="noreferrer" className="relative size-20 shrink-0 overflow-hidden rounded">
              <Image src={r.photo} alt="" fill sizes="80px" className="object-cover" />
            </a>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="flex text-amber-500" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-current" : "text-line"}`} />
                ))}
              </span>
              <Link href={`/product/${r.product.slug}`} className="font-medium hover:underline">
                {r.product.name}
              </Link>
              <span className="text-xs text-muted">
                {r.user.name} · {r.user.email} · {formatDate(r.createdAt)}
              </span>
            </div>
            {r.title && <p className="mt-2 font-medium">{r.title}</p>}
            <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{r.body}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {r.approved ? (
              <button onClick={() => setApproved(r, false)} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                Live · hide
              </button>
            ) : (
              <button onClick={() => setApproved(r, true)} className="rounded-full bg-olive-800 px-3 py-1 text-xs font-medium text-sand hover:bg-olive-950">
                Approve
              </button>
            )}
            <button onClick={() => remove(r)} className="text-muted hover:text-red-700" aria-label="Delete review">
              <Trash2 className="size-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
