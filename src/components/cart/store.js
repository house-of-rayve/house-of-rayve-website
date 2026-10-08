// Tiny localStorage-backed cart store, read through useSyncExternalStore.
const KEY = "rayve_cart_v1";
const EMPTY = [];
const listeners = new Set();
let cache = null;

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSnapshot() {
  if (cache === null) cache = load();
  return cache;
}

export function getServerSnapshot() {
  return EMPTY;
}

export function setItems(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === KEY) {
      cache = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
