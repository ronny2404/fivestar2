// kerja.js - Modul Input Pekerjaan (UID Root Architecture & Grouped by Date)

function bukaMenuKerja(event) {
    if (event) event.preventDefault();
    let modal = document.getElementById('kerjaIosModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kerjaIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '21000';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim">
                <div class="ios-modal-header">
                    <h3>INPUT PEKERJAAN</h3>
                </div>
                <div class="ios-modal-body">
                    <div class="input-group">
                        <label>Tanggal Kerja</label>
                        <input type="text" id="tglKerja" readonly 
                               onclick="bukaKalenderVisual('tglKerja')" placeholder="Pilih Tanggal..."
                               style="cursor: pointer; font-weight: 600; text-align: center;">
                    </div>
                    
                    <div class="input-group">
                        <label>Lokasi Kantor</label>
                        <div class="grid-picker" id="gridKantorKerja" style="grid-template-columns: 1fr 1fr;">
                            <div class="grid-item" onclick="pilihGridKerja(this, 'kantor', 'FIVE STAR 1')">FIVE STAR 1</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'kantor', 'FIVE STAR 2')">FIVE STAR 2</div>
                        </div>
                        <input type="hidden" id="lokasiKantor">
                    </div>

                    <div class="input-group">
                        <label>Jenis Treatment</label>
                        <div class="grid-picker" id="gridTreatmentKerja">
                            <div class="grid-item" onclick="pilihGridKerja(this, 'treatment', 'MASSAGE')">MASSAGE</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'treatment', 'REFLEXY')">REFLEXY</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'treatment', 'KOMBINASI')">KOMBINASI</div>
                        </div>
                        <input type="hidden" id="jenisTreatment">
                    </div>

                    <div class="input-group">
                        <label>Durasi Jam</label>
                        <div class="grid-picker" id="gridDurasiKerja" style="grid-template-columns: repeat(4, 1fr);">
                            <div class="grid-item" id="durasi05" onclick="pilihGridKerja(this, 'durasi', '0.5')">½</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '1')">1</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '1.5')">1.5</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '2')">2</div>
                        </div>
                        <input type="hidden" id="durasiJam">
                    </div>

                    <div class="input-group">
                        <label>Keterangan</label>
                        <textarea id="ketKerja" placeholder="Catatan tambahan (opsional)..." style="resize:none;"></textarea>
                    </div>
                </div>
                
                <div class="ios-modal-footer-grid">
                    <button class="btn-batal" onclick="tutupPopupKerja()">Tutup</button>
                    <button class="btn-simpan" onclick="simpanDataKerja()">Simpan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('tglKerja').value = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";
    
    modal.style.display = 'flex';
    if (typeof applyLastChoiceKerja === 'function') applyLastChoiceKerja(); 

    // --- LOGIKA TOMBOL BACK HP (SISTEM LEVELING SINKRON DENGAN MAIN.JS) ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 0;
    const myLvl = baseLvl + 1; // Menetapkan kerja.js sebagai pondasi level
    history.pushState({ id: 'modalKerja', level: myLvl }, '', ''); 
    
    window.handleBackKerja = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        // Hanya tutup modal kerja jika history mundur ke bawah level pondasinya
        if (currentLvl < myLvl) {
            const m = document.getElementById('kerjaIosModal');
            if (m) m.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackKerja);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackKerja);
    window.addEventListener('popstate', window.handleBackKerja);
}

function applyLastChoiceKerja() {
    const lastKantor = localStorage.getItem('last_kerja_kantor');
    if (lastKantor) {
        const items = document.querySelectorAll('#gridKantorKerja .grid-item');
        items.forEach(item => {
            if (item.innerText.trim() === lastKantor) {
                pilihGridKerja(item, 'kantor', lastKantor);
            }
        });
    }
}

function pilihGridKerja(elemen, kategori, nilai) {
    const parent = elemen.parentElement;
    const items = parent.querySelectorAll('.grid-item');
    
    if (kategori === 'treatment') {
        const itemSetengah = document.getElementById('durasi05');
        if (nilai === 'KOMBINASI') {
            itemSetengah.style.opacity = '0.3';
            itemSetengah.style.pointerEvents = 'none';
            itemSetengah.classList.remove('active');
            if (document.getElementById('durasiJam').value === '0.5') {
                document.getElementById('durasiJam').value = '';
            }
        } else {
            itemSetengah.style.opacity = '1';
            itemSetengah.style.pointerEvents = 'auto';
        }
    }

    items.forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    
    if (kategori === 'kantor') document.getElementById('lokasiKantor').value = nilai;
    if (kategori === 'treatment') document.getElementById('jenisTreatment').value = nilai;
    if (kategori === 'durasi') document.getElementById('durasiJam').value = nilai;
}

// --- LOGIKA SIMPAN (STRUKTUR: UID / data / Bulan_Tahun / kerja / tanggal / [Push ID]) ---
async function simpanDataKerja() {
    const treatment = document.getElementById('jenisTreatment').value;
    const durasi = document.getElementById('durasiJam').value;
    const kantor = document.getElementById('lokasiKantor').value;
    const tanggalFull = document.getElementById('tglKerja').value; 

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    if (!kantor || !treatment || !durasi) {
        return IOSAlert.show("Data Kurang", "Pilih Kantor, Treatment, dan Durasi.");
    }

    const uid = userAuth.uid;

    const kodeKntr = kantor === "FIVE STAR 1" ? "FS1" : "FS2";
    const customID = `${kodeKntr}${Date.now()}`;

    const tempArr = tanggalFull.split(', '); 
    const tglMurni = tempArr[1] || tempArr[0]; 
    const parts = tglMurni.split(" ");
    
    const blnTahunId = parts[1] + "_" + parts[2]; 
    const dateId = tanggalFull.replace(', ', '_').replace(/\s/g, '_');

    localStorage.setItem('last_kerja_tgl', tanggalFull);
    localStorage.setItem('last_kerja_kantor', kantor);

    let data = {
        id_transaksi: customID,
        tanggal: tanggalFull,
        kantor: kantor,
        treatment: treatment,
        durasi: parseFloat(durasi),
        keterangan: document.getElementById('ketKerja').value,
        waktu_input: firebase.firestore.FieldValue.serverTimestamp(), 
        detail_jam: { massage: 0, reflexy: 0 }
    };

    const durasiNum = parseFloat(durasi);
    if (treatment === 'KOMBINASI') {
        if (durasiNum === 1) { data.detail_jam.massage = 0.5; data.detail_jam.reflexy = 0.5; }
        else if (durasiNum === 1.5) { data.detail_jam.massage = 1.0; data.detail_jam.reflexy = 0.5; }
        else if (durasiNum === 2) { data.detail_jam.massage = 1.0; data.detail_jam.reflexy = 1.0; }
        else { data.detail_jam.massage = durasiNum / 2; data.detail_jam.reflexy = durasiNum / 2; }
    } else if (treatment === 'MASSAGE') {
        data.detail_jam.massage = durasiNum;
    } else {
        data.detail_jam.reflexy = durasiNum;
    }

    if (window.firestore) {
        const docRef = window.firestore
            .collection('data').doc(uid)
            .collection('kerja').doc(blnTahunId) 
            .collection(dateId).doc(customID);   

        try {
            await docRef.set(data);
            
            IOSAlert.show("Berhasil", "Laporan kerja tersimpan! ID: " + customID);
    
            if (typeof resetFormSetelahSimpanKerja === 'function') {
                resetFormSetelahSimpanKerja();
            }
    
        } catch (e) {
            IOSAlert.show("Gagal", "Firestore Error: " + e.message);
        }
    }
}

function resetFormSetelahSimpanKerja() {
    document.getElementById('jenisTreatment').value = "";
    document.getElementById('durasiJam').value = "";
    document.getElementById('ketKerja').value = "";
    
    document.querySelectorAll('#gridTreatmentKerja .grid-item').forEach(i => i.classList.remove('active')); 
    document.querySelectorAll('#gridDurasiKerja .grid-item').forEach(i => {
        i.classList.remove('active');
        i.style.opacity = '1';
        i.style.pointerEvents = 'auto';
    });
}

function tutupPopupKerja() {
    const modal = document.getElementById('kerjaIosModal');
    if (modal) {
        modal.style.display = 'none';
        
        // Memastikan history.back terpanggil dengan bersih saat ditutup manual (sinkron dg ID)
        if (history.state && history.state.id === 'modalKerja') {
            history.back(); 
        }
        window.removeEventListener('popstate', window.handleBackKerja);
    }
}
