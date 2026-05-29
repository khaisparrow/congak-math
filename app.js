// Konfigurasi Asas Phaser
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Game akan auto-fit pada skrin tablet/telefon
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 1200
    },
    backgroundColor: '#e0f2fe', // Biru awan
    parent: 'game-container',
    scene: {
        create: create,
        update: update
    }
};

// Mulakan Enjin Game
const game = new Phaser.Game(config);

// Variabel Global
let soalanText;
let pilihanButang = [];
let pemain;
let jawapanBetul;
let level = 1;
let skor = 0;
let skorText;
let awanBawah;

function create() {
    // 1. LUKIS LATAR BELAKANG & TREK LUMBA
    // Kita buat padang rumput hijau di bahagian bawah skrin
    this.add.rectangle(400, 1050, 800, 300, 0x4ade80); 
    // Garisan balapan (putih)
    this.add.rectangle(400, 950, 800, 10, 0xffffff);

    // 2. MASUKKAN KARAKTER (Guna Emoji Pelari)
    pemain = this.add.text(50, 820, '🏃', { fontSize: '120px' });

    // 3. PAPARAN SKOR & LEVEL
    skorText = this.add.text(40, 40, 'Skor: 0 | Level: 1', { 
        fontSize: '48px', 
        fill: '#1e3a8a', 
        fontStyle: 'bold' 
    });

    // 4. PAPARAN SOALAN
    soalanText = this.add.text(400, 300, 'Soalan', { 
        fontSize: '100px', 
        fill: '#1e3a8a', 
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5); // .setOrigin(0.5) memastikan teks berada betul-betul di tengah koordinat

    // 5. BINA BUTANG PILIHAN (3 Butang)
    for(let i=0; i<3; i++) {
        // Latar butang biru
        let butangBg = this.add.rectangle(200 + (i * 200), 550, 160, 120, 0x3b82f6, 1)
            .setInteractive()
            .setOrigin(0.5);
        
        // Teks jawapan di atas butang
        let teksButang = this.add.text(200 + (i * 200), 550, '0', {
            fontSize: '64px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Kesan visual bila butang ditekan (hover/klik)
        butangBg.on('pointerdown', () => {
            butangBg.setFillStyle(0x1d4ed8); // Warna jadi biru gelap sekejap
            setTimeout(() => butangBg.setFillStyle(0x3b82f6), 150);
            semakJawapan(this, teksButang.text);
        });

        pilihanButang.push(teksButang); // Simpan rujukan teks untuk ditukar nanti
    }

    // Mula jana soalan pertama
    janaSoalan();
}

function update() {
    // Fungsi ini dipanggil 60 kali sesaat (60fps). 
    // Sesuai untuk semak pelanggaran graviti, tapi kita belum guna untuk game logik ini.
}

// FUNGSI LOGIK: Jana Soalan Asas Tambah & Tolak
function janaSoalan() {
    let num1, num2, operator;
    
    if(level === 1) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = '+';
    } else {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
    }

    jawapanBetul = operator === '+' ? num1 + num2 : num1 - num2;
    soalanText.setText(`${num1} ${operator} ${num2} = ?`);

    // Hasilkan 2 jawapan pengacau (salah) yang logik
    let pilihan = [jawapanBetul];
    while(pilihan.length < 3) {
        let salah = jawapanBetul + (Math.floor(Math.random() * 10) - 5);
        if(salah !== jawapanBetul && salah > 0 && !pilihan.includes(salah)) {
            pilihan.push(salah);
        }
    }

    // Gaulkan kedudukan jawapan supaya tidak sentiasa di A
    pilihan.sort(() => Math.random() - 0.5);

    // Kemaskini teks pada 3 butang
    for(let i=0; i<3; i++) {
        pilihanButang[i].setText(pilihan[i]);
    }
}

// FUNGSI LOGIK: Semak Jawapan & Animasi
function semakJawapan(scene, tekaan) {
    if(parseInt(tekaan) === jawapanBetul) {
        
        // JAWAPAN BETUL
        skor += 10;
        if(skor % 50 === 0) level++; // Naik level setiap 5 soalan betul
        skorText.setText(`Skor: ${skor} | Level: ${level}`);

        // Animasi Teks Terapung (Berjaya)
        let hebat = scene.add.text(400, 450, 'HEBAT! 🎉', { fontSize: '80px', fill: '#22c55e', fontStyle: 'bold' }).setOrigin(0.5);
        scene.tweens.add({
            targets: hebat,
            y: 200,          // Naik ke atas
            alpha: 0,        // Perlahan-lahan hilang
            duration: 1000,
            onComplete: () => hebat.destroy()
        });

        // Animasi Pemain Berlari Ke Depan
        scene.tweens.add({
            targets: pemain,
            x: pemain.x + 40,
            duration: 300,
            ease: 'Power2'
        });

        // Apabila pemain dah hampir ke hujung skrin, hantar dia kembali ke belakang
        if(pemain.x > 650) {
            pemain.x = 50;
        }

        setTimeout(janaSoalan, 500); // Soalan baru muncul selepas separuh saat

    } else {
        
        // JAWAPAN SALAH
        // Enjin Phaser menggegarkan kamera skrin! Kesan yang sangat disukai kanak-kanak
        scene.cameras.main.shake(300, 0.02);

        // Animasi Teks Terapung (Salah)
        let salah = scene.add.text(400, 450, 'CUBA LAGI!', { fontSize: '80px', fill: '#ef4444', fontStyle: 'bold' }).setOrigin(0.5);
        scene.tweens.add({
            targets: salah,
            y: 400,
            alpha: 0,
            duration: 1000,
            onComplete: () => salah.destroy()
        });
    }
}