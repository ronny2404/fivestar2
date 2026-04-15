const CACHE_NAME = 'smart-pwa-v1.0.0';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './shared/global.css',
    './shared/auth-check.js',
    './shared/popup.css',
    './shared/popup.js',
    './modules/login_register/login.html',
    './modules/login_register/register.html',
    './modules/login_register/style.css',
    './modules/login_register/script.js',
    './modules/dashboard/dashboard.html',
    './modules/dashboard/dashboard.css',
    './modules/dashboard/dashboard.js'
];

// Install: Simpan semua aset ke cache
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

// Activate: Smart Cache Management (Hapus cache lama)
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )));
});

// Fetch: Offline Mode Strategy (Stale-While-Revalidate)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => {
            const networked = fetch(e.request).then(res => {
                caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
                return res;
            }).catch(() => cached);
            return cached || networked;
        })
    );
});
