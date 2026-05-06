// kerja.js - Modul Input Pekerjaan (UI Compact, Form Fixed, Detail List Scrollable, No Footer)

let lastTglKerjaValue = ""; 
let checkTanggalInterval = null; 

// 1. INJEKSI CSS UNTUK ANIMASI, SCROLLBAR & UX COMPACT
if (!document.getElementById('kerja-animation-style')) {
    const style = document.createElement('style');
    style.id = 'kerja-animation-style';
    style.innerHTML = `
        @keyframes staggeredFadeInKerja {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .kerja-item-animate { opacity: 0; animation: staggeredFadeInKerja 0.4s ease-out forwards; }
        
        /* Custom Scrollbar iOS Style & Kunci Overscroll */
        #containerListKerja {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }
        #containerListKerja::-webkit-scrollbar { width: 4px; }
        #containerListKerja::-webkit-scrollbar-thumb { background: rgba(142,142,147,0.3); border-radius: 4px; }

        /* UX FORM AGAR HEMAT TEMPAT & LABEL DI TENGAH TEBAL */
        #kerjaIosModal .input-group { margin-bottom: 12px !important; }
        
        /* SETTING SEMUA KETERANGAN / LABEL KE TENGAH DAN TEBAL */
        #kerjaIosModal .input-group label { 
            margin-bottom: 6px !important; 
            font-size: 12px !important; 
            font-weight: 900 !important; /* Teks Tebal */
            text-align: center !important; /* Posisi Tengah */
            display: block !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px;
            color: var(--text-primary) !important;
        }
        
        #kerjaIosModal .grid-picker { gap: 6px !important; }
        #kerjaIosModal .grid-item { padding: 10px 5px !important; font-size: 13px !important; border-radius: 8px !important; }
    `;
    document.head.appendChild(style);
}

function bukaMenuKerja(event) {
    if (event) event.preventDefault();
    let modal = document.getElementById('kerjaIosModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kerjaIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '21000';
        modal.style.overscrollBehavior = 'none'; // Kunci layar belakang
        
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";

        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 100%; max-width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg);">
                
                <div class="ios-modal-header" style="flex-shrink: 0; border-bottom: 0.5px solid rgba(142,142,147,0.2); padding-top: calc(10px + env(safe-area-inset-top)); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-primary); font-size: 15px; text-align: center; width: 100%;">INPUT PEKERJAAN</h3>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                    
                    <div style="padding: 12px 15px 5px 15px; flex-shrink: 0; overflow: hidden;">
                        <div class="input-group">
                            <label>Tanggal Kerja</label>
                            <input type="text" id="tglKerja" readonly 
                                   onclick="bukaKalenderVisual('tglKerja')" placeholder="Pilih Tanggal..."
                                   class="custom-box-input" style="${inputStyle} cursor: pointer; font-weight: 600; text-align: center;">
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
                            <label>Keterangan Input</label>
                            <textarea id="ketKerja" placeholder="Catatan tambahan (opsional)..." class="custom-box-input" style="${inputStyle} resize:none; height: 45px; text-align: center;"></textarea>
                        </div>

                        <button id="btnSimpanKerja" onclick="simpanDataKerja()" class="btn-simpan" style="margin-top:2px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; font-weight: bold; border-radius: 10px; background-color: #007AFF !important; color: #FFFFFF !important; font-size: 14px;">
                            Simpan Laporan
                        </button>
                    </div>

                    <div id="containerListKerja" style="padding: 12px 15px calc(15px + env(safe-area-inset-bottom)) 15px; overflow-y: auto; flex: 1; border-top: 1px dashed rgba(142,142,147,0.2); display: none; background: rgba(142,142,147,0.03);">
                        <h4 style="margin: 0 0 10px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase;">Pekerjaan Tersimpan Hari Ini</h4>
                        <div id="listKerjaHariIni" style="display: flex; flex-direction: column; gap: 8px;">
                            </div>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // --- KUNCI MATI SCROLL IOS (HANYA IZINKAN DI LIST) ---
        modal.addEventListener('touchmove', function(e) {
            const listArea = document.getElementById('containerListKerja');
            if (!listArea.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    const tglInput = document.getElementById('tglKerja');
    tglInput.value = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";
    lastTglKerjaValue = tglInput.value; 
    
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    
    if (typeof applyLastChoiceKerja === 'function') applyLastChoiceKerja(); 
    muatListKerjaHariIni(); 

    if (checkTanggalInterval) clearInterval(checkTanggalInterval);
    checkTanggalInterval = setInterval(() => {
        const currentVal = tglInput.value;
        if (currentVal !== lastTglKerjaValue) {
            lastTglKerjaValue = currentVal;
            muatListKerjaHariIni(); 
        }
    }, 300);

    history.pushState({ id: 'modalKerja' }, '', ''); 
    
    window.handleBackKerja = function(e) {
        if (!e.state || e.state.id === 'dashboardRoot') {
            const m = document.getElementById('kerjaIosModal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = ''; 
            if (checkTanggalInterval) clearInterval(checkTanggalInterval); 
            window.removeEventListener('popstate', window.handleBackKerja);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackKerja);
    window.addEventListener('popstate', window.handleBackKerja);
}

// --- FUNGSI LOAD DAFTAR PEKERJAAN HARI INI (+ PENOMORAN) ---
async function muatListKerjaHariIni() {
    const tglFull = document.getElementById('tglKerja').value;
    const listCont = document.getElementById('listKerjaHariIni');
    const wrapper = document.getElementById('containerListKerja');
    const userAuth = firebase.auth().currentUser;

    if (!userAuth || !tglFull) return;

    const tempArr = tglFull.split(', '); 
    const tglMurni = tempArr[1] || tempArr[0]; 
    const parts = tglMurni.split(" ");
    
    if (parts.length < 3) return; 

    const blnTahunId = parts[1] + "_" + parts[2]; 
    const dateId = tglFull.replace(', ', '_').replace(/\s/g, '_');

    try {
        const snap = await window.firestore
            .collection('data').doc(userAuth.uid)
            .collection('kerja').doc(blnTahunId)
            .collection(dateId).orderBy('waktu_input', 'asc').get();

        if (snap.empty) {
            wrapper.style.display = 'none'; 
            return;
        }

        wrapper.style.display = 'block';
        listCont.innerHTML = "";

        let delayAnim = 0.1;
        let nomorUrut = 1; 

        snap.forEach(doc => {
            const d = doc.data();
            const card = document.createElement('div');
            card.className = 'kerja-item-animate';
            
            card.style.cssText = `
                background: var(--card-bg);
                border-radius: 12px;
                padding: 10px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border: 1px solid rgba(142, 142, 147, 0.2);
            `;
            card.style.animationDelay = `${delayAnim}s`;

            let colorStatus = d.kantor === 'FIVE STAR 1' ? '#007AFF' : '#34C759';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 24px; height: 24px; background: rgba(142,142,147,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #8E8E93;">
                        ${nomorUrut}
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${d.treatment}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 10px; font-weight: 800; background: ${colorStatus}; color: white; padding: 2px 6px; border-radius: 4px;">${d.kantor === 'FIVE STAR 1' ? 'FS 1' : 'FS 2'}</span>
                            <span style="font-size: 11px; color: #8E8E93; font-weight: 600;">• ${d.durasi} Jam</span>
                        </div>
                    </div>
                </div>
                
                <button onclick="hapusEntryKerja('${blnTahunId}', '${dateId}', '${doc.id}')" 
                        style="background: transparent; border: none; color: #FF3B30; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: 0.2s;">
                    <i class="fa-solid fa-trash-can" style="font-size: 15px;"></i>
                </button>
            `;
            listCont.appendChild(card);
            
            nomorUrut++; 
            delayAnim += 0.08;
        });

        setTimeout(() => {
            wrapper.scrollTop = wrapper.scrollHeight; 
        }, 50);

    } catch (e) {
        console.error("Gagal memuat list kerja:", e);
    }
}

// --- FUNGSI HAPUS ENTRY PEKERJAAN ---
async function hapusEntryKerja(blnId, tglId, docId) {
    IOSAlert.show("Hapus Data", "Yakin ingin menghapus inputan ini?", {
        teksBatal: "Batal",
        teksTombol: "Hapus",
        onConfirm: async () => {
            const userAuth = firebase.auth().currentUser;
            if (!userAuth) return;
            try {
                await window.firestore
                    .collection('data').doc(userAuth.uid)
                    .collection('kerja').doc(blnId)
                    .collection(tglId).doc(docId).delete();
                
                muatListKerjaHariIni(); 
            } catch (e) {
                IOSAlert.show("Gagal", "Error: " + e.message);
            }
        }
    });
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

// --- LOGIKA SIMPAN ---
async function simpanDataKerja() {
    const treatment = document.getElementById('jenisTreatment').value;
    const durasi = document.getElementById('durasiJam').value;
    const kantor = document.getElementById('lokasiKantor').value;
    const tanggalFull = document.getElementById('tglKerja').value; 
    const btnSimpan = document.getElementById('btnSimpanKerja');

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    if (!kantor || !treatment || !durasi) {
        return IOSAlert.show("Data Kurang", "Pilih Kantor, Treatment, dan Durasi.");
    }

    btnSimpan.innerText = "Menyimpan...";
    btnSimpan.disabled = true;

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
            IOSAlert.show("Berhasil", "Laporan kerja tersimpan!");
            resetFormSetelahSimpanKerja();
            muatListKerjaHariIni(); 
        } catch (e) {
            IOSAlert.show("Gagal", "Firestore Error: " + e.message);
        } finally {
            btnSimpan.innerText = "Simpan Laporan";
            btnSimpan.disabled = false;
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
    if (history.state && history.state.id === 'modalKerja') {
        history.back(); 
    } else {
        const modal = document.getElementById('kerjaIosModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = ''; 
        if (checkTanggalInterval) clearInterval(checkTanggalInterval); 
        window.removeEventListener('popstate', window.handleBackKerja);
    }
}
