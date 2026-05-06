// profil.js - VERSI FINAL (Center Popup Zoom, Fixed Skeleton Size, Centered Text Fix)
// Dikembangkan oleh: RONNY (2026)

let tempImg = null;
let selectorPos = { x: 0, y: 0, size: 250 }; 
let currentRotation = 0; 
let animationFrameId = null;

// --- 1. CSS INJECTION UNTUK POPUP PROFIL & SKELETON ---
if (!document.getElementById('profil-custom-style')) {
    const style = document.createElement('style');
    style.id = 'profil-custom-style';
    style.innerHTML = `
        /* Animasi Zoom dari Tengah (Bukan Slide dari bawah) */
        @keyframes iosZoomProfil {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .modal-zoom-profil {
            animation: iosZoomProfil 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        /* Mengunci ukuran modal agar tidak joget/berubah saat data masuk */
        .fixed-profile-card {
            width: 320px;
            min-height: 570px; /* Ukuran terkunci */
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: var(--card-bg);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .text-ellipsis-profil {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            display: block;
            box-sizing: border-box; /* FIX UTAMA: Kunci padding agar text benar-benar center */
        }
        .profil-banner-bg {
            height: 110px;
            background: linear-gradient(135deg, #007AFF, #5856D6);
            flex-shrink: 0;
        }
        .profil-avatar-wrapper {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 4px solid var(--card-bg);
            background: var(--card-bg);
            margin: -85px auto 0;
            position: relative;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
}

// --- 2. UTILITY FUNCTIONS ---
function hitungUmur(tglLahir) {
    if (!tglLahir) return "Belum diatur";

    let lahir;
    
    // Logika Pendeteksi Format Indonesia
    if (typeof tglLahir === 'string' && tglLahir.includes(' ')) {
        const daftarBulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        
        // Menghapus nama hari jika ada (contoh: "Selasa, 28 April 1997" -> "28 April 1997")
        let tglBersih = tglLahir.includes(',') ? tglLahir.split(',')[1].trim() : tglLahir.trim();
        let parts = tglBersih.split(' ');

        if (parts.length >= 3) {
            let tgl = parseInt(parts[0]);
            let bln = daftarBulan.indexOf(parts[1]); // Mencari posisi bulan (0-11)
            let thn = parseInt(parts[2]);
            
            if (bln !== -1) {
                lahir = new Date(thn, bln, tgl);
            }
        }
    }

    // Fallback: Jika cara di atas gagal, gunakan cara standar
    if (!lahir || isNaN(lahir.getTime())) {
        lahir = new Date(tglLahir);
    }

    // Jika tetap gagal (Format benar-benar hancur)
    if (isNaN(lahir.getTime())) return "NaN Tahun";

    const hariIni = new Date();
    let umur = hariIni.getFullYear() - lahir.getFullYear();
    const m = hariIni.getMonth() - lahir.getMonth();
    
    // Koreksi jika belum ulang tahun di tahun ini
    if (m < 0 || (m === 0 && hariIni.getDate() < lahir.getDate())) {
        umur--;
    }
    
    return umur + " Tahun";
}


async function refreshDataProfilUI() {
    const userAuth = firebase.auth().currentUser;
    if (userAuth && window.db) {
        try {
            const snap = await window.db.ref(userAuth.uid).once('value');
            if (snap.exists()) {
                const data = snap.val();
                if (data.nama) localStorage.setItem('nama_user', data.nama);
                if (data.username) localStorage.setItem('username', data.username);
                
                const updateEl = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
                updateEl('displayNamaProfil', (data.nama || "User").toUpperCase());
                updateEl('displayUserSubLokal', "@" + (data.username || "user").toLowerCase());
                updateEl('displayEmailProfil', data.email || userAuth.email || "Belum diatur");
                updateEl('displayHpProfil', data.hp || "-");
                updateEl('displayGenderProfil', data.gender || "-");
                updateEl('displayAlamatProfil', data.alamat || "Belum diatur");
                updateEl('displayUmurProfil', hitungUmur(data.tgl_lahir));
                
                if (data.foto) {
                    localStorage.setItem('user_foto_base64', data.foto);
                    const elFotoUtama = document.getElementById('fotoProfilUtama');
                    if (elFotoUtama) elFotoUtama.src = data.foto;
                    const elDashFoto = document.querySelector('.profile-pic');
                    if (elDashFoto) elDashFoto.src = data.foto;
                }
            }
        } catch (e) { console.error("Gagal sinkron profil:", e); }
    }
}

// --- 3. ACTION SHEET FOTO (LEVEL 2/3) ---
function pemicuPilihFoto() {
    let actionSheet = document.getElementById('actionSheetFoto');
    if (!actionSheet) {
        actionSheet = document.createElement('div');
        actionSheet.id = 'actionSheetFoto';
        actionSheet.className = 'ios-overlay';
        actionSheet.style.zIndex = '40000';
        
        if (!document.getElementById('action-sheet-css')) {
            const style = document.createElement('style');
            style.id = 'action-sheet-css';
            style.innerHTML = `
                .ios-action-sheet { position: absolute; bottom: 20px; left: 10px; right: 10px; width: calc(100% - 20px); max-width: 400px; }
                .action-sheet-body { background: var(--card-bg); border-radius: 14px; overflow: hidden; margin-bottom: 8px; }
                .action-item { padding: 18px; display: flex; align-items: center; gap: 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); color: #007AFF; font-size: 17px; cursor: pointer; }
                .action-item i { width: 20px; text-align: center; }
                .action-item.delete { color: #FF3B30; }
                .action-sheet-footer button { width: 100%; padding: 18px; border-radius: 14px; background: var(--card-bg); color: #007AFF; font-weight: 600; border: none; font-size: 17px; cursor: pointer; }
                
                .wa-footer-actions { position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; background: rgba(0,0,0,0.9); display: flex; justify-content: space-between; align-items: center; padding: 0 25px; box-sizing: border-box; z-index: 110; }
                .btn-wa-icon { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
                .btn-wa-text { background: none; border: none; color: #34C759; font-weight: 700; font-size: 16px; cursor: pointer; }
                #cropSelector { position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 9999px rgba(0,0,0,0.6); cursor: move; touch-action: none; border-radius: 50%; box-sizing: border-box; }
            `;
            document.head.appendChild(style);
        }

        actionSheet.innerHTML = `
            <div class="ios-action-sheet profile-expand-anim">
                <div class="action-sheet-body">
                    <div class="action-item" onclick="pilihSumber('camera')"><i class="fa-solid fa-camera"></i> <span style="color: var(--text-primary);">Kamera</span></div>
                    <div class="action-item" onclick="pilihSumber('gallery')"><i class="fa-solid fa-image"></i> <span style="color: var(--text-primary);">Galeri</span></div>
                    <div class="action-item delete" onclick="hapusFotoProfil()"><i class="fa-solid fa-trash-can"></i> <span>Hapus Foto</span></div>
                </div>
                <div class="action-sheet-footer"><button onclick="tutupActionSheet()">Batal</button></div>
            </div>
        `;
        document.body.appendChild(actionSheet);
    }
    actionSheet.style.display = 'flex';

    history.pushState({ id: 'actionSheetFoto' }, '', '');
    
    // Gunakan ID checking yang tahan terhadap tumpukan modal baru
    window.handleBackActionSheet = function(e) {
        if (!e.state || e.state.id === 'modalProfil') {
            const a = document.getElementById('actionSheetFoto');
            if (a) a.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackActionSheet);
        }
    };
    window.addEventListener('popstate', window.handleBackActionSheet);
}

function tutupActionSheet() { 
    if (history.state && history.state.id === 'actionSheetFoto') history.back();
    else {
        const a = document.getElementById('actionSheetFoto');
        if (a) a.style.display = 'none';
    }
}

function pilihSumber(tipe) {
    const input = document.getElementById('inputFotoProfil');
    if (tipe === 'camera') input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    tutupActionSheet();
    input.click();
}

function hapusFotoProfil() {
    tutupActionSheet();
    setTimeout(() => {
        IOSAlert.show("Hapus Foto", "Kembalikan foto profil ke default?", {
            teksBatal: "Batal", teksTombol: "Hapus",
            onConfirm: () => {
                const def = window.avatarSiluet;
                localStorage.setItem('user_foto_base64', def);
                document.getElementById('fotoProfilUtama').src = def;
                const elDash = document.querySelector('.profile-pic');
                if(elDash) elDash.src = def;
                const u = firebase.auth().currentUser;
                if(u && window.db) window.db.ref(u.uid).update({ foto: def });
            }
        });
    }, 200); 
}

// --- 4. UI POPUP PROFIL (LEVEL 1 / ROOT) ---
function bukaPopupProfil(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('profileIosModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'profileIosModal';
        modal.className = 'ios-overlay'; 
        modal.style.cssText = 'z-index: 21000; align-items: center; justify-content: center;';
        
        const f = localStorage.getItem('user_foto_base64') || window.avatarSiluet;
        modal.innerHTML = `
            <div class="modal-zoom-profil fixed-profile-card">
                <div class="profil-banner-bg"></div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; padding-bottom: 15px;">
                    <div style="position: relative; text-align: center;">
                        <div class="profil-avatar-wrapper" onclick="bukaFotoFull(this.querySelector('img').src)" style="cursor: pointer;">
                            <img src="${f}" alt="Profile" id="fotoProfilUtama" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <input type="file" id="inputFotoProfil" accept="image/*" style="display:none" onchange="bukaEditorCrop(this)">
                        <button onclick="pemicuPilihFoto()" style="position: absolute; bottom: 0; right: calc(50% - 60px); width: 32px; height: 32px; border-radius: 50%; background: #007AFF; color: white; border: 2px solid var(--card-bg); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                            <i class="fa-solid fa-camera" style="font-size: 13px;"></i>
                        </button>
                    </div>
                    
                    <h3 id="displayNamaProfil" class="text-ellipsis-profil" style="color: var(--text-primary); margin: 12px 0 2px 0; text-align: center; font-size: 19px; font-weight: 800; padding: 0 15px;">Memuat...</h3>
                    <p id="displayUserSubLokal" class="text-ellipsis-profil" style="text-align: center; margin: 0 0 15px 0; color: #8E8E93; font-size: 13px; font-weight: 500; padding: 0 15px;">@user</p>

                    <div style="background: rgba(142,142,147,0.05); border-radius: 16px; margin: 0 15px; border: 1px solid rgba(142,142,147,0.12); text-align: left; display: flex; flex-direction: column;">
                        
                        <div style="display:flex; align-items:center; padding:12px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:12px;">
                            <div style="width:28px; height:28px; border-radius:7px; background:#007AFF; display:flex; justify-content:center; align-items:center; flex-shrink: 0;"><i class="fa-solid fa-envelope" style="color:white; font-size:12px;"></i></div>
                            <div style="display:flex; flex-direction:column; overflow:hidden; flex-grow: 1;">
                                <span style="font-size:10px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Email Akun</span>
                                <span id="displayEmailProfil" class="text-ellipsis-profil" style="font-size:14px; color:var(--text-primary); font-weight:600; padding: 0;">Memuat...</span>
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items:center; padding:12px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:12px;">
                            <div style="width:28px; height:28px; border-radius:7px; background:#34C759; display:flex; justify-content:center; align-items:center; flex-shrink: 0;"><i class="fa-solid fa-phone" style="color:white; font-size:12px;"></i></div>
                            <div style="display:flex; flex-direction:column; overflow:hidden; flex-grow: 1;">
                                <span style="font-size:10px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Nomor Telepon</span>
                                <span id="displayHpProfil" class="text-ellipsis-profil" style="font-size:14px; color:var(--text-primary); font-weight:600; padding: 0;">Memuat...</span>
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items:center; padding:12px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:12px;">
                            <div style="width:28px; height:28px; border-radius:7px; background:#5856D6; display:flex; justify-content:center; align-items:center; flex-shrink: 0;"><i class="fa-solid fa-venus-mars" style="color:white; font-size:12px;"></i></div>
                            <div style="display:flex; flex-direction:column; overflow:hidden; flex-grow: 1;">
                                <span style="font-size:10px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Jenis Kelamin</span>
                                <span id="displayGenderProfil" class="text-ellipsis-profil" style="font-size:14px; color:var(--text-primary); font-weight:600; padding: 0;">Memuat...</span>
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items:center; padding:12px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:12px;">
                            <div style="width:28px; height:28px; border-radius:7px; background:#FF9500; display:flex; justify-content:center; align-items:center; flex-shrink: 0;"><i class="fa-solid fa-calendar-day" style="color:white; font-size:12px;"></i></div>
                            <div style="display:flex; flex-direction:column; overflow:hidden; flex-grow: 1;">
                                <span style="font-size:10px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Usia Saat Ini</span>
                                <span id="displayUmurProfil" class="text-ellipsis-profil" style="font-size:14px; color:var(--text-primary); font-weight:600; padding: 0;">Memuat...</span>
                            </div>
                        </div>
                        
                        <div style="display:flex; align-items:flex-start; padding:12px 15px; gap:12px;">
                            <div style="width:28px; height:28px; border-radius:7px; background:#FF3B30; display:flex; justify-content:center; align-items:center; margin-top:2px; flex-shrink: 0;"><i class="fa-solid fa-location-dot" style="color:white; font-size:12px;"></i></div>
                            <div style="display:flex; flex-direction:column; overflow:hidden; flex-grow: 1;">
                                <span style="font-size:10px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Alamat Domisili</span>
                                <span id="displayAlamatProfil" style="font-size:13px; color:var(--text-primary); line-height:1.4; font-weight:600; min-height: 36px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">Memuat...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: auto; padding: 15px 15px 0 15px; display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="tutupPopupProfil()" style="width: 100%; padding: 14px; border-radius: 12px; background: transparent; color: #FF3B30; font-weight: 700; border: 1px solid rgba(255,59,48,0.2); font-size: 15px; cursor: pointer;">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    refreshDataProfilUI();
    modal.style.display = 'flex';

    history.pushState({ id: 'modalProfil' }, '', '');
    
    // SATPAM NAVIGASI (Hanya tutup jika kembali ke Dashboard)
    window.handleBackProfil = function(e) {
        const state = e.state;
        if (!state || state.id === 'dashboardRoot') {
            const m = document.getElementById('profileIosModal');
            if (m && m.style.display === 'flex') {
                m.style.display = 'none';
                window.removeEventListener('popstate', window.handleBackProfil);
            }
        }
    };
    window.removeEventListener('popstate', window.handleBackProfil);
    window.addEventListener('popstate', window.handleBackProfil);
}

function tutupPopupProfil() {
    if (history.state && history.state.id === 'modalProfil') history.back();
    else {
        const modal = document.getElementById('profileIosModal');
        if (modal) modal.style.display = 'none';
    }
}

// --- 5. SELECTOR EDITOR CROP (LEVEL 2/3) ---
function bukaEditorCrop(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        tempImg = new Image();
        tempImg.src = e.target.result;
        tempImg.onload = () => {
            currentRotation = 0; 
            let cropModal = document.getElementById('cropModalWA');
            if (!cropModal) {
                cropModal = document.createElement('div');
                cropModal.id = 'cropModalWA';
                cropModal.className = 'ios-overlay';
                cropModal.style.cssText = "z-index: 50000; background: #000; flex-direction: column;";
                cropModal.innerHTML = `
                    <div id="cropWrapper" style="position: relative; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; touch-action: none; padding-bottom: 80px;">
                        <img id="imgToCrop" style="max-width: 100%; max-height: 100%; user-select: none; pointer-events: none; transition: transform 0.3s ease;">
                        <div id="cropSelector"></div>
                    </div>
                    <div class="wa-footer-actions">
                        <button class="btn-wa-icon" onclick="tutupEditorCrop()"><i class="fa-solid fa-xmark"></i></button>
                        <button class="btn-wa-icon" onclick="putarFoto()"><i class="fa-solid fa-rotate-right"></i></button>
                        <button class="btn-wa-text" onclick="terapkanCrop()">SELESAI</button>
                    </div>
                `;
                document.body.appendChild(cropModal);
                inisialisasiSelectorEvents();
            }
            document.getElementById('imgToCrop').src = tempImg.src;
            document.getElementById('imgToCrop').style.transform = `rotate(0deg)`;
            
            setTimeout(() => {
                const wrapper = document.getElementById('cropWrapper');
                const selector = document.getElementById('cropSelector');
                selectorPos.size = Math.min(wrapper.offsetWidth, wrapper.offsetHeight - 80) * 0.7;
                selector.style.width = selector.style.height = selectorPos.size + 'px';
                selector.style.left = (wrapper.offsetWidth - selectorPos.size) / 2 + 'px';
                selector.style.top = (wrapper.offsetHeight - 80 - selectorPos.size) / 2 + 'px';
            }, 50);
            cropModal.style.display = 'flex';

            history.pushState({ id: 'cropEditor' }, '', '');
            window.handleBackCrop = function(e) {
                if (!e.state || e.state.id === 'modalProfil') {
                    const c = document.getElementById('cropModalWA');
                    if (c) c.style.display = 'none';
                    window.removeEventListener('popstate', window.handleBackCrop);
                }
            };
            window.addEventListener('popstate', window.handleBackCrop);
        };
    };
    reader.readAsDataURL(file);
}

function putarFoto() {
    currentRotation = (currentRotation + 90) % 360;
    document.getElementById('imgToCrop').style.transform = `rotate(${currentRotation}deg)`;
}

function inisialisasiSelectorEvents() {
    const selector = document.getElementById('cropSelector');
    const wrapper = document.getElementById('cropWrapper');
    let isMoving = false;
    let initialPinchDist = 0;
    let initialSize = 0;
    let startTouch = { x: 0, y: 0 };
    const getDist = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

    const start = (e) => {
        if (e.touches && e.touches.length === 2) {
            isMoving = false; initialPinchDist = getDist(e.touches); initialSize = selectorPos.size;
        } else {
            isMoving = true;
            const t = e.touches ? e.touches[0] : e;
            startTouch = { x: t.clientX - selector.offsetLeft, y: t.clientY - selector.offsetTop };
        }
        if(e.cancelable) e.preventDefault();
    };

    const move = (e) => {
        if (e.touches && e.touches.length === 2) {
            const currentDist = getDist(e.touches);
            const ratio = currentDist / initialPinchDist;
            let newSize = Math.max(100, Math.min(initialSize * ratio, wrapper.offsetWidth, wrapper.offsetHeight - 80));
            const diff = (newSize - selectorPos.size) / 2;
            let nextX = Math.max(0, Math.min(selector.offsetLeft - diff, wrapper.offsetWidth - newSize));
            let nextY = Math.max(0, Math.min(selector.offsetTop - diff, wrapper.offsetHeight - 80 - newSize));
            selectorPos.size = newSize;
            selector.style.width = selector.style.height = newSize + 'px';
            selector.style.left = nextX + 'px';
            selector.style.top = nextY + 'px';
        } else if (isMoving) {
            const t = e.touches ? e.touches[0] : e;
            let x = Math.max(0, Math.min(t.clientX - startTouch.x, wrapper.offsetWidth - selectorPos.size));
            let y = Math.max(0, Math.min(t.clientY - startTouch.y, wrapper.offsetHeight - 80 - selectorPos.size));
            selector.style.left = x + 'px';
            selector.style.top = y + 'px';
        }
        if(e.cancelable) e.preventDefault();
    };
    const stop = () => { isMoving = false; initialPinchDist = 0; };
    selector.addEventListener('touchstart', start, {passive: false});
    window.addEventListener('touchmove', move, {passive: false});
    window.addEventListener('touchend', stop);
}

function terapkanCrop() {
    const selector = document.getElementById('cropSelector');
    const img = document.getElementById('imgToCrop');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = img.getBoundingClientRect();
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (currentRotation === 90 || currentRotation === 270) {
        tempCanvas.width = tempImg.height; tempCanvas.height = tempImg.width;
    } else {
        tempCanvas.width = tempImg.width; tempCanvas.height = tempImg.height;
    }

    tempCtx.translate(tempCanvas.width/2, tempCanvas.height/2);
    tempCtx.rotate(currentRotation * Math.PI / 180);
    tempCtx.drawImage(tempImg, -tempImg.width/2, -tempImg.height/2);

    const scaleX = tempCanvas.width / rect.width;
    const scaleY = tempCanvas.height / rect.height;
    const cropX = (selector.offsetLeft - rect.left) * scaleX;
    const cropY = (selector.offsetTop - rect.top) * scaleY;
    const cropSize = selector.offsetWidth * scaleX;

    canvas.width = 500; canvas.height = 500;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, cropX, cropY, cropSize, cropSize, 0, 0, 500, 500);

    const base64 = canvas.toDataURL('image/jpeg', 0.7);
    document.getElementById('fotoProfilUtama').src = base64;
    const elDash = document.querySelector('.profile-pic');
    if (elDash) elDash.src = base64;
    
    localStorage.setItem('user_foto_base64', base64);
    const u = firebase.auth().currentUser;
    if (u && window.db) {
        window.db.ref(u.uid).update({ foto: base64 }).then(() => IOSAlert.show("Berhasil", "Foto profil diperbarui."));
    }
    tutupEditorCrop();
}

function tutupEditorCrop() {
    document.getElementById('inputFotoProfil').value = "";
    if (history.state && history.state.id === 'cropEditor') history.back();
    else {
        const m = document.getElementById('cropModalWA'); 
        if(m) m.style.display = 'none';
    }
}

// --- 6. FOTO FULLSCREEN (LEVEL 2) ---
function bukaFotoFull(url) {
    let fotoModal = document.getElementById('fotoFullModal');
    if (!fotoModal) {
        fotoModal = document.createElement('div');
        fotoModal.id = 'fotoFullModal';
        fotoModal.className = 'foto-full-overlay';
        fotoModal.style.zIndex = '45000';
        fotoModal.innerHTML = `<button class="btn-close-foto-fixed" onclick="tutupFotoFull()"><i class="fa-solid fa-xmark"></i></button><div class="foto-full-container"><img id="imgFullDisplay" class="foto-full-img"></div>`;
        document.body.appendChild(fotoModal);
    }
    document.getElementById('imgFullDisplay').src = url;
    fotoModal.style.display = 'flex';

    history.pushState({ id: 'fotoFull' }, '', '');
    
    window.handleBackFotoFull = function(e) {
        if (!e.state || e.state.id === 'modalProfil') {
            const f = document.getElementById('fotoFullModal');
            if (f) f.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackFotoFull);
        }
    };
    window.addEventListener('popstate', window.handleBackFotoFull);
}

function tutupFotoFull() {
    if (history.state && history.state.id === 'fotoFull') history.back();
    else {
        const f = document.getElementById('fotoFullModal');
        if (f) f.style.display = 'none';
    }
}
