// rincian.js - Modul Laporan Rincian Jam Kerja (UID Root Architecture & Async Logic)

let isRincianProcessing = false;

// CSS Khusus Animasi
if (!document.getElementById('rincian-animation-style')) {
    const style = document.createElement('style');
    style.id = 'rincian-animation-style';
    style.innerHTML = `
        @keyframes staggeredFadeIn {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .rincian-item-animate {
            opacity: 0;
            animation: staggeredFadeIn 0.4s ease-out forwards;
        }
        #areaHasilRincian {
            transition: max-height 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
            max-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            opacity: 0;
            display: block !important; 
        }
        #areaHasilRincian.show {
            max-height: 600px;
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

function bukaMenuRincian(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('rincianModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rincianModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="flex-shrink: 0;">
                    <h3>Rekap Jam Kerja</h3>
                </div>
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex-grow: 1; overflow: visible;">
                    <div style="padding: 15px 20px; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div class="input-group">
                                <label>Dari Tanggal</label>
                                <input type="text" id="inputRincianDari" readonly 
                                    onclick="bukaKalenderVisual('inputRincianDari')" placeholder="Pilih Tanggal Awal"
                                    style="cursor: pointer; font-weight: 600; text-align: center;">
                            </div>
                            <div class="input-group">
                                <label>Sampai Tanggal</label>
                                <input type="text" id="inputRincianSampai" readonly 
                                    onclick="bukaKalenderVisual('inputRincianSampai')" placeholder="Pilih Tanggal Akhir"
                                    style="cursor: pointer; font-weight: 600; text-align: center;">
                            </div>
                        </div>
                        <button id="btnProsesRincian" onclick="prosesRincian()" style="margin-top:15px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; border-radius: 10px; background: #007AFF; color: white; font-weight: 600; font-size: 15px; cursor: pointer;">
                            <i class="fa-solid fa-magnifying-glass"></i> Tampilkan Rekap
                        </button>
                    </div>

                    <div id="areaHasilRincian" style="padding: 0 20px 20px 20px; flex-grow: 1; text-align: left;">
                        
                        <h4 class="rincian-item-animate" style="margin: 20px 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.1s;">FIVE STAR 1</h4>
                        <div class="data-grid rincian-item-animate" style="margin-bottom: 16px; animation-delay: 0.15s;">
                            <div class="data-item"><span>Reflexy</span><p id="rPusatReflexy">0 Jam</p></div>
                            <div class="data-item"><span>Massage</span><p id="rPusatMassage">0 Jam</p></div>
                            <div class="data-item" style="border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px;">
                                <span style="color: #007AFF; font-weight: 600;">Total FS1</span>
                                <p id="rPusatTotal" style="color: #007AFF; font-weight: 700;">0 Jam</p>
                            </div>
                        </div>

                        <h4 class="rincian-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.25s;">FIVE STAR 2</h4>
                        <div class="data-grid rincian-item-animate" style="margin-bottom: 16px; animation-delay: 0.3s;">
                            <div class="data-item"><span>Reflexy</span><p id="rCabangReflexy">0 Jam</p></div>
                            <div class="data-item"><span>Massage</span><p id="rCabangMassage">0 Jam</p></div>
                            <div class="data-item" style="border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px;">
                                <span style="color: #007AFF; font-weight: 600;">Total FS2</span>
                                <p id="rCabangTotal" style="color: #007AFF; font-weight: 700;">0 Jam</p>
                            </div>
                        </div>

                        <h4 class="rincian-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.4s;">Total Keseluruhan</h4>
                        <div class="data-grid rincian-item-animate" style="padding-bottom: 10px; animation-delay: 0.45s;">
                            <div class="data-item"><span>Total Reflexy</span><p id="rTotalReflexy" style="color:#FF9500;">0 Jam</p></div>
                            <div class="data-item"><span>Total Massage</span><p id="rTotalMassage" style="color:#AF52DE;">0 Jam</p></div>
                            <div class="data-item" style="background: linear-gradient(135deg, #34C759, #30D158); border-radius: 14px; margin-top: 4px;">
                                <span style="color: rgba(255,255,255,0.9); font-weight: 500;">Grand Total</span>
                                <p id="rGrandTotal" style="color: white; font-size: 20px;">0 Jam</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr; flex-shrink: 0;">
                    <button onclick="tutupMenuRincian()" style="width: 100%; padding: 15px; background: transparent; border: none; color: #007AFF; font-size: 17px; font-weight: 600; cursor: pointer;">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Set default awal bulan sampai hari ini
    const d = new Date();
    document.getElementById('inputRincianDari').value = "1 " + bulanIndo[d.getMonth()] + " " + d.getFullYear();
    document.getElementById('inputRincianSampai').value = getTanggalHariIni();

    document.getElementById('areaHasilRincian').classList.remove('show');
    modal.style.display = 'flex';
}

// LOGIKA UTAMA: Menelusuri jalur UID > data > Bulan_Tahun > kerja
async function prosesRincian() {
    const tglDariStr = document.getElementById('inputRincianDari').value;
    const tglSampaiStr = document.getElementById('inputRincianSampai').value;
    const btn = document.getElementById('btnProsesRincian');
    const userAuth = firebase.auth().currentUser;

    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");
    if (!tglDariStr || !tglSampaiStr) {
        return IOSAlert.show("Input Kosong", "Pilih rentang tanggal.");
    }

    btn.innerText = "Menghitung...";
    btn.disabled = true;

    const parseIndo = (str) => {
        const p = str.split(" ");
        return new Date(parseInt(p[2]), bulanIndo.indexOf(p[1]), parseInt(p[0]));
    };

    const dDari = parseIndo(tglDariStr);
    const dSampai = parseIndo(tglSampaiStr);

    try {
        // Ambil data dari seluruh folder 'data' milik UID
        const snapshot = await window.db.ref(`${userAuth.uid}/data`).once('value');
        const allMonthsData = snapshot.val();
        
        let rekap = {
            fs1: { reflexy: 0, massage: 0 },
            fs2: { reflexy: 0, massage: 0 }
        };

        if (allMonthsData) {
            // Loop Bulan (Contoh: April_2026, Mei_2026)
            Object.values(allMonthsData).forEach(monthFolder => {
                if (monthFolder.kerja) {
                    // Loop Tanggal di dalam folder kerja (Contoh: 23_April_2026)
                    Object.values(monthFolder.kerja).forEach(dateFolder => {
                        // Loop Entry Kerja (Push ID)
                        Object.values(dateFolder).forEach(item => {
                            const tglItem = parseIndo(item.tanggal);
                            
                            // Filter berdasarkan rentang tanggal
                            if (tglItem >= dDari && tglItem <= dSampai) {
                                const kantor = item.kantor;
                                const target = (kantor === 'FIVE STAR 1') ? rekap.fs1 : rekap.fs2;

                                if (item.detail_jam) {
                                    target.reflexy += parseFloat(item.detail_jam.reflexy || 0);
                                    target.massage += parseFloat(item.detail_jam.massage || 0);
                                }
                            }
                        });
                    });
                }
            });
        }

        // Hitung Hasil Akhir
        const fs1Total = rekap.fs1.reflexy + rekap.fs1.massage;
        const fs2Total = rekap.fs2.reflexy + rekap.fs2.massage;
        const grandReflexy = rekap.fs1.reflexy + rekap.fs2.reflexy;
        const grandMassage = rekap.fs1.massage + rekap.fs2.massage;
        const grandTotal = fs1Total + fs2Total;

        // Update UI
        const setTxt = (id, val) => document.getElementById(id).innerText = val.toFixed(1).replace('.0', '') + " Jam";
        
        setTxt('rPusatReflexy', rekap.fs1.reflexy);
        setTxt('rPusatMassage', rekap.fs1.massage);
        setTxt('rPusatTotal', fs1Total);
        
        setTxt('rCabangReflexy', rekap.fs2.reflexy);
        setTxt('rCabangMassage', rekap.fs2.massage);
        setTxt('rCabangTotal', fs2Total);
        
        setTxt('rTotalReflexy', grandReflexy);
        setTxt('rTotalMassage', grandMassage);
        setTxt('rGrandTotal', grandTotal);

        // Jalankan Animasi
        const resArea = document.getElementById('areaHasilRincian');
        resArea.classList.remove('show');
        setTimeout(() => { resArea.classList.add('show'); }, 50);

    } catch (e) {
        IOSAlert.show("Gagal", "Terjadi kesalahan saat memuat data.");
        console.error(e);
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tampilkan Rekap';
        btn.disabled = false;
    }
}

function tutupMenuRincian() {
    const modal = document.getElementById('rincianModal');
    if (modal) modal.style.display = 'none';
}
