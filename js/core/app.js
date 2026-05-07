// =============================================================================
// js/core/app.js - PUSAT KONTROL FIVE STAR 2 & SISTEM AUTO-UPDATE PWA
// =============================================================================

// ... [KODE BAGIAN 1 (Hapus Loading), 2 (PWA Register), dan 3 (Polisi Absen) TETAP SAMA] ...

// --- TRIGGER UTAMA (TOMBOL ON) UNTUK POLISI ABSEN & NOTIF ---
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        setTimeout(() => {
            jalankanPolisiAbsen(user);
            
            // Minta izin notifikasi dulu, baru jalankan sistem pengingat
            inisialisasiNotifikasi();
        }, 1500); 
    }
});


// --- 4. SISTEM NOTIFIKASI PENGINGAT NATIVE (SMART TRIGGER 09:30) ---
function inisialisasiNotifikasi() {
    if (!("Notification" in window)) {
        console.warn("Browser tidak mendukung notifikasi native.");
        return;
    }

    if (Notification.permission === "granted") {
        jadwalkanNotifikasi();
    } else if (Notification.permission !== "denied") {
        // Minta izin ke user dengan prompt native
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                jadwalkanNotifikasi();
            }
        });
    }
}

function jadwalkanNotifikasi() {
    // Pastikan fungsi cekStatusAbsenLokal ada dan valid
    const sudahAbsenHariIni = typeof cekStatusAbsenLokal === 'function' ? cekStatusAbsenLokal() : false; 
    if (sudahAbsenHariIni) return; // Jika sudah absen, matikan alarm

    const waktuSekarang = new Date();
    const jamTarget = new Date();
    jamTarget.setHours(9, 30, 0, 0); // Set target ke 09:30:00 hari ini

    // Jika saat ini sudah lewat jam 09:30, langsung tembak notifikasi
    if (waktuSekarang >= jamTarget) {
        tembakNotifSekarang();
    } else {
        // Jika belum jam 09:30 (misal buka app jam 08:00), buat timer agar meledak pas jam 09:30
        const sisaWaktuMs = jamTarget.getTime() - waktuSekarang.getTime();
        setTimeout(() => {
            // Cek ulang absen saat timer meledak (siapa tahu user absen jam 09:00)
            const cekLagi = typeof cekStatusAbsenLokal === 'function' ? cekStatusAbsenLokal() : false;
            if (!cekLagi) tembakNotifSekarang();
        }, sisaWaktuMs);
    }
}

function tembakNotifSekarang() {
    const namaPemilik = localStorage.getItem('nama_user') || 'RONNY'; // Fallback ke nama developer jika kosong

    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("FIVE STAR 2 - REMINDER", {
            body: `Halo ${namaPemilik}, sudah jam 09:30 nih. Yuk absen dulu agar rekap kerja tetap sinkron!`,
            icon: "assets/icon-1.png", // Pastikan path icon ini valid di server
            badge: "assets/icon-1.png",
            vibrate: [200, 100, 200, 100, 200],
            tag: "absen-harian", // Tag mencegah notif numpuk berjejer
            renotify: true,
            requireInteraction: true 
        });
    });
}
