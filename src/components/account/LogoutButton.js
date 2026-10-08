"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  };
  return (
    <button onClick={logout} className={`flex items-center gap-3 ${className}`}>
      <LogOut className="size-4" strokeWidth={1.5} /> Sign out
    </button>
  );
}
