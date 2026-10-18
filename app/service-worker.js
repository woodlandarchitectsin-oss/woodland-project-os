/* Woodland Project OS — service worker.
   Caches the app shell so the app opens offline. VERSION is stamped by `npm run stamp` whenever the app files change,
   which makes browsers fetch the new shell and show "New version — tap to refresh". */
const VERSION = "6fb9eb946b";
const SHELL_CACHE = "wpos-shell-" + VERSION;
const FONT_CACHE = "wpos-fonts";
const SHELL = ["./", "index.html", "styles.css", "config.js", "sync.js", "app.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("wpos-shell-") && k !== SHELL_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // fonts: keep a copy so the look survives offline
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONT_CACHE).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }
  if (url.origin !== self.location.origin) return;   // never touch the Google Apps Script API
  // app shell: cached copy first (works with no signal); navigation falls back to the cached page
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).catch(() => (req.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
