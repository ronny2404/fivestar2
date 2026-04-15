const toggleAuth = document.getElementById('toggle-auth');
const loginForm = document.getElementById('login-form');
const regForm = document.getElementById('register-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const userInp = document.getElementById('username');

// 1. Switch Login / Register
toggleAuth.onclick = () => {
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        authTitle.textContent = "Selamat Datang";
        authSubtitle.textContent = "Silahkan masuk ke akun anda";
        toggleAuth.textContent = "Daftar";
        document.getElementById('switch-text').firstChild.textContent = "Belum punya akun? ";
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        authTitle.textContent = "Buat Akun";
        authSubtitle.textContent = "Daftar untuk mulai pengalaman baru";
        toggleAuth.textContent = "Login";
        document.getElementById('switch-text').firstChild.textContent = "Sudah punya akun? ";
    }
};

// 2. Anti-Lost Data
userInp.value = localStorage.getItem('persistent_user') || '';
userInp.oninput = () => localStorage.setItem('persistent_user', userInp.value);

// 3. Login Action
document.getElementById('do-login').onclick = () => {
    if(userInp.value.trim() !== "") {
        sessionStorage.setItem('is_logged_in', 'true');
        sessionStorage.setItem('session_user', userInp.value);
        window.location.href = '../dashboard/dashboard.html';
    } else {
        alert("Username harus diisi!");
    }
};

// 4. Network Status (Real-time)
window.addEventListener('online', () => {
    const b = document.getElementById('status-net');
    b.textContent = "● Online";
    b.className = "badge online";
});
window.addEventListener('offline', () => {
    const b = document.getElementById('status-net');
    b.textContent = "● Offline Mode";
    b.className = "badge offline";
});
