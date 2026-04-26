// kasbon.js - Modul Kasbon (Firestore Architecture & Timestamp ID)

function bukaMenuKasbon(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kasbonIosModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kasbonIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '21000';
        
        // Ambil tanggal hari ini dari sistem main.js
        const tglDefault = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";

        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim">
                <div class="ios-modal-header">
                    <h3>Input Kasbon</h3>
                </div>
                <div class="ios-modal-body">
                    <div class="input-group">
                        <label>Tanggal Kasbon</label>
                        <input type="text" id="tglKasbon" readonly 
                               value="${tglDefault}" 
                               onclick="bukaKalenderVisual('tglKasbon')" placeholder="Pilih Tanggal..."
                               style="cursor: pointer; font-weight: 600; text-align: center;">
                    </div>
                    
                    <div class="input-group">
                        <label>Jenis Kasbon</label>
                        <div class="grid-picker" style="grid-template-columns: 1fr 1fr;">
                            <div class="grid-item" onclick="pilihGridKasbon(this, 'KANTOR')">KANTOR</div>
                            <div class="grid-item" onclick="pilihGridKasbon(this, 'PAKET')">PAKET</div>
                        </div>
                        <input type="hidden" id="jenisKasbon">
                    </div>

                    <div class="input-group">
                        <label>Jumlah (Rp)</label>
                        <input type="number" id="jumlahKasbon" placeholder="Contoh: 50000" inputmode="numeric" class="custom-box-input">
                    </div>

                    <div class="input-group">
                        <label>Keterangan</label>
                        <textarea id="ketKasbon" placeholder="Catatan tambahan (opsional)..." style="resize:none;"></textarea>
                    </div>
                </div>
                <div class="ios-modal-footer-grid">
                    <button class="btn-batal" onclick="tutupPopupKasbon()">Batal</button>
                    <button class="btn-simpan" onclick="simpanDataKasbon()">Simpan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
}

function pilihGridKasbon(elemen, nilai) {
    const grup = elemen.parentElement;
    const items = grup.querySelectorAll('.grid-item');
    items.forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    document.getElementById('jenisKasbon').value = nilai;
}

function tutupPopupKasbon() {
    const modal = document.getElementById('kasbonIosModal');
    if (modal) modal.style.display = 'none';
}

// --- LOGIKA SIMPAN (FIRESTORE + TIMESTAMP ID) ---
async function simpanDataKasbon() {
    const jenis = document.getElementById('jenisKasbon').value;
    const jumlah = document.getElementById('jumlahKasbon').value;
    const tglFull = document.getElementById('tglKasbon').value; // Contoh: "Minggu, 26 April 2026"
    const ket = document.getElementById('ketKasbon').value;

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    // Validasi input
    if (!jenis) {
        IOSAlert.show("Pilihan Kosong", "Silakan pilih Jenis Kasbon (Kantor/Paket).");
        return;
    }
    if (!jumlah || jumlah <= 0) {
        IOSAlert.show("Nominal Salah", "Harap isi jumlah kasbon dengan benar.");
        return;
    }

    const uid = userAuth.uid;

    // --- 1. LOGIKA PATH FIRESTORE (DOKUMEN=BULAN, KOLEKSI=HARI) ---
    // Pecah untuk mengambil Bulan_Tahun saja untuk nama DOCUMENT
    const tempArr = tglFull.split(', '); 
    const tglMurni = tempArr[1] || tempArr[0]; // Ambil "26 April 2026"
    const parts = tglMurni.split(" ");
    const blnTahunId = parts[1] + "_" + parts[2]; // Hasil: "April_2026"

    // Buat ID Koleksi dengan format: "Minggu_26_April_2026"
    const dateId = tglFull.replace(', ', '_').replace(/\s/g, '_');

    // --- 2. PEMBUATAN ID UNIK BERBASIS TIMESTAMP ---
    const customID = `FS2${Date.now()}`;

    // Bersihkan jumlah dari karakter non-angka jika ada
    const nominalBersih = parseInt(String(jumlah).replace(/[^0-9]/g, ''));

    const dataKasbon = {
        id_kasbon: customID,
        tanggal: tglFull,
        jenis: jenis,
        jumlah: nominalBersih,
        keterangan: ket,
        waktu_input: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (window.firestore) {
        // Struktur Jalur: data > UID > kasbon > April_2026 > Minggu_26_April_2026 > customID
        const docRef = window.firestore
            .collection('data').doc(uid)
            .collection('kasbon').doc(blnTahunId) // Folder Bulan
            .collection(dateId).doc(customID);   // Folder Hari & Data unik

        try {
            await docRef.set(dataKasbon);
            
            IOSAlert.show("Berhasil", "Kasbon Rp " + nominalBersih.toLocaleString() + " tersimpan!", {
                teksTombol: "Mantap",
                onConfirm: () => {
                    if (typeof resetFormKasbon === 'function') resetFormKasbon();
                    if (typeof tutupPopupKasbon === 'function') tutupPopupKasbon();
                }
            });
        } catch (e) {
            console.error(e);
            IOSAlert.show("Gagal", "Error Firestore: " + e.message);
        }
    } else {
        IOSAlert.show("Error", "Sistem Database belum siap.");
    }
}

function resetFormKasbon() {
    const inputJml = document.getElementById('jumlahKasbon');
    const inputKet = document.getElementById('ketKasbon');
    const inputJenis = document.getElementById('jenisKasbon');
    
    if(inputJml) inputJml.value = '';
    if(inputKet) inputKet.value = '';
    if(inputJenis) inputJenis.value = '';
    
    const items = document.querySelectorAll('#kasbonIosModal .grid-item');
    items.forEach(item => item.classList.remove('active'));
}
