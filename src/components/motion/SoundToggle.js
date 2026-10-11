"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundPref, playBull, preloadBullSound } from "./bullSound";

export default function SoundToggle({ className = "", withLabel = false }) {
  const on = useSyncExternalStore(soundPref.subscribe, soundPref.get, () => true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    preloadBullSound().then((b) => setReady(Boolean(b)));
  }, []);
  if (!ready) return null; // no sound file yet, nothing to toggle
  const Icon = on ? Volume2 : VolumeX;
  return (
    <button
      type="button"
      onClick={() => {
        soundPref.set(!on);
        if (!on) playBull(); // preview when turning it back on
      }}
      className={className}
      aria-pressed={on}
      aria-label={on ? "Turn sound off" : "Turn sound on"}
      title={on ? "Sound on" : "Sound off"}
    >
      <Icon className="size-[18px]" strokeWidth={1.5} />
      {withLabel && <span>{on ? "Sound on" : "Sound off"}</span>}
    </button>
  );
}
