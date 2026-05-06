// kalender-absen.js - FIVE STAR 2 (ULTRA FAST + SMART ID NAVIGATION + AUTO EDIT EMPTY DAY)

window.currentKalenderDate = window.currentKalenderDate || new Date();
window.cacheAbsenBulanIni = {}; 
window.bulanIndo = window.bulanIndo || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// 1. INJEKSI CSS - KUNCIAN KOTAK 1:1 SEMPURNA DENGAN WRAPPER
let existingStyle = document.getElementById('kalender-css');
if (existingStyle) {
    existingStyle.remove(); // Hapus cache lama
}

const style = document.createElement('style');
style.id = 'kalender-css';
style.innerHTML = `
    /* JURUS AMPUH KOTAK 1:1 (WRAPPER) */
    .tgl-wrapper {
        position: relative;
        width: 100%;
        padding-bottom: 100%; /* Memaksa tinggi selalu sama persis dengan lebar */
    }
    
    .tgl-item-global { 
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%; /* Mengisi penuh wadah 1:1 */
        cursor: pointer; transition: transform 0.2s ease, background-color 0.2s ease;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        border-radius: 12px;
        font-size: 17px;
        font-weight: 700; color: var(--text-primary);
        border: 1px solid rgba(142, 142, 147, 0.4); /* GARIS TEPI SELALU ADA */
        box-sizing: border-box;
        background: var(--bg-color);
    }
    
    .tgl-item-global:active { transform: scale(0.9); }
    .tgl-item-global.minggu { color: #FF3B30 !important; }
    
    .tgl-item-global.today { 
        border: 2px solid #007AFF !important; /* Timpa tebal untuk hari ini */
        font-weight: 800;
    }
    
    .tgl-item-global.disabled-day {
        opacity: 0.35 !important;
        cursor: default;
        background: rgba(142,142,147,0.05);
        border: 1px dashed rgba(142, 142, 147, 0.2) !important;
        pointer-events: none;
    }
    
    .grid-kalender-container { 
        display: grid; 
        grid-template-columns: repeat(7, 1fr); 
        gap: 6px; /* Gap seragam di semua sisi */
        padding: 5px 12px 20px 12px; 
        align-content: start; 
    }
    
    .hari-header-kalender {
        display: grid; 
        grid-template-columns: repeat(7, 1fr); 
        gap: 6px; /* Samakan dengan gap container bawah */
        text-align: center; 
        padding: 10px 12px 12px 12px; /* Samakan dengan padding bawah */
        margin-bottom: 5px; 
        border-bottom: 0.5px solid rgba(142,142,147,0.3); 
        position: sticky; top: 0; background: var(--card-bg); z-index: 5;
    }
`;
document.head.appendChild(style);


// 2. MODAL UTAMA KALENDER (LEVEL 1)
window.bukaKalenderAbsen = function(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kalenderAbsenModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kalenderAbsenModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        modal.style.overscrollBehavior = 'none';

        modal.innerHTML = `
            <div id="kotakLengkungKalender" class="ios-modal-form profile-expand-anim" style="width: 100%; max-width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg);">
                
                <div class="ios-modal-header" style="display: flex; flex-direction: column; align-items: center; padding-top: calc(10px + env(safe-area-inset-top)); padding-bottom: 0; flex-shrink: 0; border-bottom: none;">
                    <h3 style="margin: 0 0 15px 0; font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: 1px; text-transform: uppercase;">Absensi</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 5px; box-sizing: border-box;">
                        <button onclick="window.ubahBulanAbsenHeader(-1)" style="background: transparent; border: none; color: #007AFF; font-size: 20px; cursor: pointer; padding: 5px 15px;"><i class="fa-solid fa-chevron-left"></i></button>
                        
                        <div onclick="bukaBulanTahunPickerAbsen()" style="cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; padding: 6px 14px; border-radius: 20px; background: rgba(142,142,147,0.12); min-width: 140px;">
                            <span id="txtDisplayBulanTahun" style="font-size:16px; font-weight: 700; color: var(--text-primary);">Memuat...</span>
                            <i class="fa-solid fa-caret-down" style="font-size:12px; color: var(--text-primary); opacity: 0.7;"></i>
                        </div>
                        
                        <button onclick="window.ubahBulanAbsenHeader(1)" style="background: transparent; border: none; color: #007AFF; font-size: 20px; cursor: pointer; padding: 5px 15px;"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>

                <div class="ios-modal-body" id="scrollAreaKalenderAbsen" style="padding: 0 0 calc(20px + env(safe-area-inset-bottom)) 0; overflow-y: auto; flex-grow: 1; -webkit-overflow-scrolling: touch;">
                    <div class="hari-header-kalender">
                        <div style="color:#FF3B30; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">MIN</div>
                        <div style="color:#8E8E93; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">SEN</div>
                        <div style="color:#8E8E93; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">SEL</div>
                        <div style="color:#8E8E93; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">RAB</div>
                        <div style="color:#8E8E93; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">KAM</div>
                        <div style="color:#8E8E93; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">JUM</div>
                        <div style="color:#8E8E93; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center;">SAB</div>
                    </div>
                    <div id="gridBodyAbsen" class="grid-kalender-container"></div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        document.addEventListener('touchmove', function(event) {
            const hasActiveModal = document.getElementById('kalenderAbsenModal')?.style.display === 'flex';
            if (hasActiveModal && !event.target.closest('#scrollAreaKalenderAbsen')) {
                event.preventDefault();
            }
        }, { passive: false });
    }
    
    document.body.style.overflow = 'hidden';
    window.renderKalenderAbsen();
    modal.style.display = 'flex';

    history.pushState({ id: 'modalKalenderAbsen' }, '', ''); 
    
    window.handleBackKalenderAbsen = function(e) {
        if (!e.state || e.state.id === 'dashboardRoot') {
            const m = document.getElementById('kalenderAbsenModal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = '';
            window.removeEventListener('popstate', window.handleBackKalenderAbsen);
        }
    };
    window.removeEventListener('popstate', window.handleBackKalenderAbsen);
    window.addEventListener('popstate', window.handleBackKalenderAbsen);
};

window.ubahBulanAbsenHeader = function(offset) {
    window.currentKalenderDate.setMonth(window.currentKalenderDate.getMonth() + offset);
    window.renderKalenderAbsen();
};

window.tutupKalenderAbsen = function() { 
    if (history.state && history.state.id === 'modalKalenderAbsen') {
        history.back(); 
    } else {
        const modal = document.getElementById('kalenderAbsenModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        window.removeEventListener('popstate', window.handleBackKalenderAbsen);
    }
};

// 3. LOGIKA RENDER
window.renderKalenderAbsen = async function() {
    const grid = document.getElementById('gridBodyAbsen');
    const display = document.getElementById('txtDisplayBulanTahun');
    if(!grid || !display) return;

    const bln = window.currentKalenderDate.getMonth();
    const thn = window.currentKalenderDate.getFullYear();
    const blnTahunId = window.bulanIndo[bln] + "_" + thn; 
    
    display.innerText = window.bulanIndo[bln] + " " + thn;
    grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; font-size:13px; opacity:0.5; color: var(--text-primary);">Sinkronisasi...</p>';

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;

    try {
        let listPromises = [];
        const daysInMonth = new Date(thn, bln + 1, 0).getDate();
        const daftarTglFull = [];
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

        for (let d = 1; d <= daysInMonth; d++) {
            const tempDate = new Date(thn, bln, d);
            const tglFullStr = tempDate.toLocaleDateString('id-ID', opsi); 
            daftarTglFull.push(tglFullStr);
            const dateId = tglFullStr.replace(', ', '_').replace(/\s/g, '_'); 
            listPromises.push(window.firestore.collection('data').doc(userAuth.uid).collection('absen').doc(blnTahunId).collection(dateId).doc('harian').get());
        }

        const snapshots = await Promise.all(listPromises);
        window.cacheAbsenBulanIni = {};
        snapshots.forEach((doc, index) => { if (doc.exists) window.cacheAbsenBulanIni[daftarTglFull[index]] = doc.data(); });
        
        grid.innerHTML = '';
        const firstDay = new Date(thn, bln, 1).getDay(); // 0 = Minggu
        const todayStr = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";

        // 1. TANGGAL BULAN SEBELUMNYA
        const prevMonthDays = new Date(thn, bln, 0).getDate(); 
        for (let i = 0; i < firstDay; i++) { 
            const prevDayNum = prevMonthDays - (firstDay - 1) + i;
            grid.innerHTML += `<div class="tgl-wrapper"><div class="tgl-item-global disabled-day" style="color: var(--text-primary);">${prevDayNum}</div></div>`; 
        }

        // 2. TANGGAL BULAN INI
        for (let d = 1; d <= daysInMonth; d++) {
            const tglFull = daftarTglFull[d-1];
            const dataDay = window.cacheAbsenBulanIni[tglFull] || null;
            const curDateObj = new Date(thn, bln, d);
            const isMinggu = curDateObj.getDay() === 0;
            const isToday = tglFull === todayStr;

            let classes = "tgl-item-global"; 
            if (isMinggu) classes += " minggu"; 
            if (isToday) classes += " today"; 

            let customStyle = "color: var(--text-primary);";
            let statusText = "";

            if (dataDay) {
                const s = dataDay.status;
                const colors = { 'Masuk': '#34C759', 'Off': '#8E8E93', 'Libur': '#8E8E93', 'Telat': '#FF9500' };
                // Kita HANYA mengubah warna background & text. 
                // Border CSS class bawaan (1px solid rgba) dibiarkan tetap bekerja!
                customStyle = `background-color: ${colors[s] || '#FF3B30'}; color: #FFFFFF !important;`;
                statusText = `<span style="font-size:8px; font-weight:800; text-transform:uppercase; margin-top:2px;">${s.substring(0,10)}</span>`;
            }
            
            grid.innerHTML += `<div class="tgl-wrapper"><div class="${classes}" style="${customStyle}" onclick="window.klikTglAbsen('${tglFull}')">${d}${statusText}</div></div>`;
        }

        // 3. TANGGAL BULAN BERIKUTNYA
        const totalCellsSoFar = firstDay + daysInMonth;
        const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
        for (let i = 1; i <= remainingCells; i++) {
            grid.innerHTML += `<div class="tgl-wrapper"><div class="tgl-item-global disabled-day" style="color: var(--text-primary);">${i}</div></div>`; 
        }

    } catch (e) {
        grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; font-size:13px; color:#FF3B30;">Gagal memuat data.</p>';
    }
};

// 4. LOGIKA KLIK & RINCIAN 
window.klikTglAbsen = function(tglFull) {
    const existingData = window.cacheAbsenBulanIni[tglFull] || null;
    
    const temp = tglFull.split(', ');
    const tglMurni = temp[1];
    const parts = tglMurni.split(" ");
    const clickedDate = new Date(parseInt(parts[2]), window.bulanIndo.indexOf(parts[1]), parseInt(parts[0]));
    const hariIni = new Date();
    hariIni.setHours(0,0,0,0);
    
    if (existingData) {
        window.bukaRincianTglAbsen(tglFull, existingData);
    } else {
        if (clickedDate > hariIni) return IOSAlert.show("Dilarang", "Belum bisa absen untuk masa depan.");
        if (typeof window.bukaMenuAbsen === 'function') {
            window.bukaMenuAbsen(null, tglFull, null); 
        }
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
        <div class="ios-modal-form profile-expand-anim" style="width: 310px; background: var(--card-bg); border-radius: 16px;">
            <div class="ios-modal-header" style="border-bottom: none; padding-bottom: 0;">
                <h3 style="color: var(--text-primary); font-size: 15px; margin-bottom: 4px;">Detail Absensi</h3>
                <p style="font-size: 12px; color: #8E8E93; margin: 0;">${tgl}</p>
            </div>
            
            <div class="ios-modal-body" style="padding: 15px;">
                <div style="background: rgba(142,142,147,0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(142,142,147,0.12);">
                    <div style="display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #007AFF; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-building" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">LOKASI KANTOR</span><span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${data.kantor}</span></div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #34C759; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-check-circle" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">STATUS</span><span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${data.status}</span></div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 14px 15px; gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #FF9500; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-clock" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">WAKTU INPUT</span><span style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${jamTampil}</span></div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                    <button class="btn-icon-edit" onclick="window.editAbsenTgl(event, '${tgl}')" style="background-color: rgba(0, 122, 255, 0.1); color: #007AFF; padding: 10px; border-radius: 8px; cursor: pointer; border: none;"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon-edit" onclick="window.hapusAbsenTgl(event, '${tgl}')" style="background-color: rgba(255, 59, 48, 0.1); color: #FF3B30; padding: 10px; border-radius: 8px; cursor: pointer; border: none;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
            
            <div style="display: flex; border-top: 0.5px solid rgba(142,142,147,0.2);">
                <button onclick="tutupRincianAbsen()" style="width: 100%; border: none; font-weight: 700; color: #007AFF !important; padding: 15px; background: transparent; font-size: 15px; cursor: pointer;">Tutup</button>
            </div>
        </div>`;
    rincianModal.style.display = 'flex';

    history.pushState({ id: 'rincianAbsen' }, '', '');

    window.handleBackRincianAbsen = function(e) {
        if (!e.state || e.state.id === 'modalKalenderAbsen') {
            const m = document.getElementById('rincianTglAbsenModal');
            if (m) m.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackRincianAbsen);
        }
    };
    window.addEventListener('popstate', window.handleBackRincianAbsen);
};

window.editAbsenTgl = function(event, tgl) {
    if(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const data = window.cacheAbsenBulanIni[tgl];
    if (!data) return;
    
    if (typeof window.bukaMenuAbsen === 'function') {
        window.bukaMenuAbsen(null, tgl, data);
    }
};

window.hapusAbsenTgl = function(event, tgl) {
    if(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    IOSAlert.show("Hapus Absen", "Yakin ingin menghapus absen tanggal ini?", {
        teksBatal: "Batal",
        teksTombol: "Hapus",
        onConfirm: async () => {
            const userAuth = firebase.auth().currentUser;
            if (!userAuth) return;

            const temp = tgl.split(', ');
            const tglMurni = temp[1];
            const parts = tglMurni.split(" ");
            
            const blnTahunId = parts[1] + "_" + parts[2];
            const dateId = tgl.replace(', ', '_').replace(/\s/g, '_');

            try {
                await window.firestore
                    .collection('data').doc(userAuth.uid)
                    .collection('absen').doc(blnTahunId)
                    .collection(dateId).doc('harian').delete();
                
                window.tutupRincianAbsen();
                window.renderKalenderAbsen();
                
                setTimeout(() => {
                    IOSAlert.show("Berhasil", "Absen berhasil dihapus.");
                }, 300);

            } catch (e) {
                IOSAlert.show("Gagal", "Error: " + e.message);
            }
        }
    });
};

window.tutupRincianAbsen = function() {
    if (history.state && history.state.id === 'rincianAbsen') {
        history.back();
    } else {
        const m = document.getElementById('rincianTglAbsenModal');
        if (m) m.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackRincianAbsen);
    }
};

// 5. NAVIGASI PICKER BULAN TAHUN
window.bukaBulanTahunPickerAbsen = function() {
    let picker = document.getElementById('pickerMYAbsen');
    if (!picker) { 
        picker = document.createElement('div'); 
        picker.id = 'pickerMYAbsen'; 
        picker.className = 'ios-overlay'; 
        picker.style.zIndex = '22000'; 
        document.body.appendChild(picker); 
    }
    window.renderPickerMYInner(true); 
    picker.style.display = 'flex';

    history.pushState({ id: 'pickerBulanAbsen' }, '', '');

    window.handleBackPickerBulanAbsen = function(e) {
        if (!e.state || e.state.id === 'modalKalenderAbsen') {
            const p = document.getElementById('pickerMYAbsen');
            if (p) p.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerBulanAbsen);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerBulanAbsen);
};

window.renderPickerMYInner = function(withAnim = false) {
    const thn = window.currentKalenderDate.getFullYear();
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    const picker = document.getElementById('pickerMYAbsen');
    
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; padding: 25px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="window.bukaYearPickerAbsen()" style="margin:0; cursor:pointer; color: var(--text-primary); font-size: 18px;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; align-content: center;">
                ${window.bulanIndo.map((b, i) => `<div class="grid-item ${window.currentKalenderDate.getMonth() === i ? 'active' : ''}" onclick="window.setBlnAbsen(${i})" style="padding: 14px 0; text-align: center; border-radius: 8px; font-size: 14px; font-weight: 800;">${b.substring(0,3)}</div>`).join('')}
            </div>
        </div>`;
};

window.tutupPickerBulanAbsen = function() {
    if (history.state && history.state.id === 'pickerBulanAbsen') {
        history.back();
    } else {
        const p = document.getElementById('pickerMYAbsen');
        if (p) p.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackPickerBulanAbsen);
    }
};

window.setBlnAbsen = function(i) { 
    window.currentKalenderDate.setMonth(i); 
    window.tutupPickerBulanAbsen();
    window.renderKalenderAbsen(); 
};

window.ubahThnAbsen = function(v, isYearOnly = false) { 
    window.currentKalenderDate.setFullYear(window.currentKalenderDate.getFullYear() + v); 
    if(isYearOnly) window.renderYearPickerInner(false); 
    else window.renderPickerMYInner(false); 
};

window.bukaYearPickerAbsen = function() {
    let yrPicker = document.getElementById('pickerYearOnlyAbsen');
    if (!yrPicker) { 
        yrPicker = document.createElement('div'); 
        yrPicker.id = 'pickerYearOnlyAbsen'; 
        yrPicker.className = 'ios-overlay'; 
        yrPicker.style.zIndex = '23000'; 
        document.body.appendChild(yrPicker); 
    }
    window.renderYearPickerInner(true); 
    yrPicker.style.display = 'flex';

    history.pushState({ id: 'pickerTahunAbsen' }, '', '');

    window.handleBackPickerTahunAbsen = function(e) {
        if (!e.state || e.state.id === 'pickerBulanAbsen') {
            const y = document.getElementById('pickerYearOnlyAbsen');
            if (y) y.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerTahunAbsen);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerTahunAbsen);
};

window.renderYearPickerInner = function(withAnim = false) {
    const startY = window.currentKalenderDate.getFullYear() - 4;
    const endY = startY + 11;
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    for (let y = startY; y <= endY; y++) { 
        yearHtml += `<div class="grid-item ${y === window.currentKalenderDate.getFullYear() ? 'active' : ''}" onclick="window.setThnAbsen(${y})" style="padding: 14px 0; text-align: center; border-radius: 8px; font-size: 14px; font-weight: 800;">${y}</div>`; 
    }
    
    document.getElementById('pickerYearOnlyAbsen').innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; padding: 25px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px; color: var(--text-primary);">${startY} - ${endY}</h2>
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; align-content: center;">
                ${yearHtml}
            </div>
        </div>`;
};

window.tutupPickerTahunAbsen = function() {
    if (history.state && history.state.id === 'pickerTahunAbsen') {
        history.back();
    } else {
        const y = document.getElementById('pickerYearOnlyAbsen');
        if (y) y.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackPickerTahunAbsen);
    }
};

window.setThnAbsen = function(y) { 
    window.currentKalenderDate.setFullYear(y); 
    window.tutupPickerTahunAbsen();
    window.renderPickerMYInner(false); 
};
