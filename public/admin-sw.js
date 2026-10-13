// Service worker for the RAYVE Admin app (registered with scope /admin only).
// Admin data is live and private, so nothing is cached: pages always come from the network,
// and a simple offline screen is shown only when there's no connection.
const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline · RAYVE Admin</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#22221a;color:#e9e2d0;font:15px/1.5 system-ui,sans-serif;text-align:center;padding:24px}
h1{font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:#a69f4e;margin:0 0 12px}button{margin-top:20px;background:#e9e2d0;color:#22221a;border:0;padding:12px 22px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer}</style></head>
<body><div><h1>RAYVE Admin</h1><p>You're offline. Orders and stock need a connection — reconnect and try again.</p><button onclick="location.reload()">Retry</button></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return; // let the browser handle data, scripts and images as usual
  event.respondWith(
    fetch(event.request).catch(() => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })),
  );
});
