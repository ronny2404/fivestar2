const userInp = document.getElementById('username');
const statusDiv = document.getElementById('status-online');

// ANTI-LOST: Ambil data lama
userInp.value = localStorage.getItem('temp_user') || '';

// ANTI-LOST: Simpan tiap ketikan
userInp.oninput = () => localStorage.setItem('temp_user', userInp.value);

// LOGIN & SESSION STORAGE
document.getElementById('btn-login').onclick = () => {
    if(userInp.value) {
        sessionStorage.setItem('is_logged_in', 'true');
        sessionStorage.setItem('session_user', userInp.value);
        window.location.href = '../dashboard/dashboard.html';
    }
};

// OFFLINE MODE Detection
function updateNet() {
    statusDiv.textContent = navigator.onLine ? "● Online" : "● Offline Mode";
    statusDiv.className = "badge " + (navigator.onLine ? "online" : "offline");
}
window.ononline = window.onoffline = updateNet;
updateNet();
