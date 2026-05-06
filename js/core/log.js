// log.js - Auto-Detect Version dari sw.js (Versi Malas Nulis Log)

document.addEventListener("DOMContentLoaded", () => {
    // Beri jeda 1.5 detik agar tidak mengganggu loading awal aplikasi
    setTimeout(cekPembaruanDariSW, 1500); 
});

async function cekPembaruanDariSW() {
    try {
        // 1. Fetch sw.js (tambahkan timestamp agar selalu baca yang paling baru)
        const responseSW = await fetch('sw.js?t=' + new Date().getTime());
        if (!responseSW.ok) return;
        const swText = await responseSW.text();

        // 2. DETEKSI OTOMATIS VERSI DARI sw.js
        // Mencari teks seperti: const CACHE_NAME = "fivestar-v1.2"; atau const VERSION = '1.0';
        const match = swText.match(/(?:CACHE_NAME|version|VERSION)\s*=\s*['"](?:.*?-v|v|version-)?([0-9.]+)['"]/i);
        
        if (!match) {
            console.warn("log.js: Angka versi tidak ditemukan di sw.js");
            return; // Berhenti jika tidak ketemu format versi di sw.js
        }

        const versiTerbaru = match[1]; // Hasilnya misal: "1.2" atau "1.0.5"
        const versiDilihat = localStorage.getItem('hide_log_version');

        // 3. JIKA VERSI BERBEDA (Atau belum pernah klik Jangan Tampilkan Lagi), Tampilkan Popup
        if (versiTerbaru !== versiDilihat) {
            tampilkanLogOtomatis(versiTerbaru);
        }

    } catch (e) {
        console.error("Gagal mengecek sw.js untuk update log:", e);
    }
}

async function tampilkanLogOtomatis(versiBaru) {
    // TEKS OTOMATIS: Jika kamu malas bikin/nulis log.txt, ini yang akan muncul.
    let teksLog = `Aplikasi FIVE STAR 2 telah diperbarui ke sistem terbaru.\n\n✨ Apa yang baru:\n- Sinkronisasi data yang lebih cepat.\n- Perbaikan bug dan peningkatan kestabilan UI.\n- Pembaruan rutin fitur background.`;
    
    try {
        // Coba baca log.txt, siapa tahu kamu lagi rajin nulis perubahan
        const respLog = await fetch('log.txt?t=' + new Date().getTime());
        if (respLog.ok) {
            const fetchedLog = await respLog.text();
            // Jika log.txt tidak kosong, gunakan isi log.txt
            if (fetchedLog.trim().length > 0) {
                teksLog = fetchedLog;
            }
        }
    } catch(e) {
        // Abaikan error jika file log.txt memang tidak ada
    }

    // --- RENDER MODAL POPUP ---
    let modal = document.getElementById('updateLogModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'updateLogModal';
    modal.className = 'ios-overlay'; 
    modal.style.zIndex = '50000'; // Selalu tampil paling atas
    
    modal.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; max-height: 85vh; display: flex; flex-direction: column; background: var(--card-bg); border-radius: 16px; overflow: hidden;">
            
            <div class="ios-modal-header" style="padding: 15px; text-align: center; border-bottom: 0.5px solid rgba(142,142,147,0.3); flex-shrink: 0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--text-primary);">🚀 Update Versi ${versiBaru}</h3>
            </div>
            
            <div class="ios-modal-body" style="padding: 18px 15px; overflow-y: auto; text-align: left; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: var(--text-primary); flex-grow: 1;">${teksLog}</div>
            
            <div style="padding: 15px; display: flex; flex-direction: column; gap: 10px; border-top: 0.5px solid rgba(142,142,147,0.3); flex-shrink: 0;">
                <button onclick="tutupLogPilihan(true, '${versiBaru}')" style="width: 100%; padding: 14px; border-radius: 12px; background: #007AFF; color: white; border: none; font-size: 15px; font-weight: 700; cursor: pointer;">Jangan Tampilkan Lagi</button>
                <button onclick="tutupLogPilihan(false, '${versiBaru}')" style="width: 100%; padding: 14px; border-radius: 12px; background: rgba(142,142,147,0.15); color: var(--text-primary); border: none; font-size: 15px; font-weight: 600; cursor: pointer;">Tutup</button>
            </div>
            
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

window.tutupLogPilihan = function(janganTampilLagi, versiBaru) {
    if (janganTampilLagi) {
        // Jika pilih Jangan Tampilkan, simpan versi terbarunya ke HP.
        // Nanti saat cek kondisi (versiTerbaru !== versiDilihat) hasilnya False, jadi tidak muncul lagi.
        localStorage.setItem('hide_log_version', versiBaru);
    }
    // Jika pilih Tutup Sementara, biarkan localStorage kosong. Besok akan muncul lagi.
    
    const modal = document.getElementById('updateLogModal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove(); // Bersihkan HTML dari DOM
    }
}
