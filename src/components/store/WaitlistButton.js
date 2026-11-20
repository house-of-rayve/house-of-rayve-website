"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import WaitlistModal from "./WaitlistModal";

// The frames this shopper is already waiting for, fetched once per page load and shared by every button
let mine = null;
const waitingFor = () =>
  (mine ??= fetch("/api/waitlist")
    .then((r) => r.json())
    .then((d) => new Set(d.productIds ?? []))
    .catch(() => new Set()));
const autoJoined = new Set(); // frames joined on return from sign-in, so two buttons for one frame don't both try

/**
 * "Join the waitlist" in place of "Add to bag" before launch. Signed-out shoppers go to sign-in first and come back to
 * this page with ?waitlist=<slug>, which joins them straight away.
 */
export default function WaitlistButton({
  product,
  color,
  className = "",
  children,
  tabIndex,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [state, setState] = useState("idle"); // idle | busy | joined
  const [done, setDone] = useState(null); // { email, already } while the success popup is open
  const close = useCallback(() => setDone(null), []);

  const join = async () => {
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, color }),
      });
      if (res.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`${pathname}?waitlist=${product.slug}${color ? `&color=${color}` : ""}`)}`,
        );
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.error || "Couldn't join the waitlist. Please try again.",
        );
      (await waitingFor()).add(product.id);
      setState("joined");
      setDone({ email: data.email, already: !!data.already });
    } catch (err) {
      setState("idle");
      toast(err.message);
    }
  };

  // Already waiting? And coming back from sign-in to join this frame?
  useEffect(() => {
    let live = true;
    waitingFor().then(
      (set) => live && set.has(product.id) && setState("joined"),
    );
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("waitlist") === product.slug &&
      !autoJoined.has(product.slug)
    ) {
      autoJoined.add(product.slug);
      params.delete("waitlist");
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${params.size ? `?${params}` : ""}`,
      );
      setTimeout(join, 0); // after this render, once the page has settled
    }
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, product.slug]);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // the button may sit inside a product card's link
          e.stopPropagation();
          if (state === "idle") join();
        }}
        disabled={state === "busy"}
        aria-disabled={state === "joined"}
        tabIndex={tabIndex}
        className={className}
      >
        {state === "busy" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : state === "joined" ? (
          <>
            <Check className="size-3.5" /> On the waitlist
          </>
        ) : (
          (children ?? "Join the waitlist")
        )}
      </button>
      {done && (
        <WaitlistModal
          product={product}
          email={done.email}
          already={done.already}
          onClose={close}
        />
      )}
    </>
  );
}
