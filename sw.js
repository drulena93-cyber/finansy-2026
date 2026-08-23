// Версия кэша — при каждом заметном обновлении сайта увеличивай это число
// (например, было v1, стало v2), чтобы у пользователей не залипала старая версия
const CACHE_VERSION = 'finansy-cache-v47';
const APP_SHELL = ['/', '/index.html'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  // Удаляем все старые версии кэша, чтобы не показывать устаревшую страницу
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Запросы к базе данных никогда не кэшируем — там всегда должны быть свежие данные
  if (req.url.includes('/api/')) return;
  if (req.method !== 'GET') return;

  // Стратегия "сначала сеть": если интернет есть — всегда берём свежую версию
  // и обновляем кэш. Если интернета нет — отдаём последнюю сохранённую копию.
  event.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
  );
});
