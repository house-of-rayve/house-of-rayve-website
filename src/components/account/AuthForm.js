"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/ui/fetcher";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

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

  const qs = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <>
      <p className="eyebrow">{isLogin ? "Welcome back" : "Join Rayve"}</p>
      <h1 className="display-title mt-3 text-2xl">{isLogin ? "Sign in" : "Create account"}</h1>
      <form onSubmit={submit} className="mt-10 space-y-5">
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
