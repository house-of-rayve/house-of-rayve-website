"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/ui/fetcher";

const GOOGLE_ERRORS = {
  google_cancelled: "Google sign-in was cancelled.",
  google_failed: "We couldn't sign you in with Google. Please try again.",
  google_unverified: "Your Google email isn't verified. Please use another account.",
  google_unavailable: "Google sign-in isn't set up yet.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.73Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.28a12 12 0 0 0 0 10.8l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
    </svg>
  );
}

export default function AuthForm({ mode, googleEnabled = false }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState(GOOGLE_ERRORS[params.get("error")] ?? "");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { user } = await api(isLogin ? "/api/auth/login" : "/api/auth/register", { method: "POST", body: form });
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.replace(safeNext ?? (user.role === "ADMIN" ? "/admin" : "/account"));
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <p className="eyebrow">{isLogin ? "Welcome back" : "Join Rayve"}</p>
      <h1 className="display-title mt-3 text-2xl">{isLogin ? "Sign in" : "Create account"}</h1>
      {googleEnabled && (
        <>
          <a href={`/api/auth/google${qs}`} className="btn-outline mt-10 w-full normal-case tracking-normal">
            <GoogleIcon /> <span className="text-sm">Continue with Google</span>
          </a>
          <div className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}
      <form onSubmit={submit} className={`${googleEnabled ? "mt-8" : "mt-10"} space-y-5`}>
        {!isLogin && (
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" className="field" required value={form.name} onChange={set("name")} autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="field" required value={form.email} onChange={set("email")} autoComplete="email" />
        </div>
        {!isLogin && (
          <div>
            <label className="label" htmlFor="phone">Phone (optional)</label>
            <input id="phone" type="tel" className="field" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+91" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="field"
            required
            minLength={isLogin ? undefined : 8}
            value={form.password}
            onChange={set("password")}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {!isLogin && <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>}
        </div>
        {error && <p className="bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        {isLogin ? "New to Rayve? " : "Already have an account? "}
        <Link href={(isLogin ? "/register" : "/login") + qs} className="link-underline text-ink">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </>
  );
}
