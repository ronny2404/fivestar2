// rincian.js - Modul Laporan Rincian Jam Kerja (UI Compact, Form Fixed, Detail Scrollable, No Footer)

window.bulanIndo = window.bulanIndo || ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// 1. CSS KHUSUS ANIMASI & UX COMPACT
if (!document.getElementById('rincian-animation-style')) {
    const style = document.createElement('style');
    style.id = 'rincian-animation-style';
    style.innerHTML = `
        @keyframes staggeredFadeIn {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .rincian-item-animate { opacity: 0; animation: staggeredFadeIn 0.4s ease-out forwards; }
        
        /* Custom Scrollbar iOS Style & Kunci Overscroll */
        #areaHasilRincian {
            transition: max-height 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
            max-height: 0; overflow-y: auto; opacity: 0; display: block !important; 
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }
        #areaHasilRincian.show { max-height: 2500px; opacity: 1; }
        #areaHasilRincian::-webkit-scrollbar { width: 4px; }
        #areaHasilRincian::-webkit-scrollbar-thumb { background: rgba(142,142,147,0.3); border-radius: 4px; }

        /* UX FORM AGAR HEMAT TEMPAT & LABEL DI TENGAH TEBAL */
        #rincianModal .input-group { margin-bottom: 12px !important; }
        #rincianModal .input-group label { 
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

// 2. MODAL UTAMA (LEVEL 1 / ROOT MODAL)
function bukaMenuRincian(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('rincianModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rincianModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        modal.style.overscrollBehavior = 'none'; // Kunci layar belakang
        
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 12px; border-radius: 10px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 14px; transition: 0.3s;";

        // Tentukan tombol kembali: Hanya muncul jika isIos() bernilai true
        const tombolKembaliIos = isIos() ?
            `<button onclick="tutupPopupKerja()" style="background:transparent; border:none; color:#007AFF; font-size:16px; padding: 5px 10px; display:flex; align-items:center; gap:5px; position:absolute; left:10px; z-index:10; top: 50%; transform: translateY(-50%);">
                    <i class="fa-solid fa-chevron-left"></i> Selesai
               </button>` :
            '';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 100%; max-width: 100%; height: 100%; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; background: var(--card-bg);">
                
                <div class="ios-modal-header" style="flex-shrink: 0; border-bottom: 0.5px solid rgba(142,142,147,0.2); padding-top: calc(10px + env(safe-area-inset-top)); padding-bottom: 10px; position: relative; display: flex; align-items: center; justify-content: center;">
                    
                    ${tombolKembaliIos} <h3 style="margin: 0; color: var(--text-primary); font-size: 20px; text-align: center; width: 100%;">REKAP JAM KERJA</h3>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex-grow: 1; overflow: hidden;">
                    
                    <div style="padding: 12px 15px 5px 15px; flex-shrink: 0; border-bottom: 1px dashed rgba(142,142,147,0.2);">
                        <div style="display: flex; flex-direction: column;">
                            <div class="input-group">
                                <label>Dari Tanggal</label>
                                <input type="text" id="inputRincianDari" readonly 
                                    onclick="if(typeof bukaKalenderVisual === 'function') bukaKalenderVisual('inputRincianDari')" placeholder="Pilih Tanggal Awal"
                                    class="custom-box-input" style="${inputStyle} cursor: pointer; font-weight: 600; text-align: center;">
                            </div>
                            <div class="input-group">
                                <label>Sampai Tanggal</label>
                                <input type="text" id="inputRincianSampai" readonly 
                                    onclick="if(typeof bukaKalenderVisual === 'function') bukaKalenderVisual('inputRincianSampai')" placeholder="Pilih Tanggal Akhir"
                                    class="custom-box-input" style="${inputStyle} cursor: pointer; font-weight: 600; text-align: center;">
                            </div>
                        </div>
                        <button id="btnProsesRincian" onclick="prosesRincian()" class="btn-simpan" style="margin-top:2px; margin-bottom:10px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; font-weight: bold; border-radius: 10px; background-color: #007AFF !important; color: #FFFFFF !important; font-size: 14px;">
                            <i class="fa-solid fa-magnifying-glass"></i> Tampilkan Rekap
                        </button>
                    </div>

                    <div id="areaHasilRincian" style="padding: 0 15px calc(15px + env(safe-area-inset-bottom)) 15px; overflow-y: auto; flex-grow: 1; background: rgba(142,142,147,0.03); text-align: left;">
                        
                        <h4 class="rincian-item-animate" style="margin: 15px 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.1s;">FIVE STAR 1</h4>
                        <div class="data-grid rincian-item-animate" style="margin-bottom: 16px; animation-delay: 0.15s;">
                            <div class="data-item"><span>Reflexy</span><p id="rPusatReflexy" style="font-weight: bold; color: var(--text-primary);">0 Jam</p></div>
                            <div class="data-item"><span>Massage</span><p id="rPusatMassage" style="font-weight: bold; color: var(--text-primary);">0 Jam</p></div>
                            <div class="data-item" style="border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px;">
                                <span style="color: #007AFF; font-weight: 600;">Total FS1</span>
                                <p id="rPusatTotal" style="color: #007AFF; font-weight: 700;">0 Jam</p>
                            </div>
                        </div>

                        <h4 class="rincian-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.25s;">FIVE STAR 2</h4>
                        <div class="data-grid rincian-item-animate" style="margin-bottom: 16px; animation-delay: 0.3s;">
                            <div class="data-item"><span>Reflexy</span><p id="rCabangReflexy" style="font-weight: bold; color: var(--text-primary);">0 Jam</p></div>
                            <div class="data-item"><span>Massage</span><p id="rCabangMassage" style="font-weight: bold; color: var(--text-primary);">0 Jam</p></div>
                            <div class="data-item" style="border: 1px solid rgba(0, 122, 255, 0.2); background: rgba(0, 122, 255, 0.05); margin-top: 2px;">
                                <span style="color: #007AFF; font-weight: 600;">Total FS2</span>
                                <p id="rCabangTotal" style="color: #007AFF; font-weight: 700;">0 Jam</p>
                            </div>
                        </div>

                        <h4 class="rincian-item-animate" style="margin: 0 0 8px 5px; font-size: 11px; color: #8E8E93; text-transform: uppercase; animation-delay: 0.4s;">Total Keseluruhan</h4>
                        <div class="data-grid rincian-item-animate" style="padding-bottom: 10px; animation-delay: 0.45s;">
                            <div class="data-item"><span>Total Reflexy</span><p id="rTotalReflexy" style="color:#FF9500; font-weight: bold;">0 Jam</p></div>
                            <div class="data-item"><span>Total Massage</span><p id="rTotalMassage" style="color:#AF52DE; font-weight: bold;">0 Jam</p></div>
                            <div class="data-item" style="background: linear-gradient(135deg, #34C759, #30D158); border-radius: 14px; margin-top: 4px;">
                                <span style="color: rgba(255,255,255,0.9); font-weight: 500;">Grand Total</span>
                                <p id="rGrandTotal" style="color: white; font-size: 20px; font-weight: bold;">0 Jam</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // --- KUNCI MATI SCROLL IOS (HANYA IZINKAN DI LIST HASIL) ---
        modal.addEventListener('touchmove', function(e) {
            const listArea = document.getElementById('areaHasilRincian');
            if (!listArea.contains(e.target)) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    const d = new Date();
    const tglSatu = new Date(d.getFullYear(), d.getMonth(), 1);
    const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    
    document.getElementById('inputRincianDari').value = tglSatu.toLocaleDateString('id-ID', opsi);

    if(typeof getTanggalHariIni === 'function') {
        document.getElementById('inputRincianSampai').value = getTanggalHariIni();
    }

    document.getElementById('areaHasilRincian').classList.remove('show');
    
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';
    
    // --- FIX LOGIKA TOMBOL BACK HP (STRICT ID SINKRON DENGAN MAIN.JS) ---
    history.pushState({ id: 'modalRincian' }, '', ''); 
    
    window.handleBackRincian = function(e) {
        if (!e.state || e.state.id === 'dashboardRoot') {
            const m = document.getElementById('rincianModal');
            if (m) m.style.display = 'none';
            document.body.style.overflow = '';
            window.removeEventListener('popstate', window.handleBackRincian);
        }
    };
    
    window.removeEventListener('popstate', window.handleBackRincian);
    window.addEventListener('popstate', window.handleBackRincian);

}

// 3. LOGIKA UTAMA: FIRESTORE PARALLEL FETCHING
async function prosesRincian() {
    const tglDariStr = document.getElementById('inputRincianDari').value;
    const tglSampaiStr = document.getElementById('inputRincianSampai').value;
    const btn = document.getElementById('btnProsesRincian');
    const userAuth = firebase.auth().currentUser;

    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");
    if (!tglDariStr || !tglSampaiStr) return IOSAlert.show("Input Kosong", "Pilih rentang tanggal.");

    btn.innerText = "Mencari Data...";
    btn.disabled = true;

    const parseIndo = (str) => {
        const cleanStr = str.includes(', ') ? str.split(', ')[1] : str;
        const p = cleanStr.split(" ");
        return new Date(parseInt(p[2]), window.bulanIndo.indexOf(p[1]), parseInt(p[0]));
    };

    const dDari = parseIndo(tglDariStr);
    const dSampai = parseIndo(tglSampaiStr);
    const uid = userAuth.uid;

    let rekap = {
        fs1: { reflexy: 0, massage: 0 },
        fs2: { reflexy: 0, massage: 0 }
    };

    try {
        let listPromises = [];
        let tglLoop = new Date(dDari);
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

        while (tglLoop <= dSampai) {
            const tglFullStr = tglLoop.toLocaleDateString('id-ID', opsi);
            const temp = tglFullStr.split(', ');
            const tglMurni = temp[1];
            const p = tglMurni.split(" ");
            
            const blnTahunId = p[1] + "_" + p[2];
            const dateId = tglFullStr.replace(', ', '_').replace(/\s/g, '_'); 

            const prom = window.firestore
                .collection('data').doc(uid)
                .collection('kerja').doc(blnTahunId)
                .collection(dateId).get();
            
            listPromises.push(prom);
            tglLoop.setDate(tglLoop.getDate() + 1);
        }

        const allSnapshots = await Promise.all(listPromises);

        allSnapshots.forEach(snap => {
            if (!snap.empty) {
                snap.forEach(doc => {
                    const item = doc.data();
                    const namaKantor = item.kantor ? item.kantor.trim() : "";
                    const target = (namaKantor === 'FIVE STAR 1') ? rekap.fs1 : rekap.fs2;

                    if (item.detail_jam) {
                        target.reflexy += parseFloat(item.detail_jam.reflexy || 0);
                        target.massage += parseFloat(item.detail_jam.massage || 0);
                    }
                });
            }
        });

        const fs1Total = rekap.fs1.reflexy + rekap.fs1.massage;
        const fs2Total = rekap.fs2.reflexy + rekap.fs2.massage;
        const grandReflexy = rekap.fs1.reflexy + rekap.fs2.reflexy;
        const grandMassage = rekap.fs1.massage + rekap.fs2.massage;
        const grandTotal = fs1Total + fs2Total;

        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.innerText = val.toFixed(1).replace('.0', '') + " Jam";
        };
        
        setTxt('rPusatReflexy', rekap.fs1.reflexy);
        setTxt('rPusatMassage', rekap.fs1.massage);
        setTxt('rPusatTotal', fs1Total);
        
        setTxt('rCabangReflexy', rekap.fs2.reflexy);
        setTxt('rCabangMassage', rekap.fs2.massage);
        setTxt('rCabangTotal', fs2Total);
        
        setTxt('rTotalReflexy', grandReflexy);
        setTxt('rTotalMassage', grandMassage);
        
        const elGrand = document.getElementById('rGrandTotal');
        if(elGrand) elGrand.innerText = grandTotal.toFixed(1).replace('.0', '') + " Jam";

        const resArea = document.getElementById('areaHasilRincian');
        if(resArea) {
            resArea.classList.remove('show');
            setTimeout(() => { resArea.classList.add('show'); }, 50);
        }

    } catch (e) {
        console.error(e);
        if(typeof IOSAlert !== 'undefined') IOSAlert.show("Gagal", "Kesalahan memuat rincian: " + e.message);
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Tampilkan Rekap';
        btn.disabled = false;
    }
}

function tutupMenuRincian() {
    if (history.state && history.state.id === 'modalRincian') {
        history.back(); 
    } else {
        const modal = document.getElementById('rincianModal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = '';
        window.removeEventListener('popstate', window.handleBackRincian);
    }
}
