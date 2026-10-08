"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

// Search box + optional tab filter, synced to the URL so the server page re-renders.
export default function ListToolbar({ placeholder, tabs, tabKey = "status" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const go = (patch) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  const current = params.get(tabKey) ?? "";

  return (
    <div className="flex flex-col gap-3 border-b border-line p-3 md:flex-row md:items-center md:justify-between">
      {tabs ? (
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {tabs.map(([value, label]) => (
            <button
              key={label}
              onClick={() => go({ [tabKey]: value })}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${current === value ? "bg-olive-800 text-sand" : "text-muted hover:bg-stone-100 hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <span />
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: q.trim() });
        }}
        className="flex h-9 items-center gap-2 rounded-md border border-line px-3 md:w-72"
      >
        <Search className="size-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-sm outline-none" />
      </form>
    </div>
  );
}
