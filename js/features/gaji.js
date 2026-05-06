// gaji.js - Modul Slip Gaji (UI Compact, Form Fixed, Detail Scrollable, No Footer)

const namaBulanGaji = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// KONFIGURASI TIER BONUS (Bisa diubah nilainya)
// Target = Minimal Jam (FS1+FS2), Nominal = Uang Bonus
const TIER_BONUS = [
    { target: 160, nominal: 500000 }, // X untuk 160 Jam
    { target: 125, nominal: 350000 }, // X untuk 125 Jam
    { target: 85,  nominal: 250000 }, // X untuk 85 Jam
    { target: 50,  nominal: 125000 }  // X untuk 50 Jam
];

const TARIF = {
    POKOK: 900000,
    REFLEXY: 20000, 
    MASSAGE: 21000, 
    MAKAN: 20000,   
    
    // Nominal Potongan Lainnya
    POTONGAN_ALPA: 100000, 
    POTONGAN_SAKIT: 0,
    POTONGAN_TELAT: 0
    // POTONGAN_IZIN dihitung prorata otomatis
};

// 1. CSS ANIMASI & UX COMPACT
if (!document.getElementById('gaji-result-style')) {
    const style = document.createElement('style');
    style.id = 'gaji-result-style';
    style.innerHTML = `
        @keyframes staggeredFadeIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .data-item-animate { opacity: 0; animation: staggeredFadeIn 0.4s ease-out forwards; }
        
        /* Custom Scrollbar iOS Style & Kunci Overscroll */
        #areaHasilGaji {
            transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
            max-height: 0; overflow-y: auto; opacity: 0; display: block !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }
        #areaHasilGaji.show { max-height: 3000px; opacity: 1; }
        #areaHasilGaji::-webkit-scrollbar { width: 4px; }
        #areaHasilGaji::-webkit-scrollbar-thumb { background: rgba(142,142,147,0.3); border-radius: 4px; }

        /* UX FORM AGAR HEMAT TEMPAT & LABEL DI TENGAH TEBAL */
        #gajiModal .input-group { margin-bottom: 12px !important; }
        #gajiModal .input-group label { 
            margin-bottom: 6px !important; 
            font-size: 12px !important; 
            font-weight: 900 !important; 
            text-align: center !important; 
            display: block !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px;
            color: var(--text-primary) !important;
        }
    `;
    document.head.appendChild(style);
}

// 2. FUNGSI BUKA MODAL GAJI (LEVEL 1 / ROOT)
function bukaMenuGaji(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('gajiModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'gajiModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        modal.style.overscrollBehavior = 'none'; // Kunci layar belakang
        
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";

        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 100%; max-width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg);">
                
                <div class="ios-modal-header" style="flex-shrink: 0; border-bottom: 0.5px solid rgba(142,142,147,0.2); padding-top: calc(10px + env(safe-area-inset-top)); padding-bottom: 10px;">
                    <h3 style="margin: 0; color: var(--text-primary); font-size: 15px; text-align: center; width: 100%;">SLIP GAJI</h3>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                    
                    <div style="padding: 12px 15px 5px 15px; flex-shrink: 0; overflow: hidden; border-bottom: 1px dashed rgba(142,142,147,0.2);">
                        <div class="input-group">
                            <label>Periode Gaji</label>
                            <input type="text" id="inputPeriodeGaji" readonly onclick="bukaPickerPeriodeGaji()" placeholder="Pilih Bulan & Tahun" class="custom-box-input" style="${inputStyle} cursor: pointer; font-weight: 600; text-align: center;">
                        </div>
                        <button id="btnHitungGaji" onclick="prosesGaji()" class="btn-simpan" style="margin-top:2px; margin-bottom:10px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; font-weight: bold; border-radius: 10px; background-color: #007AFF !important; color: #FFFFFF !important; font-size: 14px;">
                            <i class="fa-solid fa-calculator"></i> Hitung Gaji
                        </button>
                    </div>

                    <div id="areaHasilGaji" style="padding: 0 15px calc(15px + env(safe-area-inset-bottom)) 15px; overflow-y: auto; flex: 1; background: rgba(142,142,147,0.03); text-align: left;">
                        
                        <h4 style="margin: 15px 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase;">Pendapatan Five Star 1</h4>
                        <div class="data-grid" style="margin-bottom: 16px;">
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.1s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Reflexy FS 1</span><span style="font-size:11px; color:#8E8E93;" id="gjReflexyKetFS1">0 Jam</span></div>
                                <span id="gjReflexyFS1Rp" style="color: var(--text-primary);">Rp</span><span id="gjReflexyFS1" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.15s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Massage FS 1</span><span style="font-size:11px; color:#8E8E93;" id="gjMassageKetFS1">0 Jam</span></div>
                                <span id="gjMassageFS1Rp" style="color: var(--text-primary);">Rp</span><span id="gjMassageFS1" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px; animation-delay: 0.2s;">
                                <span style="color: #007AFF; font-weight: 600;">Total Gaji FS 1</span>
                                <span style="color: #007AFF; font-weight: 700;">Rp</span><span id="gajiTotalFS1" style="color: #007AFF; font-weight: 700; text-align: right;">0</span>
                            </div>
                        </div>

                        <h4 style="margin: 10px 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase;">Pendapatan Five Star 2</h4>
                        <div class="data-grid" style="margin-bottom: 16px;">
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.25s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Gaji Pokok</span><span style="font-size:11px; color:#8E8E93;">Tetap</span></div>
                                <span id="gjPokokRp" style="color: var(--text-primary);">Rp</span><span id="gjPokok" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.3s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Reflexy FS 2</span><span style="font-size:11px; color:#8E8E93;" id="gjReflexyKet">0 Jam</span></div>
                                <span id="gjReflexyRp" style="color: var(--text-primary);">Rp</span><span id="gjReflexy" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.35s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Massage FS 2</span><span style="font-size:11px; color:#8E8E93;" id="gjMassageKet">0 Jam</span></div>
                                <span id="gjMassageRp" style="color: var(--text-primary);">Rp</span><span id="gjMassage" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.4s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Uang Makan</span><span style="font-size:11px; color:#8E8E93;" id="gjMakanKet">0 Hari</span></div>
                                <span id="gjMakanRp" style="color: var(--text-primary);">Rp</span><span id="gjMakan" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.45s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Bonus (Target)</span><span style="font-size:11px; color:#8E8E93;" id="gjBonusKet">0 Jam</span></div>
                                <span id="gjBonusRp" style="color: var(--text-primary);">Rp</span><span id="gjBonus" style="font-weight: 600; text-align: right; color: var(--text-primary);">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px; animation-delay: 0.5s;">
                                <span style="color: #007AFF; font-weight: 600;">Total Kotor FS 2</span>
                                <span style="color: #007AFF; font-weight: 700;">Rp</span><span id="gajiTotalKotor" style="color: #007AFF; font-weight: 700; text-align: right;">0</span>
                            </div>
                        </div>

                        <h4 class="data-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.55s;">Pengeluaran (Potongan FS 2)</h4>
                        <div class="data-grid" style="margin-bottom: 20px;">
                            
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.56s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Alpa</span><span style="font-size:11px; color:#8E8E93;" id="gjAlpaKet">0 Hari</span></div>
                                <span id="gjAlpaRp" style="color: var(--text-primary);">Rp</span><span id="gjAlpa" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.57s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Izin</span><span style="font-size:11px; color:#8E8E93;" id="gjIzinKet">0 Hari</span></div>
                                <span id="gjIzinRp" style="color: var(--text-primary);">Rp</span><span id="gjIzin" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.58s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Sakit</span><span style="font-size:11px; color:#8E8E93;" id="gjSakitKet">0 Hari</span></div>
                                <span id="gjSakitRp" style="color: var(--text-primary);">Rp</span><span id="gjSakit" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.59s;">
                                <div style="display:flex; flex-direction:column;"><span style="color: var(--text-primary);">Telat</span><span style="font-size:11px; color:#8E8E93;" id="gjTelatKet">0 Hari</span></div>
                                <span id="gjTelatRp" style="color: var(--text-primary);">Rp</span><span id="gjTelat" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.6s;">
                                <span style="color: var(--text-primary);">Kasbon</span><span id="gjKasbonRp" style="color: var(--text-primary);">Rp</span><span id="gjKasbon" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
                            </div>
                            <div class="data-item data-item-animate" style="display: grid; grid-template-columns: 1fr 25px 80px; align-items: center; animation-delay: 0.65s;">
                                <span style="color: var(--text-primary);">Paket</span><span id="gjPaketRp" style="color: var(--text-primary);">Rp</span><span id="gjPaket" style="font-weight: 600; text-align: right; color:#FF3B30;">0</span>
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
                                    <span style="color: white; font-weight: 600;">FIVE STAR 1</span>
                                    <span style="font-size:10px; color: rgba(255,255,255,0.8);">Murni Komisi</span>
                                </div>
                                <span style="color: white; font-weight: 700;">Rp</span><span id="gajiBersihFS1" style="color: white; font-weight: 700; text-align: right; font-size: 18px;">0</span>
                            </div>
                        </div>

                        <div class="data-grid data-item-animate" style="animation-delay: 0.85s;">
                            <div class="data-item" style="display: grid; grid-template-columns: 1fr 25px 100px; align-items: center; background: linear-gradient(135deg, #34C759, #30D158); border-radius: 14px;">
                                <div style="display:flex; flex-direction:column;">
                                    <span style="color: white; font-weight: 600;">FIVE STAR 2</span>
                                    <span style="font-size:10px; color: rgba(255,255,255,0.8);">FS 2 Kotor - Potongan</span>
                                </div>
                                <span style="color: white; font-weight: 700;">Rp</span><span id="gajiBersihFS2" style="color: white; font-weight: 700; text-align: right; font-size: 18px;">0</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        // --- KUNCI MATI SCROLL IOS (HANYA IZINKAN DI LIST HASIL GAJI) ---
        modal.addEventListener('touchmove', function(e) {
            const listArea = document.getElementById('areaHasilGaji');
            if (!listArea.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    const d = new Date();
    document.getElementById('inputPeriodeGaji').value = namaBulanGaji[d.getMonth()] + " " + d.getFullYear();
    document.getElementById('areaHasilGaji').classList.remove('show');
    
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    
    // --- LOGIKA SMART BACK BUTTON (LEVELING SINKRON DENGAN MAIN.JS) ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 0;
    const myLvl = baseLvl + 1; // Gaji Modal = Level 1
    history.pushState({ id: 'modalGaji', level: myLvl, rootModal: 'modalGaji' }, '', ''); 
    
    window.handleBackGaji = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const m = document.getElementById('gajiModal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = '';
            window.removeEventListener('popstate', window.handleBackGaji);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackGaji);
    window.addEventListener('popstate', window.handleBackGaji);
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

        // --- STEP E: Olah Absen (Uang Makan & Cek Status Bonus) ---
        allAbsenSnap.forEach(doc => {
            if (doc.exists) {
                const item = doc.data();
                if (item.status === 'Masuk') {
                    hariMasuk++; 
                } else if (item.status === 'Telat') {
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

        // --- STEP F: KALKULASI BONUS TIER ---
        const totalJamAll = jamReflexyFS1 + jamMassageFS1 + jamReflexyFS2 + jamMassageFS2;
        let totalBonusTotal = 0;
        let statusBonusKet = "Aman";

        // Cek Pelanggaran Bonus (Alpa, Izin, Telat membuat bonus 0)
        if (hariAlpa > 0 || hariIzin > 0 || hariTelat > 0) {
            totalBonusTotal = 0;
            statusBonusKet = "Hangus (Absen)";
        } else {
            // Cek Tier Target dari yang tertinggi ke yang terendah
            for (let i = 0; i < TIER_BONUS.length; i++) {
                if (totalJamAll >= TIER_BONUS[i].target) {
                    totalBonusTotal = TIER_BONUS[i].nominal;
                    statusBonusKet = "Lulus " + TIER_BONUS[i].target + " Jam";
                    break; // Jika sudah masuk target atas, stop looping
                }
            }
            if (totalBonusTotal === 0) statusBonusKet = "Tidak Capai Target";
        }

        // --- STEP G: KALKULASI AKHIR ---
        
        // 1. Kalkulasi FS 1
        const totalGjReflexyFS1 = jamReflexyFS1 * TARIF.REFLEXY;
        const totalGjMassageFS1 = jamMassageFS1 * TARIF.MASSAGE;
        const bersihFS1 = totalGjReflexyFS1 + totalGjMassageFS1;

        // 2. Kalkulasi FS 2 & Potongan
        const totalGjReflexyFS2 = jamReflexyFS2 * TARIF.REFLEXY;
        const totalGjMassageFS2 = jamMassageFS2 * TARIF.MASSAGE;
        const totalUangMakan = hariMasuk * TARIF.MAKAN; 

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
        document.getElementById('gjMakanKet').innerText = hariMasuk + " Hari"; 
        
        // Update Ket Bonus Gabungan
        document.getElementById('gjBonusKet').innerText = `${totalJamAll.toFixed(1).replace('.0', '')} Jam (${statusBonusKet})`;

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
        if(typeof IOSAlert !== 'undefined') IOSAlert.show("Gagal", "Kesalahan memproses gaji: " + e.message);
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

// ==========================================
// LOGIKA PICKER PERIODE (SISTEM LEVEL & KONSISTENSI UI)
// ==========================================
let tempPeriodeDateGaji = new Date();

function bukaPickerPeriodeGaji() {
    let picker = document.getElementById('pickerMYGaji');
    if (!picker) {
        picker = document.createElement('div');
        picker.id = 'pickerMYGaji';
        picker.className = 'ios-overlay';
        picker.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); z-index: 26000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);`;
        document.body.appendChild(picker);
    }
    renderPickerMYGajiInner(true);
    picker.style.display = 'flex';

    // --- STEP NAVIGATION LOGIC (Level 2) ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'pickerBulanGaji', level: myLvl }, '', '');

    window.handleBackPickerBulanGaji = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const p = document.getElementById('pickerMYGaji');
            if (p) p.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerBulanGaji);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerBulanGaji);
}

function renderPickerMYGajiInner(withAnim = false) {
    const thn = tempPeriodeDateGaji.getFullYear();
    const blnAktif = tempPeriodeDateGaji.getMonth();
    const picker = document.getElementById('pickerMYGaji');
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    // KONSISTENSI: Width 320px, Height 380px, Grid 3 kolom
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; height: 380px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="ubahThnGaji(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="bukaYearPickerGaji()" style="margin:0; cursor:pointer; color: var(--text-primary); font-size: 18px;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="ubahThnGaji(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex-grow: 1; align-content: center;">
                ${namaBulanGaji.map((b, i) => `
                    <div class="grid-item ${blnAktif === i ? 'active' : ''}" 
                         onclick="setBlnGaji(${i})" style="padding: 12px 0; text-align: center; border-radius: 8px;">${b.substring(0,3)}</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: auto; flex-shrink: 0; padding-top: 15px;">
                <button class="btn-text-batal" onclick="tutupPickerBulanGaji()" style="width: 100%; border: none; background: transparent; color: #FF3B30; font-weight: 700; padding: 10px; font-size: 16px;">BATAL</button>
            </div>
        </div>
    `;
}

function tutupPickerBulanGaji() {
    if (history.state && history.state.id === 'pickerBulanGaji') {
        history.back();
    } else {
        const p = document.getElementById('pickerMYGaji');
        if(p) p.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackPickerBulanGaji);
    }
}

function setBlnGaji(i) {
    tempPeriodeDateGaji.setMonth(i);
    document.getElementById('inputPeriodeGaji').value = namaBulanGaji[i] + " " + tempPeriodeDateGaji.getFullYear();
    tutupPickerBulanGaji(); // Mundur 1 step secara aman
    const resArea = document.getElementById('areaHasilGaji');
    if(resArea) resArea.classList.remove('show');
}

function ubahThnGaji(v, isYearOnly = false) {
    tempPeriodeDateGaji.setFullYear(tempPeriodeDateGaji.getFullYear() + v);
    if(isYearOnly) renderYearPickerGajiInner(false); 
    else renderPickerMYGajiInner(false);
}

// --- PICKER TAHUN ---
function bukaYearPickerGaji() {
    let yrPicker = document.getElementById('pickerYearOnlyGaji');
    if (!yrPicker) {
        yrPicker = document.createElement('div');
        yrPicker.id = 'pickerYearOnlyGaji';
        yrPicker.className = 'ios-overlay';
        yrPicker.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); z-index: 27000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);`;
        document.body.appendChild(yrPicker);
    }
    renderYearPickerGajiInner(true);
    yrPicker.style.display = 'flex';

    // --- STEP NAVIGATION LOGIC (Level 3) ---
    const baseLvl = (history.state && history.state.level) ? history.state.level : 10;
    const myLvl = baseLvl + 1;
    history.pushState({ id: 'pickerTahunGaji', level: myLvl }, '', '');

    window.handleBackPickerTahunGaji = function(e) {
        const currentLvl = e.state ? (e.state.level || 0) : 0;
        if (currentLvl < myLvl) {
            const y = document.getElementById('pickerYearOnlyGaji');
            if (y) y.style.display = 'none';
            window.removeEventListener('popstate', window.handleBackPickerTahunGaji);
        }
    };
    window.addEventListener('popstate', window.handleBackPickerTahunGaji);
}

function renderYearPickerGajiInner(withAnim = false) {
    const startY = tempPeriodeDateGaji.getFullYear() - 4;
    const endY = startY + 11; // 12 Kotak
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    for (let y = startY; y <= endY; y++) {
        yearHtml += `<div class="grid-item ${y === tempPeriodeDateGaji.getFullYear() ? 'active' : ''}" onclick="setThnGaji(${y})" style="padding: 12px 0; text-align: center; border-radius: 8px;">${y}</div>`;
    }
    
    const yrPicker = document.getElementById('pickerYearOnlyGaji');
    if(!yrPicker) return;

    // KONSISTENSI: Width 320px, Height 380px, Grid 3 kolom
    yrPicker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 320px; height: 380px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; ${animStyle}; background: var(--card-bg); border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0;">
                <button class="btn-icon-edit" onclick="ubahThnGaji(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px; color: var(--text-primary);">${startY} - ${endY}</h2>
                <button class="btn-icon-edit" onclick="ubahThnGaji(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex-grow: 1; align-content: center;">
                ${yearHtml}
            </div>
            <div style="text-align: center; margin-top: auto; flex-shrink: 0; padding-top: 15px;">
                <button class="btn-text-batal" onclick="tutupPickerTahunGaji()" style="width: 100%; border: none; background: transparent; color: #FF3B30; font-weight: 700; padding: 10px; font-size: 16px;">BATAL</button>
            </div>
        </div>
    `;
}

function tutupPickerTahunGaji() {
    if (history.state && history.state.id === 'pickerTahunGaji') {
        history.back();
    } else {
        const yrPicker = document.getElementById('pickerYearOnlyGaji');
        if(yrPicker) yrPicker.style.display = 'none';
        window.removeEventListener('popstate', window.handleBackPickerTahunGaji);
    }
}

function setThnGaji(y) {
    tempPeriodeDateGaji.setFullYear(y);
    tutupPickerTahunGaji(); // Mundur 1 step (Tutup Tahun)
    renderPickerMYGajiInner(false); // Refresh Bulan di bawahnya
}

function tutupMenuGaji() {
    if (history.state && history.state.id === 'modalGaji') {
        history.back(); // Trigger pembersihan lewat PopState
    } else {
        const modal = document.getElementById('gajiModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        window.removeEventListener('popstate', window.handleBackGaji);
    }
}
