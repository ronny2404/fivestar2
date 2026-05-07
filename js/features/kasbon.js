// kasbon.js - Modul Kasbon (UI Compact, Form Fixed, Detail List Scrollable, No Footer)

let lastTglKasbonValue = ""; 
let checkTanggalKasbonInterval = null; 

// 1. INJEKSI CSS UNTUK ANIMASI, SCROLLBAR & UX COMPACT
if (!document.getElementById('kasbon-animation-style')) {
    const style = document.createElement('style');
    style.id = 'kasbon-animation-style';
    style.innerHTML = `
        @keyframes staggeredFadeInKasbon {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .kasbon-item-animate { opacity: 0; animation: staggeredFadeInKasbon 0.4s ease-out forwards; }
        
        /* Custom Scrollbar iOS Style & Kunci Overscroll */
        #containerListKasbon {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }
        #containerListKasbon::-webkit-scrollbar { width: 4px; }
        #containerListKasbon::-webkit-scrollbar-thumb { background: rgba(142,142,147,0.3); border-radius: 4px; }

        /* UX FORM AGAR HEMAT TEMPAT & LABEL DI TENGAH TEBAL */
        #kasbonIosModal .input-group { margin-bottom: 12px !important; }
        
        #kasbonIosModal .input-group label { 
            margin-bottom: 6px !important; 
            font-size: 12px !important; 
            font-weight: 900 !important; 
            text-align: center !important; 
            display: block !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px;
            color: var(--text-primary) !important;
        }
        
        #kasbonIosModal .grid-picker { gap: 6px !important; }
        #kasbonIosModal .grid-item { padding: 10px 5px !important; font-size: 13px !important; border-radius: 8px !important; }
    `;
    document.head.appendChild(style);
}

function bukaMenuKasbon(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kasbonIosModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kasbonIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '21000';
        modal.style.overscrollBehavior = 'none'; // Kunci layar belakang
        
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";
        
        // Tentukan tombol kembali: Hanya muncul jika isIos() bernilai true
        const tombolKembaliIos = isIos() ?
            `<button onclick="tutupPopupKasbon()" style="background:transparent; border:none; color:#007AFF; font-size:16px; padding: 5px 10px; display:flex; align-items:center; gap:5px; position:absolute; left:10px; z-index:10; top: 50%; transform: translateY(-50%);">
                    <i class="fa-solid fa-chevron-left"></i> Selesai
               </button>` :
            '';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 100%; max-width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg);">
                
                <div class="ios-modal-header" style="flex-shrink: 0; border-bottom: 0.5px solid rgba(142,142,147,0.2); padding-top: calc(10px + env(safe-area-inset-top)); padding-bottom: 10px; position: relative; display: flex; align-items: center; justify-content: center;">
                    
                    ${tombolKembaliIos} <h3 style="margin: 0; color: var(--text-primary); font-size: 20px; text-align: center; width: 100%;">INPUT KASBON</h3>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                    
                    <div style="padding: 12px 15px 5px 15px; flex-shrink: 0; overflow: hidden;">
                        <div class="input-group">
                            <label>Tanggal Kasbon</label>
                            <input type="text" id="tglKasbon" readonly 
                                   onclick="bukaKalenderVisual('tglKasbon')" placeholder="Pilih Tanggal..."
                                   class="custom-box-input" style="${inputStyle} cursor: pointer; font-weight: 600; text-align: center;">
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
                            <input type="number" id="jumlahKasbon" placeholder="Contoh: 50000" inputmode="numeric" class="custom-box-input" style="${inputStyle} text-align: center; font-weight: bold; font-size: 16px;">
                        </div>

                        <div class="input-group" style="margin-top: 18px !important;">
                            <label>Keterangan Input</label>
                            <textarea id="ketKasbon" placeholder="Catatan tambahan (opsional)..." class="custom-box-input" style="${inputStyle} resize:none; height: 45px; text-align: center;"></textarea>
                        </div>

                        <button id="btnSimpanKasbon" onclick="simpanDataKasbon()" class="btn-simpan" style="margin-top:2px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; font-weight: bold; border-radius: 10px; background-color: #007AFF !important; color: #FFFFFF !important; font-size: 14px;">
                            Simpan Laporan
                        </button>
                    </div>

                    <div id="containerListKasbon" style="padding: 12px 15px calc(15px + env(safe-area-inset-bottom)) 15px; overflow-y: auto; flex: 1; border-top: 1px dashed rgba(142,142,147,0.2); display: none; background: rgba(142,142,147,0.03);">
                        <h4 style="margin: 0 0 10px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase;">Kasbon Tersimpan Hari Ini</h4>
                        <div id="listKasbonHariIni" style="display: flex; flex-direction: column; gap: 8px;">
                            </div>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // --- KUNCI MATI SCROLL IOS (HANYA IZINKAN DI LIST) ---
        modal.addEventListener('touchmove', function(e) {
            const listArea = document.getElementById('containerListKasbon');
            if (!listArea.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    const tglInput = document.getElementById('tglKasbon');
    tglInput.value = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";
    lastTglKasbonValue = tglInput.value; 
    
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    
    muatListKasbonHariIni(); 

    if (checkTanggalKasbonInterval) clearInterval(checkTanggalKasbonInterval);
    checkTanggalKasbonInterval = setInterval(() => {
        const currentVal = tglInput.value;
        if (currentVal !== lastTglKasbonValue) {
            lastTglKasbonValue = currentVal;
            muatListKasbonHariIni(); 
        }
    }, 300);

    history.pushState({ id: 'modalKasbon' }, '', ''); 
    
    window.handleBackKasbon = function(e) {
        if (!e.state || e.state.id === 'dashboardRoot') {
            const m = document.getElementById('kasbonIosModal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = ''; 
            if (checkTanggalKasbonInterval) clearInterval(checkTanggalKasbonInterval); 
            window.removeEventListener('popstate', window.handleBackKasbon);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackKasbon);
    window.addEventListener('popstate', window.handleBackKasbon);
}

// --- FUNGSI LOAD DAFTAR KASBON HARI INI (+ PENOMORAN) ---
async function muatListKasbonHariIni() {
    const tglFull = document.getElementById('tglKasbon').value;
    const listCont = document.getElementById('listKasbonHariIni');
    const wrapper = document.getElementById('containerListKasbon');
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
            .collection('kasbon').doc(blnTahunId)
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
            card.className = 'kasbon-item-animate';
            
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

            let colorStatus = d.jenis === 'KANTOR' ? '#007AFF' : '#FF9500';

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 24px; height: 24px; background: rgba(142,142,147,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #8E8E93;">
                        ${nomorUrut}
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">Rp ${parseInt(d.jumlah).toLocaleString('id-ID')}</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 10px; font-weight: 800; background: ${colorStatus}; color: white; padding: 2px 6px; border-radius: 4px;">${d.jenis}</span>
                            ${d.keterangan ? `<span style="font-size: 11px; color: #8E8E93; font-weight: 600; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">• ${d.keterangan}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <button onclick="hapusEntryKasbon('${blnTahunId}', '${dateId}', '${doc.id}')" 
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
        console.error("Gagal memuat list kasbon:", e);
    }
}

// --- FUNGSI HAPUS ENTRY KASBON ---
async function hapusEntryKasbon(blnId, tglId, docId) {
    IOSAlert.show("Hapus Data", "Yakin ingin menghapus inputan ini?", {
        teksBatal: "Batal",
        teksTombol: "Hapus",
        onConfirm: async () => {
            const userAuth = firebase.auth().currentUser;
            if (!userAuth) return;
            try {
                await window.firestore
                    .collection('data').doc(userAuth.uid)
                    .collection('kasbon').doc(blnId)
                    .collection(tglId).doc(docId).delete();
                
                muatListKasbonHariIni(); 
            } catch (e) {
                IOSAlert.show("Gagal", "Error: " + e.message);
            }
        }
    });
}

function pilihGridKasbon(elemen, nilai) {
    const grup = elemen.parentElement;
    const items = grup.querySelectorAll('.grid-item');
    items.forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    document.getElementById('jenisKasbon').value = nilai;
}

// --- LOGIKA SIMPAN (FIRESTORE + TIMESTAMP ID) ---
async function simpanDataKasbon() {
    const jenis = document.getElementById('jenisKasbon').value;
    const jumlah = document.getElementById('jumlahKasbon').value;
    const tglFull = document.getElementById('tglKasbon').value; 
    const ket = document.getElementById('ketKasbon').value;
    const btnSimpan = document.getElementById('btnSimpanKasbon');

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

    btnSimpan.innerText = "Menyimpan...";
    btnSimpan.disabled = true;

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
            IOSAlert.show("Berhasil", "Kasbon Rp " + nominalBersih.toLocaleString('id-ID') + " tersimpan!");
    
            if (typeof resetFormKasbon === 'function') resetFormKasbon();
            muatListKasbonHariIni(); // Auto update list setelah berhasil simpan

        } catch (e) {
            console.error(e);
            IOSAlert.show("Gagal", "Error Firestore: " + e.message);
        } finally {
            btnSimpan.innerText = "Simpan Laporan";
            btnSimpan.disabled = false;
        }
    } else {
        IOSAlert.show("Error", "Sistem Database belum siap.");
        btnSimpan.innerText = "Simpan Laporan";
        btnSimpan.disabled = false;
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

function tutupPopupKasbon() {
    if (history.state && history.state.id === 'modalKasbon') {
        history.back(); 
    } else {
        const modal = document.getElementById('kasbonIosModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        if (checkTanggalKasbonInterval) clearInterval(checkTanggalKasbonInterval); 
        window.removeEventListener('popstate', window.handleBackKasbon);
    }
}
