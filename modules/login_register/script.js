const userInp = document.getElementById('username');

// Anti-Lost Data
userInp.value = localStorage.getItem('persistent_user') || '';
userInp.oninput = () => localStorage.setItem('persistent_user', userInp.value);

document.getElementById('do-login').onclick = () => {
    if(userInp.value.trim() !== "") {
        sessionStorage.setItem('is_logged_in', 'true');
        sessionStorage.setItem('session_user', userInp.value);
        window.location.href = '../dashboard/dashboard.html';
    } else {
        alert("Masukkan Username!");
    }
};
