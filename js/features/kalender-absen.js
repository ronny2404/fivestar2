// kalender-absen.js - FIVE STAR 2 (ULTRA FAST + SMART LEVEL NAVIGATION)

window.currentKalenderDate = window.currentKalenderDate || new Date();
window.isEditModeAbsen = false;
window.cacheAbsenBulanIni = {}; 
window.bulanIndo = window.bulanIndo || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// 1. INJEKSI CSS (OPTIMASI MINGGU & HARI INI)
if (!document.getElementById('kalender-css')) {
    const style = document.createElement('style');
    style.id = 'kalender-css';
    style.innerHTML = `
        .edit-active-icon { animation: pulse-edit 0.8s infinite; color: #FF3B30 !important; }
        @keyframes pulse-edit { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        
        .tgl-item-global { 
            cursor: pointer; position: relative; transition: transform 0.2s ease, background-color 0.2s ease;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            height: 45px; border-radius: 12px; font-size: 14px; font-weight: 700; color: var(--text-color);
            border: 2px solid transparent;
        }
        .tgl-item-global:active { transform: scale(0.88); filter: brightness(0.8); }
        .tgl-item-global.minggu { color: #FF3B30 !important; }
        .tgl-item-global.today { 
            border: 2px solid #007AFF !important; 
            background-color: rgba(0, 122, 255, 0.1);
            box-shadow: inset 0 0 0 1px #007AFF;
        }
        .grid-kalender-container { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 0 13px 20px 13px; min-height: 310px; align-content: start; }
    `;
    document.head.appendChild(style);
}

// 2. MODAL UTAMA KALENDER (LEVEL 1 / ROOT)
window.bukaKalenderAbsen = function(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kalenderAbsenModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kalenderAbsenModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        modal.innerHTML = `
            <div id="kotakLengkungKalender" class="ios-modal-form profile-expand-anim" style="width: 360px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg); border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                <div class="ios-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 18px; flex-shrink: 0;">
                    <div onclick="bukaBulanTahunPickerAbsen()" style="cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <h3 id="txtDisplayBulanTahun" style="margin:0; font-size:17px; font-weight: 700; color: var(--text-primary);">Memuat...</h3>
                        <i class="fa-solid fa-chevron-down" style="font-size:10px; opacity:0.8; color: var(--text-primary);"></i>
                    </div>
                    <i id="iconEditAbsen" class="fa-solid fa-pen-to-square" onclick="toggleEditModeAbsen()" style="font-size: 20px; color: #8E8E93; cursor: pointer; padding: 5px;"></i>
                </div>
                <div class="ios-modal-body" style="padding: 10px; overflow-y: auto; flex-grow: 1;">
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; padding-bottom: 8px; border-bottom: 0.5px solid rgba(142,142,147,0.2); margin-bottom: 10px; position: sticky; top: 0; background: var(--card-bg); z-index: 5;">
                        <div style="color:#FF3B30; font-size:13px; font-weight:800;">MIN</div>
                        <div style="opacity:0.5; font-size:13px; font-weight:800; color: var(--text-primary);">SEN</div>
                        <div style="opacity:0.5; font-size:13px; font-weight:800; color: var(--text-primary);">SEL</div>
                        <div style="opacity:0.5; font-size:13px; font-weight:800; color: var(--text-primary);">RAB</div>
                        <div style="opacity:0.5; font-size:13px; font-weight:800; color: var(--text-primary);">KAM</div>
                        <div style="opacity:0.5; font-size:13px; font-weight:800; color: var(--text-primary);">JUM</div>
                        <div style="opacity:0.5; font-size:13px; font-weight:800; color: var(--text-primary);">SAB</div>
                    </div>
                    <div id="gridBodyAbsen" class="grid-kalender-container"></div>
                </div>
                <div class="ios-modal-footer" style="border-top: 0.5px solid rgba(142,142,147,0.2); flex-shrink: 0;">
                    <button class="btn-batal" onclick="tutupKalenderAbsen()" style="width: 100%; border: none; font-weight: 700; color: #007AFF !important; padding: 16px; text-align: center; background: transparent; font-size: 17px; cursor: pointer;">Tutup</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    window.resetEditModeState(); 
    window.renderKalenderAbsen();
    modal.style.display = 'flex';

    // --- LOGIKA SMART BACK BUTTON (LEVEL 1) ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 0;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'kalenderAbsen', level: myLvl, rootModal: 'kalenderAbsen' }, '', ''); 
    
    window.handleBackKalenderAbsen = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const m = document.getElementById('kalenderAbsenModal');
            if (m) m.style.display = 'none';
            window.resetEditModeState();
            window.removeEventListener('popstate', window.handleBackKalenderAbsen);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackKalenderAbsen);
    window.addEventListener('popstate', window.handleBackKalenderAbsen);
};

window.tutupKalenderAbsen = function() { 
    const modal = document.getElementById('kalenderAbsenModal');
    if (modal) {
        modal.style.display = 'none';
        window.resetEditModeState(); 
        
        if (history.state && history.state.id === 'kalenderAbsen') {
            history.back();
        }
        window.removeEventListener('popstate', window.handleBackKalenderAbsen);
    }
};

// 3. LOGIKA RENDER (SAMA)
window.renderKalenderAbsen = async function() {
    const grid = document.getElementById('gridBodyAbsen');
    const display = document.getElementById('txtDisplayBulanTahun');
    if(!grid || !display) return;

    const bln = window.currentKalenderDate.getMonth();
    const thn = window.currentKalenderDate.getFullYear();
    const blnTahunId = window.bulanIndo[bln] + "_" + thn; 
    
    display.innerText = window.bulanIndo[bln] + " " + thn;
    grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; opacity:0.5; color: var(--text-primary);">Sinkronisasi...</p>';

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
        const firstDay = new Date(thn, bln, 1).getDay();
        const todayStr = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";

        for (let i = 0; i < firstDay; i++) { grid.innerHTML += `<div></div>`; }

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
                customStyle = `background-color: ${colors[s] || '#FF3B30'};`;
                if (!isMinggu) customStyle += " color: white;";
                if (!isToday) customStyle += " border: none;";
                statusText = `<span style="font-size:7px; font-weight:800; text-transform:uppercase; margin-top:2px;">${s.substring(0,3)}</span>`;
            }

            grid.innerHTML += `<div class="${classes}" style="${customStyle}" onclick="window.klikTglAbsen('${tglFull}')">${d}${statusText}</div>`;
        }
    } catch (e) {
        grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; color:#FF3B30;">Gagal memuat data.</p>';
    }
};

// 4. LOGIKA KLIK & RINCIAN (Rincian = Level Selanjutnya)
window.klikTglAbsen = function(tglFull) {
    const existingData = window.cacheAbsenBulanIni[tglFull] || null;
    if (window.isEditModeAbsen) {
        const temp = tglFull.split(', ');
        const tglMurni = temp[1];
        const parts = tglMurni.split(" ");
        const clickedDate = new Date(parseInt(parts[2]), window.bulanIndo.indexOf(parts[1]), parseInt(parts[0]));
        const hariIni = new Date();
        hariIni.setHours(0,0,0,0);
        if (clickedDate > hariIni) return IOSAlert.show("Dilarang", "Belum bisa absen masa depan.");
        if (typeof window.bukaMenuAbsen === 'function') window.bukaMenuAbsen(null, tglFull, existingData);
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
        <div class="ios-modal-form profile-expand-anim" style="width: 310px; background: var(--card-bg); border-radius: 16px;">
            <div class="ios-modal-header" style="border-bottom: none; padding-bottom: 0;">
                <h3 style="color: var(--text-primary);">Detail Absensi</h3>
                <p style="font-size: 13px; color: #8E8E93; margin: 5px 0 0 0;">${tgl}</p>
            </div>
            <div class="ios-modal-body" style="padding: 10px 15px 20px 15px;">
                <div style="background: rgba(142,142,147,0.05); border-radius: 12px; overflow: hidden; border: 1px solid rgba(142,142,147,0.12);">
                    <div style="display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #007AFF; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-building" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">LOKASI KANTOR</span><span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${data.kantor}</span></div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #34C759; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-check-circle" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">STATUS</span><span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${data.status}</span></div>
                    </div>
                    <div style="display: flex; align-items: center; padding: 14px 15px; gap: 15px;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #FF9500; display: flex; justify-content: center; align-items: center;"><i class="fa-solid fa-clock" style="color: white; font-size: 14px;"></i></div>
                        <div style="display: flex; flex-direction: column;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700;">WAKTU INPUT</span><span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${jamTampil}</span></div>
                    </div>
                </div>
            </div>
            <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr; border-top: 0.5px solid rgba(142,142,147,0.2);">
                <button class="btn-batal" onclick="tutupRincianAbsen()" style="width: 100%; border: none; font-weight: 700; color: #007AFF !important; padding: 16px; background: transparent; font-size: 17px;">Tutup</button>
            </div>
        </div>`;
    rincianModal.style.display = 'flex';

    // Rincian Modal Leveling
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'rincianAbsen', level: myLvl }, '', '');

    window.handleBackRincianAbsen = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const m = document.getElementById('rincianTglAbsenModal');
            if (m) m.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackRincianAbsen);
        }
    };
    window.addEventListener('popstate', window.handleBackRincianAbsen);
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

// 5. NAVIGASI PICKER & UTILS (SISTEM LEVEL & UKURAN KONSISTEN)
window.toggleEditModeAbsen = function() { window.isEditModeAbsen = !window.isEditModeAbsen; window.updateIconEditUI(); };
window.resetEditModeState = function() { window.isEditModeAbsen = false; window.updateIconEditUI(); };
window.updateIconEditUI = function() {
    const icon = document.getElementById('iconEditAbsen');
    if (!icon) return;
    if (window.isEditModeAbsen) icon.classList.add('edit-active-icon');
    else icon.classList.remove('edit-active-icon');
};

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

    // Picker Bulan Leveling
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'pickerBulanAbsen', level: myLvl }, '', '');

    window.handleBackPickerBulanAbsen = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
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
    
    // KONSISTENSI UKURAN
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; height: 380px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="window.bukaYearPickerAbsen()" style="margin:0; cursor:pointer; color: var(--text-primary); font-size: 18px;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex-grow: 1; align-content: center;">
                ${window.bulanIndo.map((b, i) => `<div class="grid-item ${window.currentKalenderDate.getMonth() === i ? 'active' : ''}" onclick="window.setBlnAbsen(${i})" style="padding: 12px 0; text-align: center; border-radius: 8px;">${b.substring(0,3)}</div>`).join('')}
            </div>
            <div style="text-align: center; margin-top: auto; flex-shrink: 0; padding-top: 15px;">
                <button class="btn-text-batal" onclick="window.tutupPickerBulanAbsen()" style="width: 100%; border: none; background: transparent; color: #FF3B30; font-weight: 700; padding: 10px; font-size: 16px;">BATAL</button>
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

    // Picker Tahun Leveling
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'pickerTahunAbsen', level: myLvl }, '', '');

    window.handleBackPickerTahunAbsen = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const y = document.getElementById('pickerYearOnlyAbsen');
            if (y) y.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerTahunAbsen);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerTahunAbsen);
};

window.renderYearPickerInner = function(withAnim = false) {
    const startY = window.currentKalenderDate.getFullYear() - 4;
    const endY = startY + 11; // 12 KOTAK
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    for (let y = startY; y <= endY; y++) { 
        yearHtml += `<div class="grid-item ${y === window.currentKalenderDate.getFullYear() ? 'active' : ''}" onclick="window.setThnAbsen(${y})" style="padding: 12px 0; text-align: center; border-radius: 8px;">${y}</div>`; 
    }
    
    // KONSISTENSI UKURAN
    document.getElementById('pickerYearOnlyAbsen').innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; height: 380px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px; color: var(--text-primary);">${startY} - ${endY}</h2>
                <button class="btn-icon-edit" onclick="window.ubahThnAbsen(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex-grow: 1; align-content: center;">
                ${yearHtml}
            </div>
            <div style="text-align: center; margin-top: auto; flex-shrink: 0; padding-top: 15px;">
                <button class="btn-text-batal" onclick="window.tutupPickerTahunAbsen()" style="width: 100%; border: none; background: transparent; color: #FF3B30; font-weight: 700; padding: 10px; font-size: 16px;">BATAL</button>
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
