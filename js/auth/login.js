// login.js - Versi Lengkap & Utuh (UID Root Architecture & iOS Premium UI)

function inisialisasiLogin() {
    let loginOverlay = document.getElementById('loginOverlay');
    
    if (!loginOverlay) {
        loginOverlay = document.createElement('div');
        loginOverlay.id = 'loginOverlay';
        loginOverlay.className = 'ios-overlay';
        loginOverlay.style.zIndex = '20000';
        
        const isDark = document.body.classList.contains('dark-theme');
        const logoSrc = isDark ? 'fivestar2/assets/fs2-white.png' : 'fivestar2/assets/fs2-black.png';
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 16px; border-radius: 12px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 15px; transition: 0.3s;";

        loginOverlay.innerHTML = `
            <div class="ios-modal-form login-card profile-expand-anim" style="width: 320px; padding: 40px 20px; border-radius: 20px; background: var(--card-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 35px;">
                    <img id="loginLogo" src="${logoSrc}" alt="Logo" style="width: 180px; margin-bottom: 10px;">
                    <p style="font-size: 14px; color: #8E8E93; margin: 0;">Silakan masuk untuk melanjutkan</p>
                </div>
                
                <div class="input-group">
                    <input type="text" id="loginUser" placeholder="Email / Username" class="custom-box-input" style="${inputStyle}" oninput="this.value = this.value.toLowerCase()">
                </div>
                
                <div class="input-group" style="position: relative; margin-top: 15px;">
                    <input type="password" id="loginPass" placeholder="Kata Sandi" class="custom-box-input" style="${inputStyle} padding-right: 40px;">
                    <span onclick="togglePassword()" style="position: absolute; right: 15px; top: 16px; color: #8E8E93; cursor: pointer;">
                        <i id="eyeIcon" class="fa-solid fa-eye"></i>
                    </span>
                </div>
                
                <div style="text-align: right; margin-top: 12px;">
                    <a href="javascript:void(0)" onclick="bukaPopupLupaPassword()" style="color: #007AFF; font-size: 13px; text-decoration: none; font-weight: 600;">Lupa Kata Sandi?</a>
                </div>
                
                <button onclick="prosesLogin()" id="btnLogin" style="width: 100%; padding: 16px; border-radius: 12px; background: #007AFF; color: white; border: none; margin-top: 30px; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.2s;">Masuk</button>
                
                <div style="margin-top: 35px; text-align: center;">
                    <p style="font-size: 12px; color: #8E8E93; position: relative;">
                        <span style="background: var(--card-bg); padding: 0 10px; position: relative; z-index: 2;">Atau masuk dengan</span>
                    </p>
                    <div style="border-bottom: 1px solid rgba(142,142,147,0.3); margin-top: -10px;"></div>
                    
                    <div style="display: flex; justify-content: center; margin-top: 25px;">
                        <button onclick="loginPihakKetiga('google')" style="width: 60px; height: 60px; border-radius: 50%; border: 1px solid rgba(142,142,147,0.2); background: var(--bg-color); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" style="width: 25px;">
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 40px; text-align: center; font-size: 14px;">
                    <span style="color: #8E8E93;">Belum punya akun?</span> 
                    <a href="javascript:void(0)" onclick="if(typeof inisialisasiRegister === 'function'){inisialisasiRegister();}" style="color: #007AFF; text-decoration: none; font-weight: 600;"> Daftar Sekarang</a>
                </div>
            </div>
        `;
        document.body.appendChild(loginOverlay);
    }
    loginOverlay.style.display = 'flex';
}

// --- 1. FUNGSI LUPA PASSWORD (DENGAN POPUP KHUSUS) ---

function bukaPopupLupaPassword() {
    let overlay = document.getElementById('lupaPassOverlay');
    
    // Buat popup jika belum ada
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'lupaPassOverlay';
        overlay.className = 'ios-overlay';
        overlay.style.zIndex = '25000'; // Z-index super tinggi agar di atas form login
        
        overlay.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 25px 20px; border-radius: 18px; background: var(--card-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.2); text-align: center;">
                
                <div style="margin-bottom: 20px;">
                    <div style="width: 50px; height: 50px; background: rgba(0,122,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                        <i class="fa-solid fa-envelope" style="font-size: 24px; color: #007AFF;"></i>
                    </div>
                    <h3 style="margin: 0 0 10px 0; color: var(--text-primary); font-size: 18px;">Reset Kata Sandi</h3>
                    <p style="font-size: 13px; color: #8E8E93; margin: 0; line-height: 1.4;">
                        Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
                    </p>
                </div>
                
                <input type="email" id="emailResetLupa" placeholder="email@contoh.com" class="custom-box-input" style="background: var(--bg-color); border: 2px solid transparent; padding: 14px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; text-align: center; margin-bottom: 20px;">
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="document.getElementById('lupaPassOverlay').style.display='none'" style="flex: 1; padding: 12px; border-radius: 10px; background: rgba(142,142,147,0.1); color: var(--text-primary); border: none; font-weight: 600; font-size: 14px; cursor: pointer;">Batal</button>
                    <button onclick="prosesResetSandi()" style="flex: 1; padding: 12px; border-radius: 10px; background: #007AFF; color: white; border: none; font-weight: 600; font-size: 14px; cursor: pointer;">Kirim</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    // Kosongkan kolom input setiap kali dibuka dan tampilkan
    document.getElementById('emailResetLupa').value = "";
    overlay.style.display = 'flex';
}

// Logika pemrosesan kirim link reset ke Firebase
function prosesResetSandi() {
    const email = document.getElementById('emailResetLupa').value.trim();
    
    if (email && email.includes('@')) {
        // Sembunyikan popup reset
        document.getElementById('lupaPassOverlay').style.display = 'none';
        
        // Proses ke Firebase
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                IOSAlert.show("Tautan Terkirim", "Silakan periksa kotak masuk atau folder spam di email Anda.", { teksTombol: "Siap" });
            })
            .catch((err) => {
                IOSAlert.show("Gagal", "Email tidak terdaftar atau terjadi kesalahan jaringan.");
            });
    } else {
        IOSAlert.show("Peringatan", "Harap masukkan format email yang benar.");
    }
}


// 2. SINKRONISASI DATA (JALUR UID ROOT)
async function sinkronisasiDataUser(uid) {
    if (!window.db) return;
    try {
        const snapshot = await window.db.ref(uid).once('value');
        if (snapshot.exists()) {
            const d = snapshot.val();
            
            // Simpan detail profil ke LocalStorage agar Header & Pengaturan sinkron
            const profil = {
                nama: d.nama || "User",
                username: d.username || "user",
                email: d.email || "",
                tgl_lahir: d.tgl_lahir || "",
                gender: d.gender || "Laki-laki",
                foto: d.foto || window.avatarSiluet,
                hp: d.hp || "",
                alamat: d.alamat || ""
            };

            localStorage.setItem('user_profile', JSON.stringify(profil));
            localStorage.setItem('nama_user', profil.nama);
            localStorage.setItem('username', profil.username);
            localStorage.setItem('user_foto_base64', profil.foto);
            
            if (typeof muatDataHeader === 'function') muatDataHeader();
            if (typeof muatFotoDashboard === 'function') muatFotoDashboard();
            
            return true;
        }
    } catch (e) { console.error("Gagal Sinkronisasi:", e); return false; }
}

// 3. PROSES LOGIN MANUAL (SUPPORT EMAIL & USERNAME)
async function prosesLogin() {
    const inputIdentifier = document.getElementById('loginUser').value.trim().toLowerCase();
    const passInput = document.getElementById('loginPass').value;
    const btnLogin = document.getElementById('btnLogin');

    if (!inputIdentifier || !passInput) {
        return IOSAlert.show("Peringatan", "Harap isi Email/Username dan Kata Sandi!");
    }

    btnLogin.innerText = "Memeriksa...";
    btnLogin.disabled = true;

    const isEmail = inputIdentifier.includes('@');
    let loginEmail = inputIdentifier;

    try {
        // --- JIKA INPUT ADALAH USERNAME ---
        if (!isEmail) {
            // Cari data di Database Firebase dengan username terkait
            const snap = await window.db.ref().orderByChild('username').equalTo(inputIdentifier).once('value');
            
            if (!snap.exists()) {
                // Username tidak ditemukan di database
                btnLogin.innerText = "Masuk";
                btnLogin.disabled = false;
                return IOSAlert.show("Gagal Masuk", "Username tidak terdaftar.", { teksTombol: "Coba Lagi" });
            }
            
            // Ambil email dari data username yang ditemukan
            snap.forEach(child => {
                loginEmail = child.val().email;
            });
            
            if (!loginEmail) {
                btnLogin.innerText = "Masuk";
                btnLogin.disabled = false;
                return IOSAlert.show("Gagal", "Email tidak tertaut pada username ini.");
            }
        }

        // --- PROSES LOGIN FIREBASE (Menggunakan Email) ---
        const result = await firebase.auth().signInWithEmailAndPassword(loginEmail, passInput);
        const uid = result.user.uid;

        // Tarik data profil berdasarkan UID
        await sinkronisasiDataUser(uid);
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginType', 'manual');
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        // --- CUSTOM ERROR MESSAGES ---
        let msg = "Terjadi kesalahan.";
        
        if (error.code === 'auth/user-not-found') {
            msg = isEmail ? "Email tidak terdaftar." : "Akun tidak ditemukan.";
        } else if (error.code === 'auth/wrong-password') {
            msg = "Kata sandi salah.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "Format email tidak valid.";
        } else if (error.code === 'auth/too-many-requests') {
            msg = "Terlalu banyak percobaan. Silakan coba lagi nanti.";
        }

        IOSAlert.show("Gagal Masuk", msg, { teksTombol: "Coba Lagi" });
        btnLogin.innerText = "Masuk";
        btnLogin.disabled = false;
    }
}

// 4. LOGIN GOOGLE (JALUR UID ROOT)
function loginPihakKetiga(p) {
    if (p !== 'google') return;
    
    let prov = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(prov).then(async (res) => {
        const u = res.user;
        const uid = u.uid;

        // Cek apakah user sudah punya data di Database (UID Root)
        const snapshot = await window.db.ref(uid).once('value');
        
        if (!snapshot.exists()) {
            // Buat profil dasar jika user baru
            const defaultUser = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            await window.db.ref(uid).set({
                uid: uid,
                email: u.email,
                nama: u.displayName || "USER FS2",
                username: defaultUser,
                tgl_daftar: new Date().toISOString(),
                foto: u.photoURL || window.avatarSiluet,
                gender: "Laki-laki"
            });
        }

        await sinkronisasiDataUser(uid);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginType', 'google');
        window.location.href = 'dashboard.html';

    }).catch(e => {
        if (e.code !== 'auth/popup-closed-by-user') {
            IOSAlert.show("Gagal", "Login Google gagal: " + e.message);
        }
    });
}

// 5. TOGGLE PASSWORD UI
function togglePassword() {
    const input = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
