// =============================================================================
// js/core/app.js - PUSAT KONTROL FIVE STAR 2 & SISTEM AUTO-UPDATE PWA
// Dikembangkan oleh: RONNY (2026)
// =============================================================================

let newWorker; // Menyimpan service worker yang baru di-download

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PENGHANCUR LOADING BAWAAN HTML ---
    function hapusLoadingLayar() {
        const loadingEl = document.getElementById('splashScreen');
        if (loadingEl) {
            loadingEl.style.transition = "opacity 0.3s ease";
            loadingEl.style.opacity = "0";
            setTimeout(() => { loadingEl.style.display = 'none'; }, 300);
        }
    }
    hapusLoadingLayar();

    // --- 2. SISTEM AUTO-UPDATE MURNI DARI SERVICE WORKER (PWA) ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(reg => {
            // Deteksi jika ada file sw.js baru yang ditemukan di server
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;
                
                newWorker.addEventListener('statechange', () => {
                    // Jika SW baru selesai di-download dan menunggu diaktifkan
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        tampilkanPopupUpdatePWA();
                    }
                });
            });
        }).catch(err => console.log("SW Register Error:", err));

        // Deteksi jika Service Worker baru mengambil alih, lalu Refresh Halaman otomatis
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                window.location.reload();
                refreshing = true;
            }
        });
    }
});

// --- TRIGGER UTAMA (TOMBOL ON) UNTUK POLISI ABSEN & NOTIF ---
// Menunggu Firebase Auth siap, lalu jalankan fungsi background
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Beri jeda 1.5 detik agar semua file script (absen.js dll) & DOM selesai dimuat
        setTimeout(() => {
            jalankanPolisiAbsen(user);
            tampilkanNotifNative();
        }, 1500); 
    }
});


// --- UI POP-UP WAJIB UPDATE (Tampilan Premium) ---
function tampilkanPopupUpdatePWA() {
    let updateModal = document.getElementById('forceUpdateModal');
    if (!updateModal) {
        // Injeksi keyframe untuk animasi popup jika belum ada
        if (!document.getElementById('anim-popup-update')) {
            const style = document.createElement('style');
            style.id = 'anim-popup-update';
            style.innerHTML = `@keyframes popUpdate { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`;
            document.head.appendChild(style);
        }

        updateModal = document.createElement('div');
        updateModal.id = 'forceUpdateModal';
        updateModal.className = 'ios-overlay';
        updateModal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.8); z-index: 99999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`;
        
        updateModal.innerHTML = `
            <div style="width: 300px; background: var(--card-bg, #ffffff); border-radius: 18px; padding: 25px 20px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); animation: popUpdate 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
                <div style="width: 60px; height: 60px; background: rgba(0, 122, 255, 0.1); color: #007AFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; font-size: 28px;">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </div>
                <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: var(--text-primary, #000);">Pembaruan Tersedia</h3>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #8E8E93; line-height: 1.4;">Ada fitur baru dan perbaikan sistem. Silakan perbarui aplikasi sekarang.</p>
                <button onclick="eksekusiUpdatePWA()" style="width: 100%; background: #007AFF; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-download"></i> Perbarui Sekarang
                </button>
            </div>
        `;
        document.body.appendChild(updateModal);
    }
}

// Fungsi eksekusi tombol Update
function eksekusiUpdatePWA() {
    const btn = document.querySelector('#forceUpdateModal button');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memperbarui Sistem...';

    // Kirim pesan ke sw.js untuk skip waiting (mengaktifkan versi baru)
    if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
    }
}


// --- 3. PATROLI POLISI ABSEN ---
window.antrianAbsenBolong = [];
async function jalankanPolisiAbsen(user) {
    const tglDaftar = new Date(user.metadata.creationTime);
    tglDaftar.setHours(0, 0, 0, 0);

    const listPromises = [];
    const daftarTglLengkap = [];
    const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const waktuSekarang = new Date();

    for (let i = 7; i >= 0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        if (d < tglDaftar) continue;

        if (i === 0) { 
            const jam = waktuSekarang.getHours();
            const menit = waktuSekarang.getMinutes();
            if (jam < 9 || (jam === 9 && menit < 30)) continue; 
        }

        const tglFullStr = d.toLocaleDateString('id-ID', opsi); 
        const temp = tglFullStr.split(', ');
        const parts = temp[1].split(" ");
        const blnTahunId = parts[1] + "_" + parts[2]; 
        const dateId = tglFullStr.replace(', ', '_').replace(/\s/g, '_'); 

        daftarTglLengkap.push(tglFullStr);
        listPromises.push(window.firestore.collection('data').doc(user.uid).collection('absen').doc(blnTahunId).collection(dateId).doc('harian').get());
    }

    if (listPromises.length === 0) return;

    try {
        const snapshots = await Promise.all(listPromises);
        window.antrianAbsenBolong = [];
        snapshots.forEach((doc, index) => {
            if (!doc.exists) window.antrianAbsenBolong.push(daftarTglLengkap[index]);
        });

        if (window.antrianAbsenBolong.length > 0) panggilModalAntrean();
    } catch (e) { console.error("Polisi Gagal Patroli:", e); }
}

function panggilModalAntrean() {
    if (window.antrianAbsenBolong.length > 0) {
        // Cek apakah absen.js sudah ter-load dengan benar
        if (typeof window.bukaMenuAbsen === 'function') {
            window.bukaMenuAbsen(null, window.antrianAbsenBolong[0], null, true); 
        } else {
            console.error("Fungsi window.bukaMenuAbsen tidak ditemukan! Pastikan absen.js sudah dimuat.");
        }
    }
}

window.aturNantiSemua = function() {
    window.antrianAbsenBolong = []; 
    const modal = document.getElementById('absenModal'); 
    if (modal) modal.style.display = 'none'; 
    if (typeof IOSAlert !== 'undefined') {
        IOSAlert.show("Peringatan", "Absenmu masih ada yang bolong. Jangan lupa dilengkapi nanti ya!");
    }
};


// --- 4. NOTIFIKASI PENGINGAT NATIVE (JAM 09:30) ---
function tampilkanNotifNative() {
    const sudahAbsenHariIni = typeof cekStatusAbsenLokal === 'function' ? cekStatusAbsenLokal() : false; 
    if (sudahAbsenHariIni) return;

    const namaPemilik = localStorage.getItem('nama_user') || 'Rekan Five Star';

    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification("FIVE STAR 2 - REMINDER", {
                body: `Halo ${namaPemilik}, sudah jam 09:30 nih. Yuk absen dulu agar data tetap sinkron!`,
                icon: "assets/icon-192.png",
                badge: "assets/icon-192.png",
                vibrate: [200, 100, 200, 100, 200],
                tag: "absen-harian",
                requireInteraction: true 
            });
        });
    }
}
