"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/components/ui/fetcher";
import { useToast } from "@/components/ui/Toast";

export default function ProfileForms({ user }) {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: user.phone ?? "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy("profile");
    try {
      await api("/api/account/profile", { method: "PATCH", body: profile });
      toast("Profile updated.");
      router.refresh();
    } catch (err) {
      toast(err.message, { type: "error" });
    } finally {
      setBusy("");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast("New passwords do not match.", { type: "error" });
    setBusy("password");
    try {
      await api("/api/account/password", { method: "POST", body: pw });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed.");
    } catch (err) {
      toast(err.message, { type: "error" });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={saveProfile} className="card p-6 sm:p-8">
        <h2 className="font-display text-xs uppercase tracking-[0.25em]">Personal details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input className="field" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="field" required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" className="field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91" />
          </div>
        </div>
        <button disabled={busy === "profile"} className="btn-primary mt-6">
          {busy === "profile" ? "Saving…" : "Save changes"}
        </button>
      </form>

      <form onSubmit={savePassword} className="card p-6 sm:p-8">
        <h2 className="font-display text-xs uppercase tracking-[0.25em]">Change password</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label">Current</label>
            <input type="password" className="field" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New</label>
            <input type="password" className="field" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">Confirm new</label>
            <input type="password" className="field" required minLength={8} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <button disabled={busy === "password"} className="btn-outline mt-6">
          {busy === "password" ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
