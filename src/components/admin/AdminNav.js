"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Store, Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/account/LogoutButton";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/customers", label: "Customers", Icon: Users },
];

export default function AdminNav({ user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <>
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/admin" className="text-sand" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <button className="text-sand/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <p className="px-6 pb-3 pt-4 text-[10px] uppercase tracking-[0.25em] text-sand/40">Manage</p>
      <nav className="flex flex-col gap-0.5 px-3">
        {LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active(href) ? "bg-sand/10 text-sand" : "text-sand/60 hover:bg-sand/5 hover:text-sand"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.75} /> {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-sand/10 p-3">
        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sand/60 hover:bg-sand/5 hover:text-sand">
          <Store className="size-4" strokeWidth={1.75} /> View store
        </Link>
        <LogoutButton className="w-full rounded-md px-3 py-2.5 text-sm text-sand/60 hover:bg-sand/5 hover:text-sand" />
        <div className="px-3 pt-3 text-xs text-sand/40">
          Signed in as <span className="text-sand/70">{user.name}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-olive-950 px-4 text-sand lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <Logo />
        <span className="w-5" />
      </div>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-olive-950 lg:flex">{nav}</aside>
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute inset-y-0 left-0 flex w-64 flex-col bg-olive-950 transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
          {nav}
        </aside>
      </div>
    </>
  );
}
