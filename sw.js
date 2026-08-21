/* 우유 배달 앱 - 오프라인 캐시
   앱 파일을 통째로 캐시해서 인터넷 없이도 열리게 합니다.
   내용을 고쳤으면 아래 CACHE 이름의 숫자를 올리세요. (예: v1 -> v2) */
const CACHE = 'milk-v28';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(
      FILES.map(f => c.add(f).catch(() => {}))   // 파일 하나가 없어도 설치 실패하지 않게
    ))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* network-first: 인터넷이 되면 최신 파일, 안 되면 캐시 */
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !r.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(r, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(r).then(hit => hit || caches.match('./index.html')))
  );
});
