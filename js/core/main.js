// =============================================================================
// main.js - FIVE STAR 2 PREMIUM CORE (ULTIMATE STACKED NAVIGATION)
// =============================================================================

// Fungsi cek apakah user menggunakan iPhone/iPad
const isIos = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

window.avatarSiluet = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

function muatFotoDashboard() {
    const fotoTersimpan = localStorage.getItem('user_foto_base64') || window.avatarSiluet;
    const profilDashboard = document.querySelector('.profile-pic'); 
    if (profilDashboard) {
        profilDashboard.src = fotoTersimpan;
        profilDashboard.onerror = function() {
            this.onerror = null;
            this.src = window.avatarSiluet;
        };
    }
}

let currentDate = new Date();
let targetInputId = "";
const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function getTanggalHariIni() {
    const d = new Date();
    const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('id-ID', opsi);
}

function formatKeTanggalLengkap(dateObj) {
    const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return dateObj.toLocaleDateString('id-ID', opsi);
}

// INJEKSI CSS KHUSUS KALENDER VISUAL
if (!document.getElementById('kalender-global-style')) {
    const style = document.createElement('style');
    style.id = 'kalender-global-style';
    style.innerHTML = `
        /* PERBAIKAN ALIGNMENT & BORDER KALENDER TIAP TANGGAL */
        .grid-kalender-wrapper {
            display: grid; 
            grid-template-columns: repeat(7, 1fr); 
            text-align: center;
            gap: 8px 6px; 
            padding-top: 5px;
        }
        .header-hari-wrapper {
            display: grid; 
            grid-template-columns: repeat(7, 1fr); 
            text-align: center;
            border-bottom: 0.5px solid rgba(142,142,147,0.3); 
            padding-bottom: 12px;
            margin-bottom: 5px;
            position: sticky; top: 0; background: var(--card-bg); z-index: 5;
        }
        .header-hari-global {
            font-size: 12px; font-weight: 700; color: #8E8E93; 
            display: flex; justify-content: center; align-items: center;
        }
        .header-hari-global.minggu { color: #FF3B30; }
        
        .tgl-item-global {
            display: flex; justify-content: center; align-items: center;
            height: 38px; width: 38px; margin: 0 auto;
            border-radius: 8px; 
            border: 2px solid rgba(142, 142, 147, 0.4) !important; 
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s;
            color: var(--text-primary); /* Menyesuaikan otomatis dengan tema */
            box-sizing: border-box;
            background: var(--bg-color);
        }
        .tgl-item-global:active { transform: scale(0.9); }
        .tgl-item-global.disabled-day { 
            color: #8E8E93 !important; 
            opacity: 0.4; 
            pointer-events: none; 
            background: rgba(142,142,147,0.05); 
            border: 1px dashed rgba(142, 142, 147, 0.2) !important; 
        }
        .tgl-item-global.today { 
            color: #007AFF; 
            font-weight: 800; 
            border: 2px solid #007AFF !important; 
        }
        .tgl-item-global.selected { 
            background: #007AFF !important; 
            color: #FFFFFF !important; /* Warna putih agar selalu kontras di bg biru */
            font-weight: 800; 
            border-color: #007AFF !important; 
            box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
        }
        
        .pill-month-year {
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; 
            padding: 6px 14px; border-radius: 20px; 
            background: rgba(142,142,147,0.12);
            transition: background 0.2s;
            min-width: 140px; 
        }
        .pill-month-year:active { background: rgba(142,142,147,0.25); }
    `;
    document.head.appendChild(style);
}

// ==========================================
// 1. PREMIUM VISUAL KALENDER GLOBAL (LEVEL 1)
// ==========================================
function bukaKalenderVisual(inputId) {
    targetInputId = inputId;
    let val = document.getElementById(inputId).value;
    
    if (val && val.includes(',')) {
        let cleanDate = val.split(', ')[1]; 
        let parts = cleanDate.split(' '); 
        if (parts.length === 3) {
            currentDate = new Date(parseInt(parts[2]), bulanIndo.indexOf(parts[1]), parseInt(parts[0]));
        }
    } else {
        currentDate = new Date(); 
    }

    let modal = document.getElementById('kalenderIosModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kalenderIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '30000';
        
        modal.innerHTML = `
            <div id="kotakLengkungKalenderGlobal" class="ios-modal-form profile-expand-anim" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg); border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                
                <div class="ios-modal-header" style="display: flex; flex-direction: column; align-items: center; padding: 20px 15px 15px 15px; flex-shrink: 0; border-bottom: none;">
                    <h2 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 700; color: #8E8E93; letter-spacing: 1px; text-align: center; width: 100%;">PILIH TANGGAL</h2>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0 5px;">
                        <button onclick="ubahBulanGlobalHeader(-1)" style="background: transparent; border: none; color: #007AFF; font-size: 20px; cursor: pointer; padding: 5px; width: 40px; display: flex; justify-content: flex-start;"><i class="fa-solid fa-chevron-left"></i></button>
                        
                        <div onclick="bukaBulanTahunPickerGlobal()" class="pill-month-year">
                            <span id="txtDisplayBulanTahunGlobal" style="font-size:16px; font-weight: 700; color: var(--text-primary); text-align: center;">Memuat...</span>
                            <i class="fa-solid fa-caret-down" style="font-size:12px; color: var(--text-primary); opacity: 0.7;"></i>
                        </div>
                        
                        <button onclick="ubahBulanGlobalHeader(1)" style="background: transparent; border: none; color: #007AFF; font-size: 20px; cursor: pointer; padding: 5px; width: 40px; display: flex; justify-content: flex-end;"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
                
                <div class="ios-modal-body" id="kalenderScrollArea" style="padding: 0 15px 15px 15px; overflow-y: auto; flex-grow: 1;">
                    <div class="header-hari-wrapper">
                        <div class="header-hari-global minggu">MIN</div>
                        <div class="header-hari-global">SEN</div>
                        <div class="header-hari-global">SEL</div>
                        <div class="header-hari-global">RAB</div>
                        <div class="header-hari-global">KAM</div>
                        <div class="header-hari-global">JUM</div>
                        <div class="header-hari-global">SAB</div>
                    </div>
                    <div id="gridBodyKalenderGlobal" class="grid-kalender-wrapper" style="min-height: 250px; align-content: start;"></div>
                </div>

                <div class="ios-modal-footer" style="border-top: 0.5px solid rgba(142,142,147,0.2); flex-shrink: 0; padding: 0;">
                    <button class="btn-batal" onclick="tutupKalenderVisual()" style="width: 100%; border: none; font-weight: 600; color: #007AFF !important; padding: 16px; text-align: center; background: transparent; font-size: 17px; cursor: pointer;">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderKalenderVisual();
    modal.style.display = 'flex';

    history.pushState({ id: 'modalKalenderVisualGlobal' }, '', '');

    window.handleBackKalenderVisual = function(e) {
        if (!e.state || (e.state.id !== 'modalKalenderVisualGlobal' && e.state.id !== 'pickerMYGlobal' && e.state.id !== 'pickerYearOnlyGlobal')) {
            const m = document.getElementById('kalenderIosModal');
            if (m) m.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackKalenderVisual);
        }
    };
    window.removeEventListener('popstate', window.handleBackKalenderVisual);
    window.addEventListener('popstate', window.handleBackKalenderVisual);
}

function ubahBulanGlobalHeader(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderKalenderVisual();
}

function renderKalenderVisual() {
    const grid = document.getElementById('gridBodyKalenderGlobal');
    const display = document.getElementById('txtDisplayBulanTahunGlobal');
    if(!grid || !display) return;

    const bln = currentDate.getMonth();
    const thn = currentDate.getFullYear();
    display.innerText = bulanIndo[bln] + " " + thn;
    grid.innerHTML = '';

    const firstDay = new Date(thn, bln, 1).getDay(); // 0 = Minggu
    const daysInMonth = new Date(thn, bln + 1, 0).getDate();

    let targetVal = document.getElementById(targetInputId)?.value || "";
    const todayStr = getTanggalHariIni(); 

    // 1. FILLER BULAN SEBELUMNYA
    const prevMonthDays = new Date(thn, bln, 0).getDate(); 
    for (let i = 0; i < firstDay; i++) { 
        const prevDayNum = prevMonthDays - (firstDay - 1) + i;
        grid.innerHTML += `<div class="tgl-item-global disabled-day">${prevDayNum}</div>`; 
    }

    // 2. TANGGAL BULAN INI
    for (let d = 1; d <= daysInMonth; d++) {
        const tempDate = new Date(thn, bln, d);
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const tglFullStr = tempDate.toLocaleDateString('id-ID', opsi); 

        const dayOfWeek = (firstDay + d - 1) % 7;
        let classes = "tgl-item-global";
        if (dayOfWeek === 0) classes += " minggu"; 
        if (tglFullStr === todayStr) classes += " today"; 
        if (tglFullStr === targetVal) classes += " selected"; 

        grid.innerHTML += `<div class="${classes}" onclick="pilihTanggal(${d}, ${bln}, ${thn})">${d}</div>`;
    }

    // 3. FILLER BULAN DEPAN
    const totalCellsSoFar = firstDay + daysInMonth;
    const remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        grid.innerHTML += `<div class="tgl-item-global disabled-day">${i}</div>`; 
    }
}

function pilihTanggal(d, bln, thn) {
    const input = document.getElementById(targetInputId);
    if (input) {
        const dateObj = new Date(thn, bln, d);
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        input.value = dateObj.toLocaleDateString('id-ID', opsi); 
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    tutupKalenderVisual();
}

function tutupKalenderVisual() {
    if (history.state && history.state.id === 'modalKalenderVisualGlobal') {
        history.back(); // Memicu popstate dengan rapi
    } else {
        const m = document.getElementById('kalenderIosModal');
        if(m) m.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackKalenderVisual);
    }
}


// ==========================================
// 2. PICKER BULAN GLOBAL (LEVEL 2)
// ==========================================
function bukaBulanTahunPickerGlobal() {
    let picker = document.getElementById('pickerMYGlobal');
    if (!picker) {
        picker = document.createElement('div');
        picker.id = 'pickerMYGlobal';
        picker.className = 'ios-overlay';
        picker.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); z-index: 31000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);`;
        document.body.appendChild(picker);
    }
    renderPickerMYGlobalInner(true);
    picker.style.display = 'flex';

    // --- STEP NAVIGATION LOGIC ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'pickerMYGlobal', level: myLvl }, '', '');

    window.handleBackPickerMYGlobal = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const p = document.getElementById('pickerMYGlobal');
            if (p) p.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerMYGlobal);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerMYGlobal);
}

function renderPickerMYGlobalInner(withAnim = false) {
    const thn = currentDate.getFullYear();
    const picker = document.getElementById('pickerMYGlobal');
    if(!picker) return;
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    // KONSISTENSI: Width 320px, Height 380px, Grid 3 kolom
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; height: 380px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="ubahThnGlobal(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="bukaYearPickerGlobal()" style="margin:0; cursor:pointer; color: var(--text-primary); font-size: 18px;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="ubahThnGlobal(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex-grow: 1; align-content: center;">
                ${bulanIndo.map((b, i) => `
                    <div class="grid-item ${currentDate.getMonth() === i ? 'active' : ''}" 
                         onclick="setBlnGlobal(${i})" style="padding: 12px 0; text-align: center; border-radius: 8px;">${b.substring(0,3)}</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: auto; flex-shrink: 0; padding-top: 15px;">
                <button class="btn-text-batal" onclick="tutupPickerMYGlobal()" style="width: 100%; border: none; background: transparent; color: #FF3B30; font-weight: 700; padding: 10px; font-size: 16px;">BATAL</button>
            </div>
        </div>
    `;
}

function tutupPickerMYGlobal() {
    if (history.state && history.state.id === 'pickerMYGlobal') {
        history.back();
    } else {
        const p = document.getElementById('pickerMYGlobal');
        if(p) p.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackPickerMYGlobal);
    }
}

function setBlnGlobal(i) {
    currentDate.setMonth(i);
    tutupPickerMYGlobal(); // Tutup bulan (mundur 1 step)
    renderKalenderVisual(); // Refresh kalender yang ada di baliknya
}

function ubahThnGlobal(v, isYearOnly = false) {
    currentDate.setFullYear(currentDate.getFullYear() + v);
    if(isYearOnly) renderYearPickerGlobalInner(false);
    else renderPickerMYGlobalInner(false);
}


// ==========================================
// 3. PICKER TAHUN GLOBAL (LEVEL 3)
// ==========================================
function bukaYearPickerGlobal() {
    let yrPicker = document.getElementById('pickerYearOnlyGlobal');
    if (!yrPicker) {
        yrPicker = document.createElement('div');
        yrPicker.id = 'pickerYearOnlyGlobal';
        yrPicker.className = 'ios-overlay';
        yrPicker.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); z-index: 32000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);`;
        document.body.appendChild(yrPicker);
    }
    renderYearPickerGlobalInner(true);
    yrPicker.style.display = 'flex';

    // --- STEP NAVIGATION LOGIC ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'pickerYearOnlyGlobal', level: myLvl }, '', '');

    window.handleBackPickerYearOnlyGlobal = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const y = document.getElementById('pickerYearOnlyGlobal');
            if (y) y.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerYearOnlyGlobal);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerYearOnlyGlobal);
}

function renderYearPickerGlobalInner(withAnim = false) {
    const startY = currentDate.getFullYear() - 4;
    const endY = startY + 11; // 12 Kotak (4 Baris x 3 Kolom)
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';

    for (let y = startY; y <= endY; y++) {
        yearHtml += `<div class="grid-item ${y === currentDate.getFullYear() ? 'active' : ''}" onclick="setThnGlobal(${y})" style="padding: 12px 0; text-align: center; border-radius: 8px;">${y}</div>`;
    }

    const yrPicker = document.getElementById('pickerYearOnlyGlobal');
    if(!yrPicker) return;

    // KONSISTENSI: Sama persis dengan picker bulan (Width 320, Height 380, Grid 3 kolom)
    yrPicker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; height: 380px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="ubahThnGlobal(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px; color: var(--text-primary);">${startY} - ${endY}</h2>
                <button class="btn-icon-edit" onclick="ubahThnGlobal(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex-grow: 1; align-content: center;">
                ${yearHtml}
            </div>
            <div style="text-align: center; margin-top: auto; flex-shrink: 0; padding-top: 15px;">
                <button class="btn-text-batal" onclick="tutupPickerYearOnlyGlobal()" style="width: 100%; border: none; background: transparent; color: #FF3B30; font-weight: 700; padding: 10px; font-size: 16px;">BATAL</button>
            </div>
        </div>
    `;
}

function tutupPickerYearOnlyGlobal() {
    if (history.state && history.state.id === 'pickerYearOnlyGlobal') {
        history.back(); 
    } else {
        const y = document.getElementById('pickerYearOnlyGlobal');
        if(y) y.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackPickerYearOnlyGlobal);
    }
}

function setThnGlobal(y) {
    currentDate.setFullYear(y);
    tutupPickerYearOnlyGlobal(); // Tutup tahun (mundur 1 step)
    renderPickerMYGlobalInner(false); // Refresh bulan yang ada di baliknya
}

// ==========================================
// FUNGSI GLOBAL LAINNYA & IOSAlert
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    muatFotoDashboard(); 
    muatDataHeader();
});

window.onfocus = muatFotoDashboard;

function bukaIosPicker(inputId, judul, opsiArray) {
    let pickerOverlay = document.getElementById('iosPickerOverlay');
    if (!pickerOverlay) {
        pickerOverlay = document.createElement('div');
        pickerOverlay.id = 'iosPickerOverlay';
        pickerOverlay.className = 'calendar-popup'; 
        document.body.appendChild(pickerOverlay);
    }

    let opsiHtml = opsiArray.map(item => 
        `<div class="picker-list-item-center" onclick="pilihIosOption('${inputId}', '${item}')">${item}</div>`
    ).join('');

    pickerOverlay.innerHTML = `
        <div class="ios-center-popup">
            <div class="ios-popup-header">${judul}</div>
            <div class="ios-popup-body">${opsiHtml}</div>
            <div class="ios-popup-footer"><button onclick="tutupIosPicker()">BATAL</button></div>
        </div>
    `;
    pickerOverlay.style.display = 'flex';
}

function pilihIosOption(inputId, nilai) {
    document.getElementById(inputId).value = nilai;
    tutupIosPicker();
}

function tutupIosPicker() {
    document.getElementById('iosPickerOverlay').style.display = 'none';
}

function formatRupiah(input) {
    let angka = input.value.replace(/[^0-9]/g, '');
    input.value = angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ==========================================
// FIX SCROLL JUMPY & MODAL SCROLLING
// ==========================================
document.addEventListener('touchmove', function(event) {
    // 1. Tambahkan class/id area yang BOLEH di-scroll di sini
    const isScrollable = event.target.closest('.ios-popup-body') || 
                         event.target.closest('.ios-modal-body') || 
                         event.target.closest('#containerListKerja') || 
                         event.target.closest('.calendar-grid') || 
                         event.target.closest('.picker-grid') ||
                         event.target.closest('#areaHasilRincian') ||
                         event.target.closest('#areaListEdit') ||
                         event.target.closest('#areaFormEdit') ||
                         event.target.closest('#areaHasilGaji') ||
                         event.target.closest('#kalenderScrollArea'); // <-- Ini id baru untuk body kalender visual 
                         
    // 2. Cek apakah ADA modal/popup yang sedang terbuka?
    const hasActiveModal = document.querySelector('.ios-overlay[style*="display: flex"]');
    
    // 3. Hanya blokir scroll JIKA modal sedang terbuka DAN yang disentuh bukan area scrollable
    if (hasActiveModal && !isScrollable) {
        event.preventDefault();
    }
}, { passive: false });

const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    const themeIcon = themeToggleBtn.querySelector('i');
    const body = document.body;
    const savedTheme = localStorage.getItem('app-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        body.classList.add('dark-theme');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('app-theme', 'dark');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('app-theme', 'light');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

// ==========================================
// IOSAlert - NATIVE LOOK & 50:50 BUTTON RATIO
// ==========================================
const IOSAlert = {
    show: function(judul, pesan, opsi = {}) {
        const existing = document.getElementById('iosAlertOverlay');
        if (existing) existing.remove();

        const teksTombol = opsi.teksTombol || "OK";
        const teksBatal = opsi.teksBatal || null; 
        const onConfirm = opsi.onConfirm || null;
        const onCancel = opsi.onCancel || null;
        const durasi = opsi.durasi || 2000; 

        // State Inheritance pada IOSAlert (Leveling)
        const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
        const myLvl = baseLvl + 1;
        history.pushState({ id: 'iosAlert', level: myLvl }, '', '');

        const overlay = document.createElement('div');
        overlay.id = 'iosAlertOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.4); z-index: 999999;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.2s ease;
        `;

        const isDark = document.body.classList.contains('dark-theme');
        const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
        const bgColor = isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)';
        const isToast = !teksBatal && !onConfirm;

        let buttonHTML = '';
        if (!isToast) {
            buttonHTML = `
                <div style="border-top: 1px solid ${borderColor}; display: flex; width: 100%;">
                    ${teksBatal ? `<button id="iosAlertCancel" style="flex: 1; width: 50%; padding: 13px 0; background: transparent; border: none; border-right: 1px solid ${borderColor}; color: #007AFF; font-size: 17px; cursor: pointer;">${teksBatal}</button>` : ''}
                    <button id="iosAlertConfirm" style="flex: 1; width: ${teksBatal ? '50%' : '100%'}; padding: 13px 0; background: transparent; border: none; color: #007AFF; font-size: 17px; font-weight: 600; cursor: pointer;">${teksTombol}</button>
                </div>
            `;
        }

        overlay.innerHTML = `
            <div style="width: 270px; background: ${bgColor}; backdrop-filter: blur(20px); border-radius: 14px; text-align: center; overflow: hidden; transform: scale(1.1); transition: transform 0.2s cubic-bezier(0.1, 0.7, 0.1, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="padding: 20px 16px;">
                    <h3 style="margin: 0 0 5px 0; font-size: 17px; font-weight: 600; color: var(--text-primary);">${judul}</h3>
                    <p style="margin: 0; font-size: 13px; color: var(--text-primary); opacity: 0.9;">${pesan}</p>
                </div>
                ${buttonHTML}
            </div>
        `;

        document.body.appendChild(overlay);

        const tutupAlertInternal = () => {
            overlay.style.opacity = '0';
            const card = overlay.querySelector('div');
            if (card) card.style.transform = 'scale(0.9)';
            window.removeEventListener('popstate', handleBackHP);
            setTimeout(() => overlay.remove(), 250);
        };

        const handleBackHP = (e) => {
            const currentLvl = e.state ? (e.state.level || 0) : 0;
            if (currentLvl < myLvl) tutupAlertInternal();
        };
        window.addEventListener('popstate', handleBackHP);

        requestAnimationFrame(() => { overlay.style.opacity = '1'; overlay.querySelector('div').style.transform = 'scale(1)'; });

        if (!isToast) {
            document.getElementById('iosAlertConfirm').onclick = () => { history.back(); if (onConfirm) onConfirm(); };
            if (teksBatal) document.getElementById('iosAlertCancel').onclick = () => { history.back(); if (onCancel) onCancel(); };
        } else {
            setTimeout(() => { if (history.state && history.state.id === 'iosAlert') history.back(); }, durasi);
        }
    }
};

window.muatDataHeader = function() {
    const elNama = document.getElementById('displayNamaLengkap');
    const elUser = document.getElementById('displayUsername');
    if (!elNama && !elUser) return;

    // 1. TAHAP PERTAMA: AMBIL DARI MEMORI HP DULU (Tampil Instan 0 Detik)
    const cachedNama = localStorage.getItem('nama_user');
    const cachedUser = localStorage.getItem('username');
    
    if (cachedNama && elNama) elNama.innerText = cachedNama.toUpperCase();
    if (cachedUser && elUser) elUser.innerText = '@' + cachedUser.toLowerCase();

    // 2. TAHAP KEDUA: SINKRONISASI DATABASE DI BACKGROUND
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) return;

        const userRef = window.db.ref(user.uid);
        userRef.on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const nama = data.nama || 'User';
            const username = data.username || 'username';

            if (elNama) elNama.innerText = nama.toUpperCase();
            if (elUser) elUser.innerText = '@' + username.toLowerCase();

            localStorage.setItem('nama_user', nama);
            localStorage.setItem('username', username);
        });
    });
};

function updateWaktu() {
    const sekarang = new Date();
    const displayJam = String(sekarang.getHours()).padStart(2, '0') + ':' + String(sekarang.getMinutes()).padStart(2, '0') + ':' + String(sekarang.getSeconds()).padStart(2, '0');
    const displayTanggal = sekarang.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const elJam = document.getElementById('jam-sekarang');
    const elTgl = document.getElementById('tanggal-sekarang');

    if (elJam) elJam.innerText = displayJam;
    if (elTgl) elTgl.innerText = displayTanggal;
}

setInterval(updateWaktu, 1000);
updateWaktu();
