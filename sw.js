// sw.js

// SETIAP KALI UPDATE SKRIP, GANTI ANGKA DI BAWAH (misal 1.1 ke 1.2)
const VERSION = '1.7'; 
const CACHE_NAME = `fs2-cache-${VERSION}`;

// 1. Proses Install
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Paksa versi baru langsung standby
    console.log(`SW: Versi ${VERSION} terpasang`);
});

// 2. Proses Aktivasi & Pembersihan Cache Lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Menghapus Cache Lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. Menangkap Perintah dari UI
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// 4. Pengaturan Fetch (Agar aplikasi kencang)
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});

// Listener ketika notifikasi atau tombol action di-klik oleh user
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Tutup bar notifikasi di HP

    // Tentukan URL tujuan
    let targetUrl = 'index.html';
    
    // Jika tombol "Absen Sekarang" ditekan, tambahkan kode rahasia di URL
    if (event.action === 'buka-absen') {
        targetUrl = 'index.html?action=absen';
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                // Jika aplikasi sudah terbuka di tab/background, fokuskan ke sana
                if (client.url.includes('index.html') && 'focus' in client) {
                    client.focus();
                    // Kirim pesan tak terlihat ke app.js untuk segera buka modal absen
                    if (event.action === 'buka-absen') {
                        client.postMessage({ perintah: 'TRIGGER_ABSEN' });
                    }
                    return;
                }
            }
            // Jika aplikasi dalam keadaan tertutup (di-kill), buka baru dengan URL khusus
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
