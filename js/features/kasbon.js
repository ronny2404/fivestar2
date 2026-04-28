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
                    <h3>INPUT KASBON</h3>
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
                            <div class="grid-item" onclick="pilihGridKasbon(this, 'KANTOR')">PAKET</div>
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

    // --- LOGIKA TOMBOL BACK HP (SISTEM LEVELING SINKRON) ---
    // Menetapkan kasbon.js sebagai pondasi level (Level 1)
    const baseLvl = (history.state && history.state.level) ? history.state.level : 0;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'modalKasbon', level: myLvl, rootModal: 'modalKasbon' }, '', ''); 
    
    window.handleBackKasbon = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        // Hanya tutup modal kasbon jika history mundur ke bawah level pondasinya
        if (currentLvl < myLvl) {
            const m = document.getElementById('kasbonIosModal');
            if (m) m.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackKasbon);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackKasbon);
    window.addEventListener('popstate', window.handleBackKasbon);
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
    if (modal) {
        modal.style.display = 'none';
        
        // Memastikan history.back terpanggil dengan bersih saat ditutup manual
        if (history.state && history.state.id === 'modalKasbon') {
            history.back(); 
        }
        window.removeEventListener('popstate', window.handleBackKasbon);
    }
}

// --- LOGIKA SIMPAN (FIRESTORE + TIMESTAMP ID) ---
async function simpanDataKasbon() {
    const jenis = document.getElementById('jenisKasbon').value;
    const jumlah = document.getElementById('jumlahKasbon').value;
    const tglFull = document.getElementById('tglKasbon').value; 
    const ket = document.getElementById('ketKasbon').value;

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    if (!jenis) {
        IOSAlert.show("Pilihan Kosong", "Silakan pilih Jenis Kasbon (Kantor/Paket).");
        return;
    }
    if (!jumlah || jumlah <= 0) {
        IOSAlert.show("Nominal Salah", "Harap isi jumlah kasbon dengan benar.");
        return;
    }

    const uid = userAuth.uid;

    const tempArr = tglFull.split(', '); 
    const tglMurni = tempArr[1] || tempArr[0]; 
    const parts = tglMurni.split(" ");
    const blnTahunId = parts[1] + "_" + parts[2]; 

    const dateId = tglFull.replace(', ', '_').replace(/\s/g, '_');
    const customID = `FS2${Date.now()}`;
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
        const docRef = window.firestore
            .collection('data').doc(uid)
            .collection('kasbon').doc(blnTahunId) 
            .collection(dateId).doc(customID);   

        try {
            await docRef.set(dataKasbon);
            IOSAlert.show("Berhasil", "Kasbon Rp " + nominalBersih.toLocaleString() + " tersimpan!");
    
            if (typeof resetFormKasbon === 'function') resetFormKasbon();

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
