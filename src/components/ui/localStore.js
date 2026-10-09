"use client";

import { useSyncExternalStore } from "react";

const EMPTY = [];

// A tiny localStorage-backed list store shared across tabs, read via useSyncExternalStore.
export function createLocalStore(key) {
  const listeners = new Set();
  let cache = null;

  const load = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const store = {
    get() {
      if (cache === null) cache = load();
      return cache;
    },
    set(next) {
      cache = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (e) => {
        if (e.key === key) {
          cache = load();
          listener();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
  return store;
}

export function useLocalStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, () => EMPTY);
}
