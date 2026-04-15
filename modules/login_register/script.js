const userInp = document.getElementById('username');
const statusBadge = document.getElementById('status-net');

// ANTI-LOST: Ambil data nama yang tersimpan
if (userInp) {
    userInp.value = localStorage.getItem('persistent_user') || '';
    // ANTI-LOST: Simpan tiap ketikan
    userInp.oninput = () => localStorage.setItem('persistent_user', userInp.value);
}

// SIMULASI LOGIN & SESSION STORAGE
if (document.getElementById('do-login')) {
    document.getElementById('do-login').onclick = () => {
        if(userInp && userInp.value.trim() !== "") {
            sessionStorage.setItem('is_logged_in', 'true');
            sessionStorage.setItem('session_user', userInp.value);
            // Pindahkan ke dashboard (buat file dashboard.html nanti)
            window.location.href = '../dashboard/dashboard.html';
        } else {
            alert("Username harus diisi!");
        }
    };
}

// OFFLINE/ONLINE DETECTION (Menggunakan class yang sudah dibuat)
function updateNetwork() {
    if (navigator.onLine) {
        statusBadge.textContent = "● Online";
        statusBadge.className = "badge online";
    } else {
        statusBadge.textContent = "● Offline Mode";
        statusBadge.className = "badge offline";
    }
}
window.ononline = window.onoffline = updateNetwork;
updateNetwork(); // Jalankan sekali saat dimuat
