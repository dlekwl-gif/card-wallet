// 버전을 올리면 옛 캐시가 지워지고 새 파일로 교체됨
const VERSION = "2026-10-26a";
const CACHE = "card-wallet-" + VERSION;
const FILES = ["./", "./index.html", "./manifest.json", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 화면(HTML)은 인터넷 먼저 → 실패하면 저장본. 그래서 혜택을 고치면 온라인일 때 바로 반영됨
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === "navigate" || req.url.endsWith(".html");
  if (isPage) {
    e.respondWith(
      fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return r; })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
