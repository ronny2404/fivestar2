// absen.js - Modul Popup Absensi (Safe Navigation & Toast Version)

function bukaMenuAbsen(event, editDate = null, editData = null, isPolisi = false) {
    if(event) event.preventDefault();
    let modal = document.getElementById('absenModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'absenModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '35000'; 
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim">
                <div class="ios-modal-header">
                    <h3 id="judulAbsen">Absensi Harian</h3>
                </div>
                
                <div class="ios-modal-body" style="padding-top: 15px;">
                    <div class="input-group">
                        <label>Tanggal</label>
                        <input type="text" id="inputTanggalAbsen" readonly 
                            style="pointer-events: none; opacity: 0.8; font-weight: bold; text-align: center; background: var(--card-bg); border: none;">
                    </div>

                    <div class="input-group">
                        <label>Lokasi Kantor</label>
                        <div class="grid-picker" id="gridKantorAbsen" style="grid-template-columns: 1fr 1fr;">
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Kantor', 'FIVE STAR 1')">FIVE STAR 1</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Kantor', 'FIVE STAR 2')">FIVE STAR 2</div>
                        </div>
                        <input type="hidden" id="inputKantorAbsen">
                    </div>

                    <div class="input-group">
                        <label>Status Absensi</label>
                        <div class="grid-picker" id="gridStatusAbsen">
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Masuk')">Masuk</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Off')">Off</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Telat')">Telat</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Izin')">Izin</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Sakit')">Sakit</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Alpa')">Alpa</div>
                            <div class="grid-item" style="grid-column: span 3;" onclick="pilihGridAbsen(this, 'Status', 'Cuti')">Cuti</div>
                        </div>
                        <input type="hidden" id="inputStatusAbsen">
                    </div>
                </div>
                
                <div id="footerAbsen" class="ios-modal-footer-grid"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    resetFormAbsen();
    modal.style.display = 'flex';

    // --- LOGIKA TOMBOL DINAMIS ---
    const footer = document.getElementById('footerAbsen');
    if (isPolisi) {
        footer.innerHTML = `
            <button class="btn-batal" onclick="aturNantiSemua()" style="color: #8E8E93 !important;">Atur Nanti</button>
            <button class="btn-simpan" style="background-color: #007AFF !important; color: #FFFFFF !important;" onclick="simpanAbsen(true)">Isi Absen</button>
        `;
    } else {
        footer.innerHTML = `
            <button class="btn-batal" onclick="tutupMenuAbsen()">Batal</button>
            <button class="btn-simpan" style="background-color: #007AFF !important; color: #FFFFFF !important;" onclick="simpanAbsen(false)">Simpan</button>
        `;

        // --- BACK BUTTON HP SUPPORT (LEVEL 2) ---
        // Kita beri level 2 agar tidak bentrok dengan dashboard (0) atau profil (1)
        history.pushState({ id: 'modalAbsen', level: 2 }, '', ''); 
        
        const handlePopstateAbsen = (e) => {
            if (!history.state || history.state.id !== 'modalAbsen') {
                const m = document.getElementById('absenModal');
                if (m) m.style.display = 'none';
                if (typeof renderKalenderAbsen === 'function') renderKalenderAbsen();
                window.removeEventListener('popstate', handlePopstateAbsen);
            }
        };
        window.addEventListener('popstate', handlePopstateAbsen);
    }

    // FIX LOGIKA TANGGAL
    if (editDate) {
        document.getElementById('inputTanggalAbsen').value = editDate;
        document.getElementById('judulAbsen').innerText = isPolisi ? "Lengkapi Absen" : (editData ? "Edit Absensi" : "Input Absensi");

        if (editData) {
            document.querySelectorAll('#gridKantorAbsen .grid-item').forEach(item => {
                if (item.innerText.trim() === editData.kantor) pilihGridAbsen(item, 'Kantor', editData.kantor);
            });
            document.querySelectorAll('#gridStatusAbsen .grid-item').forEach(item => {
                if (item.innerText.trim() === editData.status) pilihGridAbsen(item, 'Status', editData.status);
            });
        }
    } else {
        document.getElementById('judulAbsen').innerText = "Absensi Harian";
        document.getElementById('inputTanggalAbsen').value = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";
        if (typeof applyLastAbsenChoice === 'function') applyLastAbsenChoice();
    }
}

function applyLastAbsenChoice() {
    const lastKantor = localStorage.getItem('last_absen_kantor');
    if (lastKantor) {
        const items = document.querySelectorAll('#gridKantorAbsen .grid-item');
        items.forEach(item => {
            if (item.innerText.trim() === lastKantor) pilihGridAbsen(item, 'Kantor', lastKantor);
        });
    }
}

function pilihGridAbsen(elemen, tipe, nilai) {
    const grup = elemen.parentElement;
    grup.querySelectorAll('.grid-item').forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    
    if (tipe === 'Kantor') {
        document.getElementById('inputKantorAbsen').value = nilai;
        localStorage.setItem('last_absen_kantor', nilai);
    } else {
        document.getElementById('inputStatusAbsen').value = nilai;
    }
}

function tutupMenuAbsen() {
    const modal = document.getElementById('absenModal');
    if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
        
        // Refresh kalender
        if (typeof renderKalenderAbsen === 'function') renderKalenderAbsen();

        // Mundur satu langkah di history untuk hapus state modalAbsen
        if (history.state && history.state.id === 'modalAbsen') {
            history.back(); 
        }
    }
}

function resetFormAbsen() {
    document.getElementById('inputStatusAbsen').value = "";
    document.getElementById('inputKantorAbsen').value = "";
    document.querySelectorAll('.grid-item').forEach(item => item.classList.remove('active'));
}

async function simpanAbsen(isPolisiMode = false) {
    const tglFull = document.getElementById('inputTanggalAbsen').value; 
    const kntr = document.getElementById('inputKantorAbsen').value;
    const status = document.getElementById('inputStatusAbsen').value;
    
    if (!kntr || !status) {
        return IOSAlert.show("Data Kurang", "Pilih Lokasi Kantor dan Status Absensi.");
    }

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;

    const uid = userAuth.uid;
    const tempArr = tglFull.split(', '); 
    const tglMurni = tempArr[1] || tempArr[0]; 
    const parts = tglMurni.split(" ");
    const blnTahunId = parts[1] + "_" + parts[2]; 
    const dateId = tglFull.replace(', ', '_').replace(/\s/g, '_');

    const dataKehadiran = {
        tanggal: tglFull,
        kantor: kntr,
        status: status,
        waktu_input: firebase.firestore.FieldValue.serverTimestamp() 
    };

    const docRef = window.firestore
        .collection('data').doc(uid)
        .collection('absen').doc(blnTahunId)
        .collection(dateId).doc('harian');

    try {
        await docRef.set(dataKehadiran);
        
        // Update LocalStorage
        let localData = JSON.parse(localStorage.getItem('data_absen_current') || "{}");
        localData[dateId] = dataKehadiran;
        localStorage.setItem('data_absen_current', JSON.stringify(localData));

        if (isPolisiMode && window.antrianAbsenBolong && window.antrianAbsenBolong.length > 0) {
            window.antrianAbsenBolong.shift();

            if (window.antrianAbsenBolong.length > 0) {
                // Mode Polisi: Pakai confirm karena harus lanjut ke antrian berikutnya
                IOSAlert.show("Berhasil", "Absen " + tglFull + " tersimpan. Lanjut...", {
                    onConfirm: () => {
                        if (typeof panggilModalAntrean === 'function') panggilModalAntrean();
                    }
                });
            } else {
                IOSAlert.show("Selesai", "Semua absen bolong sudah dilengkapi!", {
                    onConfirm: () => {
                        document.getElementById('absenModal').style.display = 'none';
                        if (typeof renderKalenderAbsen === 'function') renderKalenderAbsen();
                    }
                });
            }
        } else {
            // --- MODE TOAST (NORMAL) ---
            // 1. Munculkan Toast (Hilang sendiri 2 detik)
            IOSAlert.show("Berhasil", "Absen berhasil disimpan!");
            
            // 2. Langsung tutup modal tanpa nunggu toast hilang
            tutupMenuAbsen();
        }
    } catch (e) {
        console.error("Gagal simpan absen:", e);
        IOSAlert.show("Error", "Gagal menyimpan: " + e.message);
    }
}
