// shared/popup.js
function initWelcomePopup() {
    const popup = document.getElementById('welcome-popup');
    const closeBtn = document.getElementById('close-popup');
    const userDisplay = document.getElementById('user-name-popup');
    const isLoggedIn = sessionStorage.getItem('is_logged_in');

    if (isLoggedIn === 'true') {
        // Teks jika sudah login (Dashboard)
        if(userDisplay) userDisplay.textContent = sessionStorage.getItem('session_user');
    } else {
        // Teks jika belum login (Halaman Depan)
        if(userDisplay) userDisplay.textContent = "Tamu";
        // Kamu bisa ubah isi p atau h2 di sini via JS jika mau
    }

    // Munculkan popup jika belum pernah dilihat dalam sesi ini
    if (!sessionStorage.getItem('welcome_seen')) {
        popup.classList.remove('hidden');
    }

    closeBtn.onclick = () => {
        popup.classList.add('hidden');
        sessionStorage.setItem('welcome_seen', 'true');
    };
}
