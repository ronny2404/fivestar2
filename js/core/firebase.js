// firebase.js - Konfigurasi dan Inisialisasi Firebase (Compat Mode)

const firebaseConfig = {
  apiKey: "AIzaSyAsINtnmVQthClAReXRk09k-AsDo9VIqDQ",
  authDomain: "five-star-2404.firebaseapp.com",
  databaseURL: "https://five-star-2404-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "five-star-2404",
  storageBucket: "five-star-2404.firebasestorage.app",
  messagingSenderId: "778881784522",
  appId: "1:778881784522:web:6d6d43d6213fdaf4b43233",
  measurementId: "G-Y71EN3MHVW"
};

// 1. Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 2. Daftarkan Layanan ke Window (Gunakan Pengecekan Aman)
try {
    window.auth = firebase.auth();
    window.db = firebase.database(); // Realtime Database
    
    // Cek apakah SDK Firestore sudah dimuat di HTML
    if (typeof firebase.firestore === "function") {
        window.firestore = firebase.firestore();
        console.log("Firestore Berhasil Dimuat! 🚀");
    } else {
        console.error("SDK Firestore belum dipanggil di HTML!");
    }

} catch (error) {
    console.error("Gagal inisialisasi layanan Firebase:", error);
}

console.log("Firebase System Ready! 🔥");
