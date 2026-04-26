// gaji.js - Modul Slip Gaji (Firestore Parallel Architecture - FS1 & FS2 Split)

const namaBulanGaji = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const TARIF = {
    POKOK: 900000,
    REFLEXY: 20000, 
    MASSAGE: 21000, 
    MAKAN: 20000,   
    BONUS_PER_JAM: 2888,
    
    // Nominal Potongan Lainnya (Silakan disesuaikan)
    POTONGAN_ALPA: 100000, 
    POTONGAN_SAKIT: 0,
    POTONGAN_TELAT: 0
    // POTONGAN_IZIN dihitung prorata otomatis
};

// 1. CSS ANIMASI
if (!document.getElementById('gaji-result-style')) {
    const style = document.createElement('style');
    style.id = 'gaji-result-style';
    style.innerHTML = `
        @keyframes staggeredFadeIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .data-item-animate { opacity: 0; animation: staggeredFadeIn 0.4s ease-out forwards; }
        #areaHasilGaji { transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease; max-height: 0; overflow: hidden; opacity: 0; display: block !important; }
        #areaHasilGaji.show { max-height: 2500px; opacity: 1; }
    `;
    document.head.appendChild(style);
}

// 2. FUNGSI BUKA MODAL GAJI
function bukaMenuGaji(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('gajiModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'gajiModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 350px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="flex-shrink: 0;"><h3>Slip Gaji</h3></div>
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
                    <div style="padding: 15px 20px; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                        <div class="input-group"><label>Periode Gaji</label>
                            <input type="text" id="inputPeriodeGaji" readonly onclick="bukaPickerPeriodeGaji()" placeholder="Pilih Bulan & Tahun" style="cursor: pointer; font-weight: 600; text-align: center;">
                        </div>
                        <button id="btnHitungGaji" onclick="prosesGaji()" class="btn-simpan" style="margin-top:15px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; font-weight: bold; border-radius: 12px; background-color: #007AFF !important; color: #FFFFFF !important;">
                            <i class="fa-solid fa-calculator"></i> Hitung Gaji
                        </button>
                    </div>

                    <div id="areaHasilGaji" style="padding: 0 20px 20px 20px; overflow-y: auto; flex-grow: 1; text-align: left;">
                        
                        <h4 style="margin: 20px 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase;">Pendapatan Five Star 1</h4>
                        <div class="data-grid" style="margin-bottom: 16px;">
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.1s;">
                                <div style="display:flex; flex-direction:column;"><span>Reflexy FS 1</span><span style="font-size:11px; color:#8E8E93;" id="gjReflexyKetFS1">0 Jam</span></div>
                                <span id="gjReflexyFS1Rp">Rp</span><span id="gjReflexyFS1" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.15s;">
                                <div style="display:flex; flex-direction:column;"><span>Massage FS 1</span><span style="font-size:11px; color:#8E8E93;" id="gjMassageKetFS1">0 Jam</span></div>
                                <span id="gjMassageFS1Rp">Rp</span><span id="gjMassageFS1" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px; animation-delay: 0.2s;">
                                <span style="color: #007AFF; font-weight: 600;">Total Gaji FS 1</span>
                                <span style="color: #007AFF; font-weight: 700;">Rp</span><span id="gajiTotalFS1" style="color: #007AFF; font-weight: 700; text-align: right;">0</span>
                            </div>
                        </div>

                        <h4 style="margin: 10px 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase;">Pendapatan Five Star 2</h4>
                        <div class="data-grid" style="margin-bottom: 16px;">
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.25s;">
                                <div style="display:flex; flex-direction:column;"><span>Gaji Pokok</span><span style="font-size:11px; color:#8E8E93;">Tetap</span></div>
                                <span id="gjPokokRp">Rp</span><span id="gjPokok" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.3s;">
                                <div style="display:flex; flex-direction:column;"><span>Reflexy FS 2</span><span style="font-size:11px; color:#8E8E93;" id="gjReflexyKet">0 Jam</span></div>
                                <span id="gjReflexyRp">Rp</span><span id="gjReflexy" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.35s;">
                                <div style="display:flex; flex-direction:column;"><span>Massage FS 2</span><span style="font-size:11px; color:#8E8E93;" id="gjMassageKet">0 Jam</span></div>
                                <span id="gjMassageRp">Rp</span><span id="gjMassage" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.4s;">
                                <div style="display:flex; flex-direction:column;"><span>Uang Makan</span><span style="font-size:11px; color:#8E8E93;" id="gjMakanKet">0 Hari</span></div>
                                <span id="gjMakanRp">Rp</span><span id="gjMakan" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.45s;">
                                <div style="display:flex; flex-direction:column;"><span>Bonus (FS1 + FS2)</span><span style="font-size:11px; color:#8E8E93;" id="gjBonusKet">0 Jam</span></div>
                                <span id="gjBonusRp">Rp</span><span id="gjBonus" style="font-weight: 600; text-align: right;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px; animation-delay: 0.5s;">
                                <span style="color: #007AFF; font-weight: 600;">Total Kotor FS 2</span>
                                <span style="color: #007AFF; font-weight: 700;">Rp</span><span id="gajiTotalKotor" style="color: #007AFF; font-weight: 700; text-align: right;">0</span>
                            </div>
                        </div>

                        <h4 class="data-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.55s;">Pengeluaran (Potongan FS 2)</h4>
                        <div class="data-grid" style="margin-bottom: 20px;">
                            
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.56s;">
                                <div style="display:flex; flex-direction:column;"><span>Alpa</span><span style="font-size:11px; color:#8E8E93;" id="gjAlpaKet">0 Hari</span></div>
                                <span id="gjAlpaRp">Rp</span><span id="gjAlpa" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.57s;">
                                <div style="display:flex; flex-direction:column;"><span>Izin</span><span style="font-size:11px; color:#8E8E93;" id="gjIzinKet">0 Hari</span></div>
                                <span id="gjIzinRp">Rp</span><span id="gjIzin" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.58s;">
                                <div style="display:flex; flex-direction:column;"><span>Sakit</span><span style="font-size:11px; color:#8E8E93;" id="gjSakitKet">0 Hari</span></div>
                                <span id="gjSakitRp">Rp</span><span id="gjSakit" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.59s;">
                                <div style="display:flex; flex-direction:column;"><span>Telat</span><span style="font-size:11px; color:#8E8E93;" id="gjTelatKet">0 Hari</span></div>
                                <span id="gjTelatRp">Rp</span><span id="gjTelat" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.6s;">
                                <span>Kasbon</span><span id="gjKasbonRp">Rp</span><span id="gjKasbon" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.65s;">
                                <span>Paket</span><span id="gjPaketRp">Rp</span><span id="gjPaket" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; border: 1px solid rgba(255, 59, 48, 0.2); background: rgba(255, 59, 48, 0.05); margin-top: 2px; animation-delay: 0.7s;">
                                <span style="color: #FF3B30; font-weight: 600;">Total Potongan</span>
                                <span style="color: #FF3B30; font-weight: 700;">Rp</span><span id="gajiTotalKeluar" style="color: #FF3B30; font-weight: 700; text-align: right;">0</span>
                            </div>
                        </div>

                        <h4 class="data-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.75s;">Penerimaan Bersih</h4>
                        
                        <div class="data-grid data-item-animate" style="animation-delay: 0.8s; margin-bottom: 10px;">
                            <div class="data-item" style="display: grid; grid-template-columns: 1fr 25px 100px; align-items: center; background: linear-gradient(135deg, #007AFF, #0056b3); border-radius: 14px;">
                                <div style="display:flex; flex-direction:column;">
                                    <span style="color: white; font-weight: 600;">Bersih FS 1</span>
                                    <span style="font-size:10px; color: rgba(255,255,255,0.8);">Murni Komisi</span>
                                </div>
                                <span style="color: white; font-weight: 700;">Rp</span><span id="gajiBersihFS1" style="color: white; font-weight: 700; text-align: right; font-size: 18px;">0</span>
                            </div>
                        </div>

                        <div class="data-grid data-item-animate" style="animation-delay: 0.85s;">
                            <div class="data-item" style="display: grid; grid-template-columns: 1fr 25px 100px; align-items: center; background: linear-gradient(135deg, #34C759, #30D158); border-radius: 14px;">
                                <div style="display:flex; flex-direction:column;">
                                    <span style="color: white; font-weight: 600;">Bersih FS 2</span>
                                    <span style="font-size:10px; color: rgba(255,255,255,0.8);">FS 2 Kotor - Potongan</span>
                                </div>
                                <span style="color: white; font-weight: 700;">Rp</span><span id="gajiBersihFS2" style="color: white; font-weight: 700; text-align: right; font-size: 18px;">0</span>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr;">
                    <button class="btn-batal" onclick="tutupMenuGaji()" style="color: #007AFF !important;">Tutup</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    
    const d = new Date();
    document.getElementById('inputPeriodeGaji').value = namaBulanGaji[d.getMonth()] + " " + d.getFullYear();
    document.getElementById('areaHasilGaji').classList.remove('show');
    modal.style.display = 'flex';
}

// 3. LOGIKA UTAMA: FIRESTORE PARALLEL (Cek Kolom 'Kantor')
async function prosesGaji() {
    const periode = document.getElementById('inputPeriodeGaji').value;
    const btn = document.getElementById('btnHitungGaji');
    const userAuth = firebase.auth().currentUser;

    if (!userAuth) return;
    btn.innerText = "Menghitung...";
    btn.disabled = true;

    const p = periode.split(' ');
    const blnNama = p[0];
    const thnId = parseInt(p[1]);
    const blnIndex = namaBulanGaji.indexOf(blnNama);
    const blnTahunId = blnNama + "_" + thnId; 
    const uid = userAuth.uid;

    let jamReflexyFS1 = 0, jamMassageFS1 = 0;
    let jamReflexyFS2 = 0, jamMassageFS2 = 0;
    
    // Variabel Absen
    let hariMasuk = 0, hariAlpa = 0, hariIzin = 0, hariSakit = 0, hariTelat = 0;
    
    let valKasbon = 0, valPaket = 0;

    try {
        let listKerjaPromises = [];
        let listKasbonPromises = [];
        let listAbsenPromises = [];

        // MENDAPATKAN JUMLAH HARI DALAM 1 BULAN
        const daysInMonth = new Date(thnId, blnIndex + 1, 0).getDate();
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

        for (let i = 1; i <= daysInMonth; i++) {
            const dObj = new Date(thnId, blnIndex, i);
            const tglFullStr = dObj.toLocaleDateString('id-ID', opsi); 
            const dateId = tglFullStr.replace(', ', '_').replace(/\s/g, '_'); 

            const baseRef = window.firestore.collection('data').doc(uid);
            
            listKerjaPromises.push(baseRef.collection('kerja').doc(blnTahunId).collection(dateId).get());
            listKasbonPromises.push(baseRef.collection('kasbon').doc(blnTahunId).collection(dateId).get());
            listAbsenPromises.push(baseRef.collection('absen').doc(blnTahunId).collection(dateId).doc('harian').get());
        }

        const [allKerjaSnap, allKasbonSnap, allAbsenSnap] = await Promise.all([
            Promise.all(listKerjaPromises),
            Promise.all(listKasbonPromises),
            Promise.all(listAbsenPromises)
        ]);

        // --- STEP C: Olah Kerja ---
        allKerjaSnap.forEach(snap => {
            snap.forEach(doc => {
                const item = doc.data();
                if (item.detail_jam) {
                    if (item.kantor === 'FIVE STAR 1') {
                        jamReflexyFS1 += parseFloat(item.detail_jam.reflexy || 0);
                        jamMassageFS1 += parseFloat(item.detail_jam.massage || 0);
                    } else {
                        jamReflexyFS2 += parseFloat(item.detail_jam.reflexy || 0);
                        jamMassageFS2 += parseFloat(item.detail_jam.massage || 0);
                    }
                }
            });
        });

        // --- STEP D: Olah Kasbon ---
        allKasbonSnap.forEach(snap => {
            snap.forEach(doc => {
                const item = doc.data();
                const jml = parseInt(item.jumlah || 0);
                if (item.jenis === 'KANTOR') valKasbon += jml;
                else valPaket += jml;
            });
        });

        // --- STEP E: Olah Absen (Uang Makan Hanya untuk "Masuk") ---
        allAbsenSnap.forEach(doc => {
            if (doc.exists) {
                const item = doc.data();
                if (item.status === 'Masuk') {
                    hariMasuk++; // Hanya "Masuk" yang dapat Uang Makan
                } else if (item.status === 'Telat') {
                    // Telat TIDAK dapat uang makan, hanya dicatat sebagai telat
                    hariTelat++;
                } else if (item.status === 'Alpa' || item.status === 'Tanpa Keterangan') {
                    hariAlpa++;
                } else if (item.status === 'Izin') {
                    hariIzin++;
                } else if (item.status === 'Sakit') {
                    hariSakit++;
                }
            }
        });

        // --- STEP F: KALKULASI AKHIR ---
        
        // 1. Kalkulasi FS 1
        const totalGjReflexyFS1 = jamReflexyFS1 * TARIF.REFLEXY;
        const totalGjMassageFS1 = jamMassageFS1 * TARIF.MASSAGE;
        const bersihFS1 = totalGjReflexyFS1 + totalGjMassageFS1;

        // 2. Kalkulasi FS 2 & Potongan
        const totalGjReflexyFS2 = jamReflexyFS2 * TARIF.REFLEXY;
        const totalGjMassageFS2 = jamMassageFS2 * TARIF.MASSAGE;
        const totalUangMakan = hariMasuk * TARIF.MAKAN; // hariMasuk murni hanya dari status "Masuk"
        
        // Bonus digabung dari total jam FS1 dan FS2
        const totalJamAll = jamReflexyFS1 + jamMassageFS1 + jamReflexyFS2 + jamMassageFS2;
        const totalBonusTotal = Math.floor(totalJamAll * TARIF.BONUS_PER_JAM);

        const totalKotorFS2 = TARIF.POKOK + totalGjReflexyFS2 + totalGjMassageFS2 + totalUangMakan + totalBonusTotal;
        
        // --- LOGIKA POTONGAN BARU ---
        const potAlpa = hariAlpa * TARIF.POTONGAN_ALPA;
        
        // RUMUS IZIN: (Gaji Pokok / Jumlah Hari di Bulan Tersebut) * Jumlah Hari Izin
        const potonganIzinPerHari = Math.round(TARIF.POKOK / daysInMonth);
        const potIzin = hariIzin * potonganIzinPerHari;
        
        const potSakit = hariSakit * TARIF.POTONGAN_SAKIT;
        const potTelat = hariTelat * TARIF.POTONGAN_TELAT;
        
        const totalKeluar = valKasbon + valPaket + potAlpa + potIzin + potSakit + potTelat;
        const bersihFS2 = totalKotorFS2 - totalKeluar;

        // --- UPDATE UI ---
        document.getElementById('gjReflexyKetFS1').innerText = jamReflexyFS1.toFixed(1).replace('.0', '') + " Jam";
        document.getElementById('gjMassageKetFS1').innerText = jamMassageFS1.toFixed(1).replace('.0', '') + " Jam";
        setNilaiGaji('gjReflexyFS1', totalGjReflexyFS1);
        setNilaiGaji('gjMassageFS1', totalGjMassageFS1);
        setNilaiGaji('gajiTotalFS1', bersihFS1);

        document.getElementById('gjReflexyKet').innerText = jamReflexyFS2.toFixed(1).replace('.0', '') + " Jam";
        document.getElementById('gjMassageKet').innerText = jamMassageFS2.toFixed(1).replace('.0', '') + " Jam";
        document.getElementById('gjMakanKet').innerText = hariMasuk + " Hari"; // Hanya menampilkan hari murni Masuk
        document.getElementById('gjBonusKet').innerText = totalJamAll.toFixed(1).replace('.0', '') + " Jam"; 

        setNilaiGaji('gjPokok', TARIF.POKOK);
        setNilaiGaji('gjReflexy', totalGjReflexyFS2);
        setNilaiGaji('gjMassage', totalGjMassageFS2);
        setNilaiGaji('gjMakan', totalUangMakan);
        setNilaiGaji('gjBonus', totalBonusTotal);
        setNilaiGaji('gajiTotalKotor', totalKotorFS2);

        // Update UI Potongan
        document.getElementById('gjAlpaKet').innerText = hariAlpa + " Hari";
        setNilaiGaji('gjAlpa', potAlpa);
        
        document.getElementById('gjIzinKet').innerText = hariIzin + " Hari";
        setNilaiGaji('gjIzin', potIzin);
        
        document.getElementById('gjSakitKet').innerText = hariSakit + " Hari";
        setNilaiGaji('gjSakit', potSakit);
        
        document.getElementById('gjTelatKet').innerText = hariTelat + " Hari";
        setNilaiGaji('gjTelat', potTelat);

        setNilaiGaji('gjKasbon', valKasbon);
        setNilaiGaji('gjPaket', valPaket);
        setNilaiGaji('gajiTotalKeluar', totalKeluar);
        
        document.getElementById('gajiBersihFS1').innerText = new Intl.NumberFormat('id-ID').format(bersihFS1);
        document.getElementById('gajiBersihFS2').innerText = new Intl.NumberFormat('id-ID').format(bersihFS2);

        document.getElementById('areaHasilGaji').classList.add('show');

    } catch (e) {
        console.error(e);
        IOSAlert.show("Gagal", "Kesalahan memproses gaji: " + e.message);
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-calculator"></i> Hitung Gaji';
        btn.disabled = false;
    }
}

// --- FUNGSI HELPER UI ---
const setNilaiGaji = (idRoot, angka) => {
    const rpEl = document.getElementById(idRoot + 'Rp');
    const valEl = document.getElementById(idRoot);
    if (!angka || angka === 0) {
        if(rpEl) rpEl.innerText = "-";
        valEl.innerText = "-";
    } else {
        if(rpEl) rpEl.innerText = "Rp";
        valEl.innerText = new Intl.NumberFormat('id-ID').format(angka);
    }
};

// --- LOGIKA PICKER PERIODE ---
let tempPeriodeDateGaji = new Date();

function bukaPickerPeriodeGaji() {
    let picker = document.getElementById('pickerMYGaji');
    if (!picker) {
        picker = document.createElement('div');
        picker.id = 'pickerMYGaji';
        picker.className = 'ios-overlay';
        picker.style.zIndex = '26000';
        document.body.appendChild(picker);
    }
    renderPickerMYGajiInner(true);
    picker.style.display = 'flex';
}

function renderPickerMYGajiInner(withAnim = false) {
    const thn = tempPeriodeDateGaji.getFullYear();
    const blnAktif = tempPeriodeDateGaji.getMonth();
    const picker = document.getElementById('pickerMYGaji');
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="ubahThnGaji(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="bukaYearPickerGaji()" style="margin:0; cursor:pointer;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="ubahThnGaji(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">
                ${namaBulanGaji.map((b, i) => `<div class="grid-item ${blnAktif === i ? 'active' : ''}" onclick="setBlnGaji(${i})" style="padding: 12px 0;">${b.substring(0,3)}</div>`).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px;"><button class="btn-text-batal" onclick="document.getElementById('pickerMYGaji').style.display='none'">BATAL</button></div>
        </div>`;
}

function setBlnGaji(i) {
    tempPeriodeDateGaji.setMonth(i);
    document.getElementById('inputPeriodeGaji').value = namaBulanGaji[i] + " " + tempPeriodeDateGaji.getFullYear();
    document.getElementById('pickerMYGaji').style.display = 'none';
    const resArea = document.getElementById('areaHasilGaji');
    if(resArea) resArea.classList.remove('show');
}

function ubahThnGaji(v, isYearOnly = false) {
    tempPeriodeDateGaji.setFullYear(tempPeriodeDateGaji.getFullYear() + v);
    if(isYearOnly) renderYearPickerGajiInner(false); else renderPickerMYGajiInner(false);
}

function setThnGaji(y) {
    tempPeriodeDateGaji.setFullYear(y);
    if(document.getElementById('pickerYearOnlyGaji')) document.getElementById('pickerYearOnlyGaji').style.display = 'none';
    renderPickerMYGajiInner(false);
}

function bukaYearPickerGaji() {
    let yrPicker = document.getElementById('pickerYearOnlyGaji');
    if (!yrPicker) {
        yrPicker = document.createElement('div');
        yrPicker.id = 'pickerYearOnlyGaji';
        yrPicker.className = 'ios-overlay';
        yrPicker.style.zIndex = '27000';
        document.body.appendChild(yrPicker);
    }
    renderYearPickerGajiInner(true);
    yrPicker.style.display = 'flex';
}

function renderYearPickerGajiInner(withAnim = false) {
    const startY = tempPeriodeDateGaji.getFullYear() - 4;
    const endY = startY + 11;
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    for (let y = startY; y <= endY; y++) {
        yearHtml += `<div class="grid-item ${y === tempPeriodeDateGaji.getFullYear() ? 'active' : ''}" onclick="setThnGaji(${y})" style="padding: 12px 0;">${y}</div>`;
    }
    document.getElementById('pickerYearOnlyGaji').innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="ubahThnGaji(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px;">Pilih Tahun</h2>
                <button class="btn-icon-edit" onclick="ubahThnGaji(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">${yearHtml}</div>
            <div style="text-align: center; margin-top: 20px;"><button class="btn-text-batal" onclick="document.getElementById('pickerYearOnlyGaji').style.display='none'">BATAL</button></div>
        </div>`;
}

function tutupMenuGaji() { document.getElementById('gajiModal').style.display = 'none'; }
