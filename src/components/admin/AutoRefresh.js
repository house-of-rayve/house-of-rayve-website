"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-renders the current server page whenever the live stream reports a change.
export default function AutoRefresh({ events = ["order:created", "order:updated", "customer:created", "customer:updated"] }) {
  const router = useRouter();
  const key = events.join(",");
  useEffect(() => {
    const types = key.split(",");
    const es = new EventSource("/api/admin/stream");
    es.addEventListener("activity", (e) => {
      if (types.includes(JSON.parse(e.data).type)) router.refresh();
    });
    return () => es.close();
  }, [key, router]);
  return null;
}
