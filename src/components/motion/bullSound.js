"use client";

// Bull sound, played when the RAYVE logo is clicked and in the 404 game. Plays /sounds/bull.mp3 (CC0 recording);
// stays silent, and the toggle stays hidden, until that file is added.
const PREF_KEY = "rayve_sound";
const FILE_URL = "/sounds/bull.mp3";
const VOLUME = 0.45;

let ctx = null;
let recording = null; // decoded AudioBuffer once loaded
let lastPlay = 0;
const listeners = new Set();

// ── on/off preference (shared by every component via useSyncExternalStore) ──
export const soundPref = {
  get() {
    try {
      return localStorage.getItem(PREF_KEY) !== "off";
    } catch {
      return true;
    }
  },
  set(on) {
    try {
      localStorage.setItem(PREF_KEY, on ? "on" : "off");
    } catch {}
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

let available; // Promise<boolean>: whether the sound file exists

/** Resolves true when /sounds/bull.mp3 has been added to the site. */
export function hasBullSound() {
  available ??= fetch(FILE_URL, { method: "HEAD", cache: "no-store" })
    .then((res) => res.ok && (res.headers.get("content-type") ?? "").startsWith("audio"))
    .catch(() => false)
    .then((ok) => {
      if (!ok) available = undefined; // check again next time instead of remembering "missing"
      return ok;
    });
  return available;
}

let bytes; // Promise<ArrayBuffer | null>: the file, fetched once

/** Downloads the sound ahead of the first click so it plays without delay. */
export function preloadBullSound() {
  bytes ??= hasBullSound()
    .then((ok) => (ok ? fetch(FILE_URL).then((r) => r.arrayBuffer()) : null))
    .catch(() => null)
    .then((b) => {
      if (!b) bytes = undefined;
      return b;
    });
  return bytes;
}

async function loadRecording(ac) {
  if (recording) return recording;
  const b = await preloadBullSound();
  if (!b) return null;
  try {
    recording = await ac.decodeAudioData(b.slice(0)); // decode a copy so a retry can reuse the bytes
  } catch {}
  return recording;
}


/** Plays the bull sound (needs a prior user gesture, e.g. the click that navigated). */
export async function playBull() {
  if (!soundPref.get()) return;
  const now = performance.now();
  if (now - lastPlay < 700) return; // don't stack on rapid clicks
  lastPlay = now;
  // Create/resume the audio context synchronously, inside the click: Safari and iOS
  // only allow audio to start from a user gesture, and an await before this would lose it.
  const ac = audio();
  if (!ac) return;
  if (!(await hasBullSound())) return;
  const buf = await loadRecording(ac);
  if (!buf) return;
  const out = ac.createGain();
  out.gain.value = VOLUME;
  out.connect(ac.destination);
  const src = ac.createBufferSource();
  src.buffer = buf;
  src.connect(out);
  src.start();
}
