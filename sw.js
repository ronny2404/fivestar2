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
    event.notification.close(); // Tutup bar notifikasi

    let targetUrl = 'index.html';
    if (event.action === 'buka-absen') {
        targetUrl = 'index.html?action=absen';
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // 1. Cek apakah aplikasi sudah terbuka (baik di background maupun sedang ditatap)
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                
                // Jika aplikasi terdeteksi, JANGAN buka window baru, cukup "bangunkan" (focus)
                if (client.url && 'focus' in client) {
                    client.focus();
                    
                    // Jika user sudah berada di area dashboard, tembak sinyal absen tanpa reload
                    if (client.url.includes('dashboard.html')) {
                        if (event.action === 'buka-absen') {
                            client.postMessage({ perintah: 'TRIGGER_ABSEN' });
                        }
                    } else {
                        // Jika posisinya di halaman login, arahkan navigasinya ke dashboard
                        client.navigate(targetUrl);
                    }
                    return; // KUNCI ANTI KEDIP: Hentikan kode di sini agar tidak memicu openWindow
                }
            }
            
            // 2. Jika aplikasi benar-benar mati (di-kill/di-swipe up), barulah buka jendela baru
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
