// edit-data.js - Modul Edit & Hapus Data (UI Compact, Form Fixed, Detail List Scrollable, No Footer)

let currentEditId = null;
let currentKategoriEdit = "Kerja";
let currentEditDateContext = ""; 

// CSS Animasi Ekspansi & UX Compact
if (!document.getElementById('edit-expansion-style')) {
    const style = document.createElement('style');
    style.id = 'edit-expansion-style';
    style.innerHTML = `
        @keyframes slideInItem { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .data-item-animate { animation: slideInItem 0.3s ease-out forwards; }
        
        /* Custom Scrollbar iOS Style & Kunci Overscroll */
        #areaListEdit {
            transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
            max-height: 0; overflow-y: auto; opacity: 0; display: block !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }
        #areaListEdit.show { max-height: 2000px; opacity: 1; }
        #areaListEdit::-webkit-scrollbar { width: 4px; }
        #areaListEdit::-webkit-scrollbar-thumb { background: rgba(142,142,147,0.3); border-radius: 4px; }

        /* UX FORM AGAR HEMAT TEMPAT & LABEL DI TENGAH TEBAL */
        #editDataModal .input-group { margin-bottom: 12px !important; }
        #editDataModal .input-group label, #stackedEditPopup .input-group label { 
            margin-bottom: 6px !important; 
            font-size: 12px !important; 
            font-weight: 900 !important; 
            text-align: center !important; 
            display: block !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px;
            color: var(--text-primary) !important;
        }
        #editDataModal .grid-picker, #stackedEditPopup .grid-picker { gap: 6px !important; }
        #editDataModal .grid-item, #stackedEditPopup .grid-item { padding: 10px 5px !important; font-size: 13px !important; border-radius: 8px !important; font-weight: 800; letter-spacing: 0.5px; }
    `;
    document.head.appendChild(style);
}

// 1. MODAL UTAMA (LEVEL 1 / ROOT)
function bukaMenuEdit(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('editDataModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editDataModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        modal.style.overscrollBehavior = 'none'; // Kunci layar belakang
        
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";

        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 100%; max-width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg);">
                
                <div class="ios-modal-header" style="flex-shrink: 0; border-bottom: 0.5px solid rgba(142,142,147,0.2); padding-top: calc(10px + env(safe-area-inset-top)); padding-bottom: 10px;">
                    <h3 id="judulModalEdit" style="margin: 0; color: var(--text-primary); font-size: 15px; text-align: center; width: 100%;">EDIT DATA</h3>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                    
                    <div id="areaPencarianEdit" style="padding: 12px 15px 5px 15px; flex-shrink: 0; overflow: hidden; border-bottom: 1px dashed rgba(142,142,147,0.2);">
                        <div class="input-group">
                            <label>Kategori Data</label>
                            <div class="grid-picker" style="grid-template-columns: 1fr 1fr;">
                                <div class="grid-item active" id="btnKatKerja" onclick="pilihKategoriEdit('Kerja')">KERJA</div>
                                <div class="grid-item" id="btnKatKasbon" onclick="pilihKategoriEdit('Kasbon')">KASBON</div>
                            </div>
                            <input type="hidden" id="editKategori" value="Kerja">
                        </div>
                        
                        <div class="input-group" style="margin-top: 18px !important;">
                            <label>Pilih Tanggal Data</label>
                            <input type="text" id="editTanggalCari" readonly 
                                onclick="if(typeof bukaKalenderVisual === 'function') bukaKalenderVisual('editTanggalCari')" placeholder="Pilih Tanggal..."
                                class="custom-box-input" style="${inputStyle} cursor: pointer; font-weight: 600; text-align: center;">
                        </div>
                        
                        <button id="btnCariEdit" onclick="cariDataEdit()" class="btn-simpan" style="margin-top:2px; margin-bottom:10px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; font-weight: bold; border-radius: 10px; background-color: #007AFF !important; color: #FFFFFF !important; font-size: 14px;">
                            <i class="fa-solid fa-magnifying-glass"></i> Cari Data
                        </button>
                    </div>

                    <div id="areaListEdit" style="padding: 12px 15px calc(15px + env(safe-area-inset-bottom)) 15px; overflow-y: auto; flex: 1; background: rgba(142,142,147,0.03);"></div>
                    
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // --- KUNCI MATI SCROLL IOS (HANYA IZINKAN DI LIST DATA) ---
        modal.addEventListener('touchmove', function(e) {
            const listArea = document.getElementById('areaListEdit');
            if (!listArea.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    const tglInput = document.getElementById('editTanggalCari');
    if (tglInput) {
        tglInput.value = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";
    }

    pilihKategoriEdit('Kerja');
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    
    // --- FIX LOGIKA TOMBOL BACK HP (STRICT ID SINKRON) ---
    history.pushState({ id: 'modalEditData' }, '', ''); 
    
    window.handleBackEdit = function(e) {
        if (!e.state || e.state.id === 'dashboardRoot') {
            const m = document.getElementById('editDataModal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = '';
            window.removeEventListener('popstate', window.handleBackEdit);
        }
    };
    window.removeEventListener('popstate', window.handleBackEdit);
    window.addEventListener('popstate', window.handleBackEdit);
}

function pilihKategoriEdit(kategori) {
    const btnKerja = document.getElementById('btnKatKerja');
    const btnKasbon = document.getElementById('btnKatKasbon');
    const hiddenInput = document.getElementById('editKategori');
    const listArea = document.getElementById('areaListEdit');

    if(btnKerja) btnKerja.classList.remove('active');
    if(btnKasbon) btnKasbon.classList.remove('active');
    
    const targetBtn = document.getElementById('btnKat' + kategori);
    if(targetBtn) targetBtn.classList.add('active');
    if(hiddenInput) hiddenInput.value = kategori;
    
    currentKategoriEdit = kategori;
    if(listArea) {
        listArea.classList.remove('show');
        listArea.innerHTML = "";
    }
}

// LOGIKA CARI: SINKRON DENGAN FORMAT NAMA HARI
async function cariDataEdit() {
    const tanggalFull = document.getElementById('editTanggalCari').value; 
    const kategori = document.getElementById('editKategori').value.toLowerCase();
    const btn = document.getElementById('btnCariEdit');
    const userAuth = firebase.auth().currentUser;

    if (!userAuth) return;
    if (!tanggalFull) return IOSAlert.show("Error", "Pilih tanggal dulu.");

    btn.innerText = "Mencari...";
    btn.disabled = true;

    const tempArr = tanggalFull.split(', ');
    const tglMurni = tempArr[1] || tempArr[0];
    const parts = tglMurni.split(" ");
    
    const blnTahunId = parts[1] + "_" + parts[2]; 
    const dateId = tanggalFull.replace(', ', '_').replace(/\s/g, '_'); 
    currentEditDateContext = tanggalFull; 

    const listArea = document.getElementById('areaListEdit');
    listArea.classList.remove('show');

    try {
        const colRef = window.firestore
            .collection('data').doc(userAuth.uid)
            .collection(kategori).doc(blnTahunId)
            .collection(dateId);

        const snapshot = await colRef.get();

        if (snapshot.empty) {
            listArea.innerHTML = `<p style="text-align:center; opacity:0.5; padding: 20px; color: var(--text-primary); font-size: 13px;">Tidak ada data pada tanggal ini.</p>`;
        } else {
            let htmlList = '';
            let index = 0;

            snapshot.forEach(doc => {
                const item = doc.data();
                const key = doc.id; 
                const info = (kategori === 'kerja') ? `${item.treatment} - ${item.kantor}` : `${item.jenis}`;
                const subInfo = (kategori === 'kerja') ? `Durasi: ${item.durasi} Jam` : `Jumlah: Rp ${parseInt(item.jumlah || 0).toLocaleString('id-ID')}`;
                
                htmlList += `
                    <div class="data-list-card data-item-animate" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; margin-bottom: 10px; background: var(--card-bg); border-radius: 12px; border: 1px solid rgba(142,142,147,0.2); animation-delay: ${index * 0.05}s;">
                        <div style="flex: 1; text-align: left;">
                            <h4 style="margin: 0; font-size: 11px; font-weight: 800; color: #007AFF;">${key}</h4>
                            <h4 style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: var(--text-primary);">${info}</h4>
                            <p style="margin: 3px 0 0; font-size: 12px; opacity: 0.7; color: var(--text-primary);">${subInfo} | ${item.keterangan || '-'}</p>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button class="btn-icon-edit" onclick="masukFormEdit('${key}', '${item.treatment || item.jenis}', '${item.kantor || item.jumlah}', '${item.durasi || ''}', '${item.keterangan || ''}')" style="background: transparent; border: none; color: #007AFF; padding: 8px; cursor: pointer; border-radius: 8px;"><i class="fa-solid fa-pen" style="font-size: 15px;"></i></button>
                            <button class="btn-icon-edit" onclick="hapusDataEdit('${key}')" style="background: transparent; border: none; color: #FF3B30; padding: 8px; cursor: pointer; border-radius: 8px;"><i class="fa-solid fa-trash-can" style="font-size: 15px;"></i></button>
                        </div>
                    </div>`;
                index++;
            });
            listArea.innerHTML = htmlList;
        }
        requestAnimationFrame(() => { listArea.classList.add('show'); });

    } catch (e) {
        listArea.innerHTML = `<p style="text-align:center; color:#FF3B30; padding:20px; font-size: 13px;">Gagal memuat data.</p>`;
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cari Data';
        btn.disabled = false;
    }
}

// 2. POPUP EDIT STACKED (LEVEL 2) - Tetap Mempertahankan Footer Batal
function masukFormEdit(id, v1, v2, v3, ket) {
    currentEditId = id;
    let stackModal = document.getElementById('stackedEditPopup');
    
    if (!stackModal) {
        stackModal = document.createElement('div');
        stackModal.id = 'stackedEditPopup';
        stackModal.className = 'ios-overlay'; 
        stackModal.style.zIndex = '22000'; 
        
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";

        stackModal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 320px; background: var(--card-bg); border-radius: 16px;">
                <div class="ios-modal-header" style="border-bottom: 0.5px solid rgba(142,142,147,0.2); padding: 15px;"><h3 style="margin:0; color: var(--text-primary); font-size: 15px; text-align: center;">UBAH DATA</h3></div>
                <div class="ios-modal-body" id="stackBodyEdit" style="padding: 15px;"></div>
                <div class="ios-modal-footer-grid" style="border-top: 0.5px solid rgba(142,142,147,0.2); grid-template-columns: 1fr 1fr;">
                    <button class="btn-batal" onclick="tutupStackedEdit()" style="color: #FF3B30 !important; font-weight: 600; padding: 14px; background: transparent; border: none; font-size: 15px;">Batal</button>
                    <button class="btn-simpan" onclick="simpanDataEditReal()" style="color: #007AFF !important; font-weight: 700; padding: 14px; background: transparent; border: none; font-size: 15px; border-left: 0.5px solid rgba(142,142,147,0.2);">Simpan</button>
                </div>
            </div>`;
        document.body.appendChild(stackModal);
    }

    const body = document.getElementById('stackBodyEdit');
    const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";

    if (currentKategoriEdit === 'Kerja') {
        body.innerHTML = `
            <div class="input-group"><label>Lokasi Kantor</label>
                <div class="grid-picker" id="stkKantor" style="grid-template-columns: 1fr 1fr;">
                    <div class="grid-item" data-val="FIVE STAR 1" onclick="pilihGridStk(this, 'kantor', 'FIVE STAR 1')">FIVE STAR 1</div>
                    <div class="grid-item" data-val="FIVE STAR 2" onclick="pilihGridStk(this, 'kantor', 'FIVE STAR 2')">FIVE STAR 2</div>
                </div><input type="hidden" id="stkValKantor"></div>
            <div class="input-group" style="margin-top: 18px !important;"><label>Jenis Treatment</label>
                <div class="grid-picker" id="stkTreat">
                    <div class="grid-item" data-val="MASSAGE" onclick="pilihGridStk(this, 'treat', 'MASSAGE')">MASSAGE</div>
                    <div class="grid-item" data-val="REFLEXY" onclick="pilihGridStk(this, 'treat', 'REFLEXY')">REFLEXY</div>
                    <div class="grid-item" data-val="KOMBINASI" onclick="pilihGridStk(this, 'treat', 'KOMBINASI')">KOMBINASI</div>
                </div><input type="hidden" id="stkValTreat"></div>
            <div class="input-group" style="margin-top: 18px !important;"><label>Durasi Jam</label>
                <div class="grid-picker" id="stkDur" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="grid-item" data-val="0.5" onclick="pilihGridStk(this, 'dur', '0.5')">½</div>
                    <div class="grid-item" data-val="1" onclick="pilihGridStk(this, 'dur', '1')">1</div>
                    <div class="grid-item" data-val="1.5" onclick="pilihGridStk(this, 'dur', '1.5')">1.5</div>
                    <div class="grid-item" data-val="2" onclick="pilihGridStk(this, 'dur', '2')">2</div>
                </div><input type="hidden" id="stkValDur"></div>
            <div class="input-group" style="margin-top: 18px !important;"><label>Keterangan Edit</label><textarea id="stkKet" class="custom-box-input" style="${inputStyle} resize:none; height: 45px; text-align: center;">${ket}</textarea></div>`;
        
        setTimeout(() => {
            const elKntr = document.querySelector("#stkKantor .grid-item[data-val='" + v2 + "']"); if(elKntr) elKntr.click();
            const elTrt = document.querySelector("#stkTreat .grid-item[data-val='" + v1 + "']"); if(elTrt) elTrt.click();
            const elDur = document.querySelector("#stkDur .grid-item[data-val='" + v3 + "']"); if(elDur) elDur.click();
        }, 50);
    } else {
        body.innerHTML = `
            <div class="input-group"><label>Jenis Kasbon</label>
                <div class="grid-picker" id="stkKas" style="grid-template-columns: 1fr 1fr;">
                    <div class="grid-item" data-val="KANTOR" onclick="pilihGridStk(this, 'kas', 'KANTOR')">KANTOR</div>
                    <div class="grid-item" data-val="PAKET" onclick="pilihGridStk(this, 'kas', 'PAKET')">PAKET</div>
                </div><input type="hidden" id="stkValKas"></div>
            <div class="input-group" style="margin-top: 18px !important;"><label>Jumlah (Rp)</label><input type="number" id="stkJumlah" value="${v2.replace(/\./g,'')}" class="custom-box-input" style="${inputStyle} text-align: center; font-weight: bold; font-size: 16px;"></div>
            <div class="input-group" style="margin-top: 18px !important;"><label>Keterangan Edit</label><textarea id="stkKet" class="custom-box-input" style="${inputStyle} resize:none; height: 45px; text-align: center;">${ket}</textarea></div>`;
        
        setTimeout(() => { 
            const elKas = document.querySelector("#stkKas .grid-item[data-val='" + v1 + "']"); if(elKas) elKas.click(); 
        }, 50);
    }
    stackModal.style.display = 'flex';
    
    history.pushState({ id: 'modalStackedEdit' }, '', ''); 
    
    window.handleBackStacked = function(e) {
        if (!e.state || e.state.id === 'modalEditData' || e.state.id === 'dashboardRoot') {
            const s = document.getElementById('stackedEditPopup');
            if (s) s.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackStacked);
        }
    };
    window.removeEventListener('popstate', window.handleBackStacked);
    window.addEventListener('popstate', window.handleBackStacked);
}

function pilihGridStk(el, cat, val) {
    el.parentElement.querySelectorAll('.grid-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    if(cat === 'kantor') document.getElementById('stkValKantor').value = val;
    if(cat === 'treat') document.getElementById('stkValTreat').value = val;
    if(cat === 'dur') document.getElementById('stkValDur').value = val;
    if(cat === 'kas') document.getElementById('stkValKas').value = val;
}

function tutupStackedEdit() {
    if (history.state && history.state.id === 'modalStackedEdit') {
        history.back(); 
    } else {
        const stack = document.getElementById('stackedEditPopup');
        if (stack) stack.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackStacked);
    }
}

// 3. SIMPAN HASIL EDIT: SINKRON NAMA HARI
async function simpanDataEditReal() {
    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;

    const kategori = currentKategoriEdit.toLowerCase();
    const tempArr = currentEditDateContext.split(', ');
    const tglMurni = tempArr[1] || tempArr[0];
    const parts = tglMurni.split(" ");
    
    const blnTahunId = parts[1] + "_" + parts[2];
    const dateId = currentEditDateContext.replace(', ', '_').replace(/\s/g, '_');

    let updatedData = {
        keterangan: document.getElementById('stkKet').value,
        waktu_edit: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (currentKategoriEdit === 'Kerja') {
        const trt = document.getElementById('stkValTreat').value;
        const dur = document.getElementById('stkValDur').value;
        const d = parseFloat(dur);
        
        updatedData.treatment = trt;
        updatedData.kantor = document.getElementById('stkValKantor').value;
        updatedData.durasi = d;
        updatedData.detail_jam = { massage: 0, reflexy: 0 };

        if (trt === 'KOMBINASI') {
            if (d === 1) { updatedData.detail_jam.massage = 0.5; updatedData.detail_jam.reflexy = 0.5; }
            else if (d === 1.5) { updatedData.detail_jam.massage = 1.0; updatedData.detail_jam.reflexy = 0.5; }
            else if (d === 2) { updatedData.detail_jam.massage = 1.0; updatedData.detail_jam.reflexy = 1.0; }
            else { updatedData.detail_jam.massage = d / 2; updatedData.detail_jam.reflexy = d / 2; }
        } else if (trt === 'MASSAGE') updatedData.detail_jam.massage = d;
        else updatedData.detail_jam.reflexy = d;
    } else {
        updatedData.jenis = document.getElementById('stkValKas').value;
        updatedData.jumlah = parseInt(document.getElementById('stkJumlah').value);
    }

    try {
        const docRef = window.firestore
            .collection('data').doc(userAuth.uid)
            .collection(kategori).doc(blnTahunId)
            .collection(dateId).doc(currentEditId);

        await docRef.update(updatedData);

        IOSAlert.show("Berhasil", "Data berhasil diperbarui!", { 
            onConfirm: () => { 
                tutupStackedEdit(); 
                cariDataEdit(); 
            }
        });
    } catch (e) { IOSAlert.show("Gagal", e.message); }
}

// 4. HAPUS DATA: SINKRON NAMA HARI
async function hapusDataEdit(id) {
    IOSAlert.show("Hapus Data", "Yakin ingin menghapus data ini?", {
        teksBatal: "Batal", teksTombol: "Hapus",
        onConfirm: async () => {
            const userAuth = firebase.auth().currentUser;
            if (!userAuth) return;

            const kategori = currentKategoriEdit.toLowerCase();
            const tempArr = currentEditDateContext.split(', ');
            const tglMurni = tempArr[1] || tempArr[0];
            const parts = tglMurni.split(" ");
            
            const blnTahunId = parts[1] + "_" + parts[2];
            const dateId = currentEditDateContext.replace(', ', '_').replace(/\s/g, '_');

            try {
                const docRef = window.firestore
                    .collection('data').doc(userAuth.uid)
                    .collection(kategori).doc(blnTahunId)
                    .collection(dateId).doc(id);

                await docRef.delete();
                cariDataEdit(); 
            } catch (e) { IOSAlert.show("Gagal", e.message); }
        }
    });
}

// Fungsi Tutup Popup Utama (Level 1)
function tutupMenuEdit() {
    if (history.state && history.state.id === 'modalEditData') {
        history.back();
    } else {
        const modal = document.getElementById('editDataModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        window.removeEventListener('popstate', window.handleBackEdit);
    }
}
