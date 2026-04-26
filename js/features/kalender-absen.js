// kalender-absen.js - FIVE STAR 2 (ULTRA FAST FIRESTORE VERSION - SYNC WITH DAY NAME)

window.currentKalenderDate = window.currentKalenderDate || new Date();
window.isEditModeAbsen = false;
window.cacheAbsenBulanIni = {}; 
window.bulanIndo = window.bulanIndo || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// 1. INJEKSI CSS
if (!document.getElementById('kalender-css')) {
    const style = document.createElement('style');
    style.id = 'kalender-css';
    style.innerHTML = `
        .edit-active-icon { animation: pulse-edit 0.8s infinite; color: #FF3B30 !important; }
        @keyframes pulse-edit { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .tgl-item-global { 
            cursor: pointer; position: relative; transition: transform 0.2s ease, background-color 0.2s ease;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            height: 45px; border-radius: 10px; font-size: 14px; font-weight: 600;
        }
        .tgl-item-global:active { transform: scale(0.88); filter: brightness(0.8); }
        .tgl-item-global.minggu { color: #FF3B30; }
        .tgl-item-global.today { border: 2px solid #007AFF; }
        .grid-kalender-container { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 15px; }
    `;
    document.head.appendChild(style);
}

// 2. MODAL UTAMA KALENDER
window.bukaKalenderAbsen = function(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kalenderAbsenModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kalenderAbsenModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; flex-shrink: 0;">
                    <div onclick="bukaBulanTahunPickerAbsen()" style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <h3 id="txtDisplayBulanTahun" style="margin:0; font-size:18px;">Memuat...</h3>
                        <i class="fa-solid fa-chevron-down" style="font-size:10px; opacity:0.5;"></i>
                    </div>
                    <i id="iconEditAbsen" class="fa-solid fa-pen-to-square" onclick="toggleEditModeAbsen()" style="font-size: 20px; color: #8E8E93; cursor: pointer; padding: 5px;"></i>
                </div>
                <div class="ios-modal-body" style="padding: 0; overflow-y: auto; flex-grow: 1;">
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; padding: 10px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; background: inherit; z-index: 5;">
                        <div style="color:#FF3B30; font-size:10px; font-weight:800;">MIN</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">SEN</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">SEL</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">RAB</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">KAM</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">JUM</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">SAB</div>
                    </div>
                    <div id="gridBodyAbsen" class="grid-kalender-container"></div>
                </div>
                <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr; flex-shrink: 0;">
                    <button class="btn-batal" onclick="tutupKalenderAbsen()">Tutup</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    window.resetEditModeState(); 
    window.renderKalenderAbsen();
    modal.style.display = 'flex';
};

// 3. LOGIKA RENDER (SINKRON DENGAN FORMAT NAMA HARI)
window.renderKalenderAbsen = async function() {
    const grid = document.getElementById('gridBodyAbsen');
    const display = document.getElementById('txtDisplayBulanTahun');
    if(!grid || !display) return;

    const bln = window.currentKalenderDate.getMonth();
    const thn = window.currentKalenderDate.getFullYear();
    const blnTahunId = window.bulanIndo[bln] + "_" + thn; // Contoh: April_2026
    
    display.innerText = window.bulanIndo[bln] + " " + thn;
    grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; opacity:0.5;">Sinkronisasi...</p>';

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;

    try {
        let listPromises = [];
        const daysInMonth = new Date(thn, bln + 1, 0).getDate();
        const daftarTglFull = [];
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

        // --- FETCHING PARALLEL DENGAN FORMAT BARU ---
        for (let d = 1; d <= daysInMonth; d++) {
            const tempDate = new Date(thn, bln, d);
            const tglFullStr = tempDate.toLocaleDateString('id-ID', opsi); // "Senin, 27 April 2026"
            const dateId = tglFullStr.replace(', ', '_').replace(/\s/g, '_'); // "Senin_27_April_2026"
            
            daftarTglFull.push(tglFullStr);

            const prom = window.firestore
                .collection('data').doc(userAuth.uid)
                .collection('absen').doc(blnTahunId)
                .collection(dateId).doc('harian').get();
            listPromises.push(prom);
        }

        const snapshots = await Promise.all(listPromises);
        
        window.cacheAbsenBulanIni = {};
        snapshots.forEach((doc, index) => {
            if (doc.exists) {
                // Simpan di cache menggunakan key tglFullStr (Senin, 27 April 2026)
                window.cacheAbsenBulanIni[daftarTglFull[index]] = doc.data();
            }
        });
        
        grid.innerHTML = '';
        const firstDay = new Date(thn, bln, 1).getDay();
        const todayStr = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";

        for (let i = 0; i < firstDay; i++) { grid.innerHTML += `<div></div>`; }

        for (let d = 1; d <= daysInMonth; d++) {
            const tglFull = daftarTglFull[d-1];
            const dataDay = window.cacheAbsenBulanIni[tglFull] || null;
            
            const dayOfWeek = (firstDay + d - 1) % 7;
            let classes = "tgl-item-global"; 
            if (dayOfWeek === 0) classes += " minggu"; 
            if (tglFull === todayStr) classes += " today"; 

            let customStyle = "";
            let statusText = "";

            if (dataDay) {
                const s = dataDay.status;
                const colors = { 'Masuk': '#34C759', 'Off': '#8E8E93', 'Libur': '#8E8E93', 'Telat': '#FF9500' };
                customStyle = `background: ${colors[s] || '#FF3B30'}; color: white; border:none;`;
                statusText = `<span style="font-size:7px; font-weight:800; text-transform:uppercase; margin-top:2px;">${s.substring(0,3)}</span>`;
            }

            grid.innerHTML += `
                <div class="${classes}" style="${customStyle}" onclick="window.klikTglAbsen('${tglFull}')">
                    ${d}
                    ${statusText}
                </div>`;
        }
    } catch (e) {
        grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; color:red;">Gagal memuat.</p>';
    }
};

// 4. LOGIKA KLIK & RINCIAN
window.klikTglAbsen = function(tglFull) {
    const existingData = window.cacheAbsenBulanIni[tglFull] || null;

    if (window.isEditModeAbsen) {
        // Pecah string untuk cek masa depan
        const temp = tglFull.split(', ');
        const tglMurni = temp[1]; // "27 April 2026"
        const parts = tglMurni.split(" ");
        const clickedDate = new Date(parseInt(parts[2]), window.bulanIndo.indexOf(parts[1]), parseInt(parts[0]));
        const hariIni = new Date();
        hariIni.setHours(0,0,0,0);
        
        if (clickedDate > hariIni) return IOSAlert.show("Dilarang", "Belum bisa absen masa depan.");
        
        if (typeof window.bukaMenuAbsen === 'function') {
            window.bukaMenuAbsen(null, tglFull, existingData);
        }
    } else {
        if (existingData) window.bukaRincianTglAbsen(tglFull, existingData);
    }
};

window.bukaRincianTglAbsen = function(tgl, data) {
    let rincianModal = document.getElementById('rincianTglAbsenModal');
    if (!rincianModal) {
        rincianModal = document.createElement('div');
        rincianModal.id = 'rincianTglAbsenModal';
        rincianModal.className = 'ios-overlay';
        rincianModal.style.zIndex = '25000';
        document.body.appendChild(rincianModal);
    }

    let jamTampil = "N/A";
    if (data.waktu_input && typeof data.waktu_input.toDate === 'function') {
        jamTampil = data.waktu_input.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    rincianModal.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 310px;">
            <div class="ios-modal-header"><h3>Detail Absensi</h3><p style="font-size: 13px; color: #8E8E93; margin: 5px 0 0 0;">${tgl}</p></div>
            <div class="ios-modal-body" style="padding: 10px 15px 20px 15px;">
                <div style="background: var(--card-bg); border-radius: 16px; overflow: hidden; border: 1px solid rgba(142,142,147,0.12);">
                    <div style="display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #007AFF; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-building" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">LOKASI KANTOR</span><span style="font-size: 15px; font-weight: 500;">${data.kantor}</span></div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #34C759; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-check-circle" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">STATUS</span><span style="font-size: 15px; font-weight: 500;">${data.status}</span></div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 14px 15px; gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #FF9500; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-clock" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">WAKTU INPUT</span><span style="font-size: 15px; font-weight: 500;">${jamTampil}</span></div>
                    </div>
                </div>
            </div>
            <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr;"><button class="btn-batal" onclick="document.getElementById('rincianTglAbsenModal').style.display='none'">Tutup</button></div>
        </div>`;
    rincianModal.style.display = 'flex';
};

// 5. NAVIGASI PICKER (TETAP SAMA)
window.toggleEditModeAbsen = function() { window.isEditModeAbsen = !window.isEditModeAbsen; window.updateIconEditUI(); };
window.resetEditModeState = function() { window.isEditModeAbsen = false; window.updateIconEditUI(); };
window.updateIconEditUI = function() {
    const icon = document.getElementById('iconEditAbsen');
    if (!icon) return;
    if (window.isEditModeAbsen) icon.classList.add('edit-active-icon');
    else icon.classList.remove('edit-active-icon');
};
window.tutupKalenderAbsen = function() { window.resetEditModeState(); document.getElementById('kalenderAbsenModal').style.display = 'none'; };
window.setBlnAbsen = function(i) { window.currentKalenderDate.setMonth(i); document.getElementById('pickerMYAbsen').style.display = 'none'; window.renderKalenderAbsen(); };
window.setThnAbsen = function(y) { window.currentKalenderDate.setFullYear(y); if(document.getElementById('pickerYearOnly')) document.getElementById('pickerYearOnly').style.display = 'none'; window.renderPickerMYInner(false); };
window.bukaBulanTahunPickerAbsen = function() {
    let picker = document.getElementById('pickerMYAbsen');
    if (!picker) { picker = document.createElement('div'); picker.id = 'pickerMYAbsen'; picker.className = 'ios-overlay'; picker.style.zIndex = '22000'; document.body.appendChild(picker); }
    window.renderPickerMYInner(true); picker.style.display = 'flex';
};
window.renderPickerMYInner = function(withAnim = false) {
    const thn = window.currentKalenderDate.getFullYear();
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    const picker = document.getElementById('pickerMYAbsen');
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="window.bukaYearPickerAbsen()" style="margin:0; cursor:pointer;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">
                ${window.bulanIndo.map((b, i) => `<div class="grid-item ${window.currentKalenderDate.getMonth() === i ? 'active' : ''}" onclick="window.setBlnAbsen(${i})" style="padding: 12px 0;">${b.substring(0,3)}</div>`).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px;"><button class="btn-text-batal" onclick="document.getElementById('pickerMYAbsen').style.display='none'">BATAL</button></div>
        </div>`;
};
window.ubahThnAbsen = function(v, isYearOnly = false) { window.currentKalenderDate.setFullYear(window.currentKalenderDate.getFullYear() + v); if(isYearOnly) window.renderYearPickerInner(false); else window.renderPickerMYInner(false); };
window.bukaYearPickerAbsen = function() {
    let yrPicker = document.getElementById('pickerYearOnly');
    if (!yrPicker) { yrPicker = document.createElement('div'); yrPicker.id = 'pickerYearOnly'; yrPicker.className = 'ios-overlay'; yrPicker.style.zIndex = '23000'; document.body.appendChild(yrPicker); }
    window.renderYearPickerInner(true); yrPicker.style.display = 'flex';
};
window.renderYearPickerInner = function(withAnim = false) {
    const startY = window.currentKalenderDate.getFullYear() - 4;
    const endY = startY + 11;
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    for (let y = startY; y <= endY; y++) { yearHtml += `<div class="grid-item ${y === window.currentKalenderDate.getFullYear() ? 'active' : ''}" onclick="window.setThnAbsen(${y})" style="padding: 12px 0;">${y}</div>`; }
    document.getElementById('pickerYearOnly').innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px;">Pilih Tahun</h2>
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">${yearHtml}</div>
            <div style="text-align: center; margin-top: 20px;"><button class="btn-text-batal" onclick="document.getElementById('pickerYearOnly').style.display='none'">BATAL</button></div>
        </div>`;
};
