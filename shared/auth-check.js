// Script pencegah akses ilegal ke dashboard
(function() {
    if (sessionStorage.getItem('is_logged_in') !== 'true') {
        window.location.href = '../login/login.html';
    }
})();
