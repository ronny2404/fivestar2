// pengaturan.js - ULTRA FULL VERSION (Anti-Blink, Zoom Anim, Robust Back Navigation)
// Dikembangkan oleh: RONNY (2026)

let loginType = localStorage.getItem('loginType') || 'manual'; 

// --- 1. CORE MODAL ENGINE & CSS ANIMATIONS ---

if (!document.getElementById('pengaturan-anim-style')) {
    const style = document.createElement('style');
    style.id = 'pengaturan-anim-style';
    style.innerHTML = `
        /* ANIMASI POP-UP BUKAN SLIDE */
        @keyframes iosPopupZoom {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .modal-zoom-linear {
            animation: iosPopupZoom 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .list-group-ios {
            background: rgba(142,142,147,0.05); 
            border-radius: 12px; 
            overflow: hidden; 
            border: 1px solid rgba(142,142,147,0.12); 
            margin-bottom: 20px;
        }
        .btn-footer-center {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            font-weight: 700 !important;
            color: #007AFF !important;
            background: transparent;
            border: none;
            padding: 15px;
            font-size: 17px;
            cursor: pointer;
        }
        .text-loading { opacity: 0.5; font-size: 13px; font-style: italic; }
        
        /* Skeleton Container Fix Size (Mencegah Kedip/Joget) */
        .fixed-height-skeleton {
            min-height: 250px;
            display: flex;
            flex-direction: column;
        }
    `;
    document.head.appendChild(style);
}

// Global State untuk Navigasi
window.currentSettingsLevel = 0; 
window.currentActiveSubMenu = ""; 

// Fungsi Utama Panggilan dari Dashboard
function bukaMenuPengaturan(event) {
    if (event) event.preventDefault(); // Mencegah reload halaman
    
    let modal = document.getElementById('pengaturanModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pengaturanModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '25000';
        
        modal.innerHTML = `
            <div id="kotakLengkungPengaturan" class="ios-modal-form modal-zoom-linear" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg); border-radius: 20px;">
                <div class="ios-modal-header" style="flex-shrink: 0; border-bottom: 0.5px solid rgba(142,142,147,0.2);">
                    <h3 id="judulPengaturan" style="margin:0; color: var(--text-primary);">Pengaturan</h3>
                </div>
                <div id="kontenPengaturan" class="ios-modal-body" style="padding: 20px 15px; display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;"></div>
                <div id="footerPengaturan" class="ios-modal-footer-grid" style="flex-shrink: 0; border-top: 0.5px solid rgba(142,142,147,0.2);"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    
    // --- MANAJEMEN RIWAYAT (PENTING) ---
    // Pastikan halaman dashboard saat ini memiliki 'identitas' agar kita tahu saat kembali
    if (!history.state || history.state.id !== 'dashboardRoot') {
        history.replaceState({ id: 'dashboardRoot' }, '', '');
    }

    // Dorong state baru untuk menu Pengaturan (Level 1)
    history.pushState({ id: 'pengaturan_main', menu: 'main' }, '', '');

    // Gunakan listener anti-duplikat
    window.removeEventListener('popstate', handleBackSmartPengaturan);
    window.addEventListener('popstate', handleBackSmartPengaturan);

    renderMenuPengaturan(true);
}

// Handler Navigasi khusus Pengaturan
function handleBackSmartPengaturan(e) {
    const modal = document.getElementById('pengaturanModal');
    if (!modal || modal.style.display === 'none') return;

    const state = e.state;

    // Abaikan state dari picker lain (jika sedang terbuka)
    if (state && (state.id === 'kalender_modal' || state.id === 'pickerTahun' || state.id === 'pickerTahunAbsen' || state.id === 'pickerTahunGaji')) {
        return; 
    }

    // Jika user menekan BACK hingga state menjadi DashboardRoot atau null (batas aplikasi)
    if (!state || state.id === 'dashboardRoot' || state.id === 'modalProfil') {
        modal.style.display = 'none';
        window.removeEventListener('popstate', handleBackSmartPengaturan);
        eksekusiRefreshSetelahTutup();
        return;
    }

    // Navigasi Internal Pengaturan (Anti-Blink & Anti-Reload)
    if (state.id === 'pengaturan_main') {
        if (window.currentActiveSubMenu !== 'main') {
            renderMenuPengaturan(true);
        }
    } else if (state.id === 'pengaturan_sub') {
        if (window.currentActiveSubMenu !== state.menu) {
            if (state.menu === 'datadiri') renderDataDiri(true);
            else if (state.menu === 'akun') renderSubMenuAkun(true);
            else if (state.menu === 'tema') renderTema(true);
            else if (state.menu === 'info') renderInformasiAplikasi(true);
        }
    } else if (state.id === 'pengaturan_form') {
        if (window.currentActiveSubMenu !== state.menu) {
            if (state.menu === 'form_user') renderGantiUsername(document.getElementById('setNewUser') ? document.getElementById('setNewUser').value : '');
            else if (state.menu === 'form_email') renderGantiEmail();
            else if (state.menu === 'form_pass') renderPengaturanPassword("Ubah Kata Sandi");
            else if (state.menu === 'form_hapus') renderHapusAkun(true);
        }
    }
}

function tutupPengaturan() {
    const modal = document.getElementById('pengaturanModal');
    if (history.state && history.state.id && history.state.id.startsWith('pengaturan')) {
        // Jika masih di dalam menu pengaturan, panggil back HP saja
        history.back();
    } else {
        // Jika sudah di akar, tutup manual
        if (modal) modal.style.display = 'none';
        window.removeEventListener('popstate', handleBackSmartPengaturan);
        eksekusiRefreshSetelahTutup();
    }
}

function eksekusiRefreshSetelahTutup() {
    window.currentSettingsLevel = 0;
    window.currentActiveSubMenu = "";
    if (typeof muatDataHeader === 'function') muatDataHeader(); 
    if (typeof refreshDataProfilUI === 'function') refreshDataProfilUI();
}

function gantiLayar(judul, htmlKonten, htmlFooter, animasikan = true) {
    const kotak = document.getElementById('kotakLengkungPengaturan');
    const displayJudul = document.getElementById('judulPengaturan');
    if (displayJudul) displayJudul.innerText = judul;
    
    if (kotak && animasikan) {
        kotak.classList.remove('modal-zoom-linear');
        void kotak.offsetWidth; 
        kotak.classList.add('modal-zoom-linear');
    }

    const konten = document.getElementById('kontenPengaturan');
    const footer = document.getElementById('footerPengaturan');
    if (konten) konten.innerHTML = htmlKonten;
    if (footer) footer.innerHTML = htmlFooter;
}

// --- 2. STYLES UI COMPONENTS ---
const listStyle = "display: flex; justify-content: space-between; align-items: center; padding: 16px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); cursor: pointer; color: var(--text-primary); font-size: 15px; font-weight: 600;";
const listStyleLast = "display: flex; justify-content: space-between; align-items: center; padding: 16px 15px; cursor: pointer; color: var(--text-primary); font-size: 15px; font-weight: 600;";
const iconStyle = "color: #C4C4C6; font-size: 14px;"; 

// --- 3. MENU UTAMA (LEVEL 1) ---
function renderMenuPengaturan(isBackNav = false) {
    window.currentActiveSubMenu = "main";
    if (!isBackNav) {
        history.pushState({ id: 'pengaturan_main', menu: 'main' }, '', '');
    }
    
    const htmlKonten = `
        <div class="fixed-height-skeleton">
            <div class="list-group-ios">
                <div onclick="renderSubMenuAkun()" style="${listStyle}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 28px; height: 28px; background: #007AFF; border-radius: 7px; display: flex; justify-content: center; align-items: center; color: white;"><i class="fa-solid fa-user-shield"></i></div>
                        <span>Pengaturan Akun</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>
                
                <div onclick="renderDataDiri()" style="${listStyle}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 28px; height: 28px; background: #34C759; border-radius: 7px; display: flex; justify-content: center; align-items: center; color: white;"><i class="fa-solid fa-id-card"></i></div>
                        <span>Data Diri Lengkap</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>
                
                <div onclick="renderTema()" style="${listStyle}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 28px; height: 28px; background: #5856D6; border-radius: 7px; display: flex; justify-content: center; align-items: center; color: white;"><i class="fa-solid fa-moon"></i></div>
                        <span>Mode Tema</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>

                <div onclick="renderInformasiAplikasi()" style="${listStyleLast}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 28px; height: 28px; background: #8E8E93; border-radius: 7px; display: flex; justify-content: center; align-items: center; color: white;"><i class="fa-solid fa-circle-info"></i></div>
                        <span>Informasi Aplikasi</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>
            </div>
            <button onclick="prosesLogout()" style="width: 100%; padding: 15px; border-radius: 12px; background: rgba(255,59,48,0.1); color: #FF3B30; border: 1px solid rgba(255,59,48,0.2); font-weight: 600; font-size: 16px; cursor: pointer; margin-top: auto;">Keluar dari Aplikasi</button>
        </div>
    `;
    const htmlFooter = `<button class="btn-footer-center" onclick="tutupPengaturan()">Tutup</button>`;
    gantiLayar('Pengaturan', htmlKonten, htmlFooter, true); 
}

// --- 4. DATA DIRI (LEVEL 2) ---
async function renderDataDiri(isBackNav = false) {
    window.currentActiveSubMenu = "datadiri";
    if (!isBackNav) {
        history.pushState({ id: 'pengaturan_sub', menu: 'datadiri' }, '', '');
    }
    window.currentSettingsLevel = 2;

    const htmlKonten = `
        <div class="fixed-height-skeleton">
            <div class="input-group">
                <label>Nama Lengkap</label>
                <input type="text" id="setDataNama" placeholder="Memuat data..." oninput="this.value = this.value.toUpperCase()" class="custom-box-input">
            </div>
            <div class="input-group">
                <label>Tanggal Lahir</label>
                <input type="text" id="setDataDob" readonly placeholder="Pilih Tanggal..."
                    onclick="bukaKalenderVisual('setDataDob')" style="cursor: pointer; font-weight: 600; text-align: center;" class="custom-box-input">
            </div>
            <div class="input-group">
                <label>Jenis Kelamin</label>
                <div class="grid-picker" id="gridGender" style="grid-template-columns: 1fr 1fr;">
                    <div class="grid-item active" data-val="Laki-laki" onclick="pilihGridSetting(this, 'Laki-laki')">Laki-laki</div>
                    <div class="grid-item" data-val="Perempuan" onclick="pilihGridSetting(this, 'Perempuan')">Perempuan</div>
                </div>
                <input type="hidden" id="setDataJK" value="Laki-laki">
            </div>
            <div class="input-group">
                <label>No HP</label>
                <input type="tel" id="setDataHp" placeholder="Memuat data..." inputmode="numeric" class="custom-box-input">
            </div>
            <div class="input-group">
                <label>Alamat</label>
                <textarea id="setDataAlamat" rows="3" placeholder="Memuat data..." style="resize:none;" class="custom-box-input"></textarea>
            </div>
        </div>
    `;
    const htmlFooter = `
        <button class="btn-batal" onclick="history.back()">Kembali</button>
        <button class="btn-simpan" id="btnSimpanData" onclick="simpanDataDiri()">Simpan</button>
    `;
    
    gantiLayar('Data Diri', htmlKonten, htmlFooter, true);

    const userAuth = firebase.auth().currentUser;
    if (userAuth && window.db) {
        try {
            const snap = await window.db.ref(userAuth.uid).once('value');
            const data = snap.val() || {};
            document.getElementById('setDataNama').value = data.nama || '';
            document.getElementById('setDataDob').value = data.tgl_lahir || '';
            document.getElementById('setDataHp').value = data.hp || '';
            document.getElementById('setDataAlamat').value = data.alamat || '';
            const jk = data.gender || 'Laki-laki';
            document.getElementById('setDataJK').value = jk;
            document.querySelectorAll('#gridGender .grid-item').forEach(i => {
                i.classList.toggle('active', i.dataset.val === jk);
            });
        } catch(e) { console.error("Gagal load data diri"); }
    }
}

function pilihGridSetting(elemen, nilai) {
    elemen.parentElement.querySelectorAll('.grid-item').forEach(i => i.classList.remove('active'));
    elemen.classList.add('active');
    document.getElementById('setDataJK').value = nilai;
}

async function simpanDataDiri() {
    const userAuth = firebase.auth().currentUser;
    const btnSimpan = document.getElementById('btnSimpanData');
    if (btnSimpan) btnSimpan.innerText = "Menyimpan...";
    
    const updateData = {
        nama: document.getElementById('setDataNama').value,
        tgl_lahir: document.getElementById('setDataDob').value,
        gender: document.getElementById('setDataJK').value,
        hp: document.getElementById('setDataHp').value,
        alamat: document.getElementById('setDataAlamat').value,
        terakhir_update: new Date().toISOString()
    };
    
    try {
        await window.db.ref(userAuth.uid).update(updateData);
        
        localStorage.setItem('nama_user', updateData.nama);
        const profilLokal = JSON.parse(localStorage.getItem('user_profile') || '{}');
        Object.assign(profilLokal, updateData);
        localStorage.setItem('user_profile', JSON.stringify(profilLokal));
        
        IOSAlert.show("Berhasil", "Data diri diperbarui.", { onConfirm: () => history.back() });
    } catch (e) { 
        if (btnSimpan) btnSimpan.innerText = "Simpan";
        IOSAlert.show("Gagal", e.message);
    }
}

// --- 5. PENGATURAN AKUN (LEVEL 2) ---
async function renderSubMenuAkun(isBackNav = false) {
    window.currentActiveSubMenu = "akun";
    if (!isBackNav) {
        history.pushState({ id: 'pengaturan_sub', menu: 'akun' }, '', '');
    }
    window.currentSettingsLevel = 2;
    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;
    
    const htmlKonten = `
        <div class="fixed-height-skeleton">
            <div class="list-group-ios" style="margin-bottom: 25px;">
                <div id="btnGoUsername" style="${listStyle}">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 11px; color: #8E8E93; text-transform:uppercase; font-weight:700;">Username Sistem</span>
                        <span id="txtSetUser" class="text-loading">Memuat...</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>
                <div onclick="renderGantiEmail()" style="${listStyle}">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 11px; color: #8E8E93; text-transform:uppercase; font-weight:700;">Email Akun</span>
                        <span>${userAuth.email}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>
                <div id="btnGoPass" style="${listStyleLast}">
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 11px; color: #8E8E93; text-transform:uppercase; font-weight:700;">Kata Sandi</span>
                        <span id="txtSetPass" class="text-loading">Memuat...</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
                </div>
            </div>
            <button onclick="renderHapusAkun()" style="width: 100%; padding: 15px; border-radius: 12px; background: rgba(255,59,48,0.1); color: #FF3B30; border: 1px solid rgba(255,59,48,0.2); font-weight: 600; font-size: 16px; margin-top: auto;">Hapus Akun Permanen</button>
        </div>
    `;
    gantiLayar('Pengaturan Akun', htmlKonten, `<button class="btn-batal btn-footer-center" onclick="history.back()">Kembali</button>`, true);
    
    if (window.db) {
        try {
            const snap = await window.db.ref(userAuth.uid).once('value');
            const data = snap.val() || {};
            const currUser = data.username || localStorage.getItem('username') || 'user';
            const teksPass = data.password ? "Ubah Kata Sandi" : "Buat Kata Sandi";
            
            const elU = document.getElementById('txtSetUser');
            if(elU) { elU.innerText = "@" + currUser; elU.classList.remove('text-loading'); }
            const elP = document.getElementById('txtSetPass');
            if(elP) { elP.innerText = teksPass; elP.classList.remove('text-loading'); }
            
            document.getElementById('btnGoUsername').onclick = () => renderGantiUsername(currUser);
            document.getElementById('btnGoPass').onclick = () => renderPengaturanPassword(teksPass);
        } catch(e) { console.log(e); }
    }
}

// --- 6. FORMS (LEVEL 3) ---
function renderGantiUsername(oldUser) {
    window.currentActiveSubMenu = "form_user";
    history.pushState({ id: 'pengaturan_form', menu: 'form_user' }, '', '');
    window.currentSettingsLevel = 3;
    gantiLayar('Ganti Username', `
        <div class="fixed-height-skeleton">
            <div class="input-group">
                <label>Username Baru</label>
                <input type="text" id="setNewUser" value="${oldUser}" class="custom-box-input" style="text-transform: lowercase;">
                <p style="font-size: 11px; color: #8E8E93; margin-top: 8px;">Gunakan username unik untuk identitas sistem.</p>
            </div>
        </div>
    `, `<button class="btn-batal" onclick="history.back()">Batal</button><button class="btn-simpan" onclick="simpanUsernameBaru()">Simpan</button>`, true);
}

async function simpanUsernameBaru() {
    const userAuth = firebase.auth().currentUser;
    const userBaru = document.getElementById('setNewUser').value.trim().toLowerCase();
    if (userBaru.length < 3) return IOSAlert.show("Gagal", "Username minimal 3 karakter!");
    try {
        await window.db.ref(userAuth.uid).update({ username: userBaru });
        localStorage.setItem('username', userBaru);
        IOSAlert.show("Berhasil", "Username diubah.", { onConfirm: () => history.back() });
    } catch (e) { IOSAlert.show("Gagal", e.message); }
}

function renderGantiEmail() {
    window.currentActiveSubMenu = "form_email";
    history.pushState({ id: 'pengaturan_form', menu: 'form_email' }, '', '');
    window.currentSettingsLevel = 3;
    const userAuth = firebase.auth().currentUser;
    gantiLayar('Ganti Email', `
        <div class="fixed-height-skeleton">
            <div class="input-group">
                <label>Email Saat Ini: ${userAuth.email}</label>
                <input type="email" id="setNewEmail" placeholder="Masukkan email baru..." class="custom-box-input">
            </div>
        </div>
    `, `<button class="btn-batal" onclick="history.back()">Batal</button><button class="btn-simpan" onclick="simpanEmailBaru()">Simpan</button>`, true);
}

async function simpanEmailBaru() {
    const userAuth = firebase.auth().currentUser;
    const emailBaru = document.getElementById('setNewEmail').value.trim();
    if (!emailBaru.includes('@')) return IOSAlert.show("Gagal", "Format email salah!");
    try {
        await userAuth.updateEmail(emailBaru);
        await window.db.ref(userAuth.uid).update({ email: emailBaru });
        IOSAlert.show("Berhasil", "Email diperbarui.", { onConfirm: () => history.back() });
    } catch (e) { IOSAlert.show("Keamanan", "Sesi berakhir. Login kembali."); }
}

function renderPengaturanPassword(judul) {
    window.currentActiveSubMenu = "form_pass";
    history.pushState({ id: 'pengaturan_form', menu: 'form_pass' }, '', '');
    window.currentSettingsLevel = 3;
    const isUbah = judul === 'Ubah Kata Sandi';
    let oldPassHtml = isUbah ? `<div class="input-group"><label>Sandi Lama</label><input type="password" id="setPassOld" class="custom-box-input"></div>` : '';
    gantiLayar(judul, `
        <div class="fixed-height-skeleton">
            <div style="text-align:center; padding: 10px 0 20px;"><i class="fa-solid fa-shield-halved" style="font-size:40px; color:#007AFF; margin-bottom:10px;"></i></div>
            ${oldPassHtml}
            <div class="input-group"><label>Sandi Baru</label><input type="password" id="setPassNew" oninput="validasiCeklisSandi()" class="custom-box-input"></div>
            <div class="input-group"><label>Konfirmasi Sandi Baru</label><input type="password" id="setPassConfirm" oninput="validasiCeklisSandi()" class="custom-box-input"></div>
            <div style="background: rgba(142,142,147,0.05); padding: 15px; border-radius: 12px; margin-top: 5px; border: 1px solid rgba(142,142,147,0.12);">
                <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqLength"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Minimal 6 karakter</div>
                <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqCase"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Huruf besar & kecil</div>
                <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqNum"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Minimal 1 angka</div>
                <div style="display: flex; align-items: center; font-size: 13px; color: #8E8E93;" id="reqMatch"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Kata sandi cocok</div>
            </div>
        </div>
    `, `<button class="btn-batal" onclick="history.back()">Batal</button><button class="btn-simpan" id="btnSimpanPassSetting" onclick="simpanPasswordFirebase()" style="opacity: 0.5; pointer-events: none;">Simpan</button>`, true);
}

function validasiCeklisSandi() {
    const pass = document.getElementById('setPassNew').value;
    const conf = document.getElementById('setPassConfirm').value;
    const btn = document.getElementById('btnSimpanPassSetting');
    const v = { len: pass.length >= 6, case: /[a-z]/.test(pass) && /[A-Z]/.test(pass), num: /\d/.test(pass), match: (pass === conf) && conf.length > 0 };
    const updateUI = (id, valid) => {
        const el = document.getElementById(id);
        if(!el) return;
        el.style.color = valid ? "#34C759" : "#8E8E93";
        el.querySelector('i').className = valid ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
    };
    updateUI('reqLength', v.len); updateUI('reqCase', v.case); updateUI('reqNum', v.num); updateUI('reqMatch', v.match);
    if (v.len && v.case && v.num && v.match) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; } 
    else { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

async function simpanPasswordFirebase() {
    const userAuth = firebase.auth().currentUser;
    const pNew = document.getElementById('setPassNew').value;
    const elOld = document.getElementById('setPassOld');
    try {
        if (elOld) {
            const snap = await window.db.ref(`${userAuth.uid}/password`).once('value');
            if (snap.val() !== elOld.value) return IOSAlert.show("Gagal", "Sandi lama salah!");
        }
        await userAuth.updatePassword(pNew);
        await window.db.ref(userAuth.uid).update({ password: pNew });
        IOSAlert.show("Berhasil", "Sandi diperbarui!", { onConfirm: () => history.back() });
    } catch (e) { IOSAlert.show("Keamanan", "Sesi berakhir. Login ulang."); }
}

// --- 7. TEMA & INFO (LEVEL 2) ---
function renderTema(isBackNav = false, withAnim = true) {
    window.currentActiveSubMenu = "tema";
    if (!isBackNav) {
        history.pushState({ id: 'pengaturan_sub', menu: 'tema' }, '', '');
    }
    window.currentSettingsLevel = 2;
    const theme = localStorage.getItem('app-theme') || 'auto';
    const check = (m) => theme === m ? '<i class="fa-solid fa-check" style="color:#007AFF;"></i>' : '';
    
    gantiLayar('Mode Tema', `
        <div class="fixed-height-skeleton">
            <div class="list-group-ios">
                <div onclick="setModeTema('light')" style="${listStyle}"><span>Terang</span> ${check('light')}</div>
                <div onclick="setModeTema('dark')" style="${listStyle}"><span>Gelap</span> ${check('dark')}</div>
                <div onclick="setModeTema('auto')" style="${listStyleLast}"><span>Otomatis (Sistem)</span> ${check('auto')}</div>
            </div>
        </div>
    `, `<button class="btn-batal btn-footer-center" onclick="history.back()">Kembali</button>`, withAnim);
}

function setModeTema(mode) {
    if (mode === 'auto') localStorage.removeItem('app-theme');
    else localStorage.setItem('app-theme', mode);
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark-theme', isDark);
    if (document.body) document.body.classList.toggle('dark-theme', isDark);
    renderTema(true, false);
}

function renderInformasiAplikasi(isBackNav = false) {
    window.currentActiveSubMenu = "info";
    if (!isBackNav) {
        history.pushState({ id: 'pengaturan_sub', menu: 'info' }, '', '');
    }
    window.currentSettingsLevel = 2;
    gantiLayar('Informasi Aplikasi', `
        <div class="fixed-height-skeleton">
            <div style="text-align: center; padding: 10px 0 20px;">
                <div style="width: 80px; height: 80px; border-radius: 18px; overflow: hidden; margin: 0 auto 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); background: white;">
                    <img src="assets/icon-1.png" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: var(--text-primary);">FIVE STAR 2</h2>
                <p id="teksVersiApp" style="font-size: 13px; color: #8E8E93; margin-top: 4px;">Memuat versi...</p>
            </div>
            
            <div class="list-group-ios" style="margin-top: 10px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2);"><span style="color: #8E8E93;">Pengembang</span><span style="font-weight: 600; color: var(--text-primary);">RONNY</span></div>
                <div style="display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2);"><span style="color: #8E8E93;">Storage</span><span style="font-weight: 600; color: var(--text-primary);">Firebase</span></div>
                <div style="display: flex; justify-content: space-between; padding: 12px 15px;"><span style="color: #8E8E93;">Database</span><span style="font-weight: 600; color: #34C759;">Terhubung</span></div>
            </div>

            <div class="list-group-ios" style="margin-top: 5px;">
                <div onclick="window.open('https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012019022054429359', '_blank')" style="${listStyleLast}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 28px; height: 28px; background: #118EEA; border-radius: 7px; display: flex; justify-content: center; align-items: center; color: white;"><i class="fa-solid fa-wallet"></i></div>
                        <span style="color: #007AFF;">Dukung Pengembang (DANA)</span>
                    </div>
                    <i class="fa-solid fa-arrow-up-right-from-square" style="${iconStyle}"></i>
                </div>
            </div>

            <p style="text-align: center; font-size: 11px; color: var(--text-primary); margin-top: auto;">&copy; 2026 FIVE STAR Management.</p>
        </div>
    `, `<button class="btn-batal btn-footer-center" onclick="history.back()">Kembali</button>`, true);
    bacaVersiDariSW();
}

function bacaVersiDariSW() {
    fetch('sw.js').then(r => r.text()).then(t => {
        const m = t.match(/(?:const|let|var)\s+(?:VERSION|CACHE_NAME)\s*=\s*['"]([^'"]+)['"]/i);
        const el = document.getElementById('teksVersiApp');
        if (el) el.innerText = m ? 'Versi ' + m[1].replace(/cache-|fivestar-/gi, '') : 'Versi PWA Aktif';
    }).catch(() => { if (document.getElementById('teksVersiApp')) document.getElementById('teksVersiApp').innerText = 'Versi Standard'; });
}

// --- 8. LOGOUT & HAPUS AKUN ---
function prosesLogout() {
    IOSAlert.show("Keluar Akun", "Apakah Anda yakin ingin keluar?", {
        teksBatal: "Batal",
        teksTombol: "Keluar",
        onConfirm: () => {
            firebase.auth().signOut().then(() => {
                const theme = localStorage.getItem('app-theme');
                localStorage.clear();
                if (theme) localStorage.setItem('app-theme', theme);
                localStorage.setItem('isLoggedIn', 'false');

                // Menggunakan replace agar history dihancurkan (Kembali ke login)
                window.location.replace('login.html');
            });
        }
    });
}

function renderHapusAkun(isBackNav = false) {
    window.currentActiveSubMenu = "form_hapus";
    if (!isBackNav) {
        history.pushState({ id: 'pengaturan_form', menu: 'form_hapus' }, '', '');
    }
    window.currentSettingsLevel = 3;
    gantiLayar('Konfirmasi Hapus', `
        <div class="fixed-height-skeleton">
            <div style="text-align:center; padding: 20px 0;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:50px; color:#FF3B30; margin-bottom:15px;"></i>
                <h3 style="color:#FF3B30;">Hapus Permanen?</h3>
                <p style="font-size:14px; opacity:0.8; color: var(--text-primary);">Seluruh data akan dihapus selamanya.</p>
                <div class="input-group" style="text-align: left; margin-top: 15px;">
                    <label style="font-size: 12px; color: #8E8E93;">Masukkan Kata Sandi</label>
                    <input type="password" id="passConfirmDelete" class="custom-box-input">
                </div>
            </div>
        </div>
    `, `<button class="btn-batal" onclick="history.back()">Batal</button><button class="btn-simpan" id="btnEksekusiHapus" style="background:#FF3B30 !important;" onclick="prosesHapusAkun()">Hapus</button>`, true);
}

async function prosesHapusAkun() {
    const userAuth = firebase.auth().currentUser;
    const passInput = document.getElementById('passConfirmDelete').value;
    const btn = document.getElementById('btnEksekusiHapus');
    if (!passInput) return IOSAlert.show("Gagal", "Sandi wajib diisi.");
    btn.innerText = "Menghapus...";
    try {
        const cred = firebase.auth.EmailAuthProvider.credential(userAuth.email, passInput);
        await userAuth.reauthenticateWithCredential(cred);
        await window.db.ref(userAuth.uid).remove();
        await userAuth.delete();
        localStorage.clear(); 
        
        // Pindah ke login setelah akun terhapus
        window.location.replace('login.html');
    } catch (e) { btn.innerText = "Hapus"; IOSAlert.show("Gagal", "Sandi salah atau error sistem."); }
}
