"use client";

import { createLocalStore, useLocalStore } from "@/components/ui/localStore";

// Up to three frames picked for side-by-side comparison (product ids, kept in this browser)
export const COMPARE_MAX = 3;
const compareStore = createLocalStore("rayve_compare_v1");

export function useCompare() {
  const ids = useLocalStore(compareStore);
  const has = (id) => ids.includes(id);
  const toggle = (id) => {
    const current = compareStore.get();
    if (current.includes(id)) compareStore.set(current.filter((x) => x !== id));
    else compareStore.set([...current, id].slice(-COMPARE_MAX)); // adding a 4th drops the oldest
  };
  const clear = () => compareStore.set([]);
  return { ids, has, toggle, clear };
}
