"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ImagePlus, Star } from "lucide-react";
import { api } from "@/components/ui/fetcher";
import { formatDate } from "@/lib/format";

function Stars({ value, size = "size-4" }) {
  return (
    <span className="flex text-olive-700" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? "fill-current" : "text-line"}`} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function ReviewForm({ productId, onDone }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    setError("");
    setBusy(true);
    const body = new FormData(e.currentTarget);
    body.set("productId", productId);
    body.set("rating", String(rating));
    if (!photo) body.delete("photo");
    try {
      await api("/api/reviews", { method: "POST", body });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 border border-line bg-paper p-5 sm:p-6">
      <p className="label">Your rating</p>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="p-0.5 text-olive-700"
          >
            <Star className={`size-6 transition-transform hover:scale-110 ${n <= (hover || rating) ? "fill-current" : "text-line"}`} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="mt-5">
        <label className="label" htmlFor="rv-title">Title (optional)</label>
        <input id="rv-title" name="title" maxLength={80} className="field" placeholder="Sums it up in a few words" />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="rv-body">Your review</label>
        <textarea id="rv-body" name="body" rows={4} required minLength={10} maxLength={1500} className="field" placeholder="How do they fit, feel and look?" />
      </div>
      <label className="mt-4 flex w-max cursor-pointer items-center gap-2 text-xs text-muted hover:text-ink">
        <ImagePlus className="size-4" /> {photo ? photo.name : "Add a photo (optional)"}
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="btn-primary mt-6">
        {busy ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}

/** Rating summary, approved reviews and the "write a review" form for a product. */
export default function ProductReviews({ productId, slug, summary, signedIn }) {
  const [writing, setWriting] = useState(false);
  const [sent, setSent] = useState(false);
  const { count, average, reviews } = summary;
  const bars = [5, 4, 3, 2, 1].map((n) => [n, reviews.filter((r) => r.rating === n).length]);

  return (
    <section id="reviews" className="container-x section-y border-t border-line">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <p className="eyebrow">Reviews</p>
          <h2 className="display-title mt-4 text-2xl sm:text-3xl">{count ? average.toFixed(1) : "No reviews yet"}</h2>
          {count > 0 && (
            <>
              <div className="mt-3 flex items-center gap-3">
                <Stars value={average} />
                <span className="text-sm text-muted">
                  {count} review{count > 1 ? "s" : ""}
                </span>
              </div>
              <dl className="mt-6 space-y-2">
                {bars.map(([n, c]) => (
                  <div key={n} className="flex items-center gap-3 text-xs">
                    <dt className="w-8 text-muted">{n} ★</dt>
                    <dd className="h-1 flex-1 bg-line">
                      <span className="block h-full bg-olive-700" style={{ width: `${(c / count) * 100}%` }} />
                    </dd>
                    <span className="w-5 text-right text-muted">{c}</span>
                  </div>
                ))}
              </dl>
            </>
          )}
          {sent ? (
            <p className="mt-8 bg-olive-500/10 p-4 text-sm text-olive-800">Thank you — your review will appear here once it&apos;s approved.</p>
          ) : signedIn ? (
            !writing && (
              <button onClick={() => setWriting(true)} className="btn-outline mt-8">
                Write a review
              </button>
            )
          ) : (
            <Link href={`/login?next=${encodeURIComponent(`/product/${slug}#reviews`)}`} className="btn-outline mt-8">
              Sign in to write a review
            </Link>
          )}
          {writing && !sent && <ReviewForm productId={productId} onDone={() => (setSent(true), setWriting(false))} />}
        </div>

        <div className="lg:col-span-8">
          {count === 0 ? (
            <p className="text-sm text-muted">Be the first to tell others what you think of this frame.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="flex gap-5 py-6 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={r.rating} size="size-3.5" />
                      {r.title && <p className="font-medium">{r.title}</p>}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80">{r.body}</p>
                    <p className="mt-3 flex items-center gap-2 text-xs text-muted">
                      {r.author} · {formatDate(r.createdAt)}
                      {r.verified && (
                        <span className="flex items-center gap-1 text-olive-700">
                          <BadgeCheck className="size-3.5" /> Verified buyer
                        </span>
                      )}
                    </p>
                  </div>
                  {r.photo && (
                    <a href={r.photo} target="_blank" rel="noreferrer" className="relative size-20 shrink-0 overflow-hidden bg-mist sm:size-24">
                      <Image src={r.photo} alt={`Photo from ${r.author}`} fill sizes="96px" className="object-cover" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
