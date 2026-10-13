"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

const DISMISS_KEY = "rayve_admin_install_dismissed";
const noSubscribe = () => () => {};

const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || Boolean(navigator.standalone);
const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};
// iOS Safari has no install prompt, so iPhone/iPad users get the Add to Home Screen steps instead
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * Registers the admin service worker and offers to install RAYVE Admin as an app:
 * a one-tap install where the browser supports it (Chrome, Edge, Android), and instructions on iPhone/iPad.
 */
export default function AdminAppInstall() {
  const [prompt, setPrompt] = useState(null); // the browser's deferred install prompt
  const [closed, setClosed] = useState(false);
  const eligible = useSyncExternalStore(noSubscribe, () => !isInstalled() && !wasDismissed(), () => false);
  const ios = useSyncExternalStore(noSubscribe, isIos, () => false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => {});
    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    const onInstalled = () => setClosed(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setClosed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (closed || !eligible || !(prompt || ios)) return null;
  return (
    <div className="mb-6 flex items-start gap-4 rounded-lg border border-olive-800/20 bg-white p-4 sm:items-center">
      <Image src="/brand/admin-app/icon-192.png" alt="" width={44} height={44} className="shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium text-ink">Install RAYVE Admin</p>
        {ios && !prompt ? (
          <p className="mt-0.5 text-muted">
            Tap <Share className="inline size-3.5 -translate-y-px" /> Share, then <strong className="font-medium text-ink">Add to Home Screen</strong> to open the admin like an app.
          </p>
        ) : (
          <p className="mt-0.5 text-muted">Open orders and the dashboard from your home screen or dock, without the browser.</p>
        )}
      </div>
      {prompt && (
        <button
          onClick={async () => {
            prompt.prompt();
            await prompt.userChoice.catch(() => {});
            setPrompt(null);
            setClosed(true);
          }}
          className="flex shrink-0 items-center gap-2 rounded-md bg-olive-800 px-3 py-2 text-xs font-medium text-sand hover:bg-olive-950"
        >
          <Download className="size-3.5" /> Install
        </button>
      )}
      <button onClick={dismiss} className="shrink-0 text-muted hover:text-ink" aria-label="Dismiss">
        <X className="size-4" />
      </button>
    </div>
  );
}
