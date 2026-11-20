"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { TRY_ON_ENABLED } from "@/lib/constants";

/** The "you're on the waitlist" popup shown after joining (or re-joining) a frame's waitlist. */
export default function WaitlistModal({ product, email, already, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const image = product.images?.[0];
  const stop = (e) => e.stopPropagation(); // the button that opened this may sit inside a card link

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      onClick={stop}
      className="fixed inset-0 z-[100] grid place-items-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-olive-950/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md animate-rise overflow-hidden bg-olive-950 text-sand shadow-2xl ring-1 ring-olive-500/30">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center text-sand/70 transition hover:text-sand"
        >
          <X className="size-5" />
        </button>

        {image && (
          <div className="relative aspect-[16/10] bg-mist">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="448px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-olive-950 via-olive-950/10 to-transparent" />
          </div>
        )}

        <div
          className={`relative px-7 pb-7 text-center ${image ? "-mt-10" : "pt-10"}`}
        >
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-olive-500 text-olive-950 ring-8 ring-olive-950">
            <svg
              viewBox="0 0 24 24"
              className="size-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                strokeDasharray="40"
                className="animate-draw"
              />
            </svg>
          </div>

          <p className="mt-5 font-display text-[10px] uppercase tracking-[0.35em] text-olive-400">
            {product.name}
          </p>
          <h2
            id="waitlist-title"
            className="mt-3 font-display text-xl uppercase tracking-[0.12em]"
          >
            {already ? "Already on the list" : "You're on the list"}
          </h2>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-sand/75">
            {already ? "No need to sign up twice. " : "Thanks for joining. "}
            We&apos;ll email{" "}
            {email ? <span className="text-sand">{email}</span> : "you"} the
            moment {product.name} goes live, before anyone else.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            {TRY_ON_ENABLED && (
              <Link
                href={`/try-on?p=${product.slug}`}
                onClick={onClose}
                className="flex h-11 shrink-0 items-center sm:flex-1 justify-center bg-olive-500 font-display text-[10px] uppercase tracking-[0.25em] text-olive-950 transition hover:bg-olive-400"
              >
                Try it on
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-11 shrink-0 border sm:flex-1 border-sand/25 font-display text-[10px] uppercase tracking-[0.25em] transition hover:border-sand/60"
            >
              Keep exploring
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
