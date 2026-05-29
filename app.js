// ==============================================
// 1. BABAK MUKA HADAPAN (MENU LOBBY)
// ==============================================
const MenuScene = {
    key: 'Menu',
    create: function() {
        this.cameras.main.setBackgroundColor('#e0f2fe'); // Latar biru awan
        
        // Ikon Roket dengan animasi terapung
        let ikon = this.add.text(400, 350, '🚀', { fontSize: '150px' }).setOrigin(0.5);
        this.tweens.add({
            targets: ikon,
            y: 320,          // Naik sikit
            yoyo: true,      // Turun balik
            repeat: -1,      // Ulang sampai bila-bila
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
        
        // Teks Tajuk
        this.add.text(400, 550, 'CONGAK PINTAR', { fontSize: '80px', fill: '#1e3a8a', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(400, 650, 'Cabaran Matematik Pantas', { fontSize: '35px', fill: '#475569' }).setOrigin(0.5);
        
        // Butang Mula
        let mulaBg = this.add.rectangle(400, 850, 400, 120, 0x3b82f6, 1).setInteractive().setOrigin(0.5);
        this.add.text(400, 850, 'MULA MAIN', { fontSize: '50px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        
        // Fungsi klik butang mula
        mulaBg.on('pointerdown', () => {
            mulaBg.setFillStyle(0x1d4ed8);
            setTimeout(() => {
                this.scene.start('Game'); // Lompat ke Babak Permainan
            }, 150);
        });
    }
};

// ==============================================
// 2. BABAK PERMAINAN UTAMA (GAME)
// ==============================================
const GameScene = {
    key: 'Game',
    create: function() {
        // Reset semula semua nilai setiap kali main
        isGameOver = false;
        level = 1;
        skor = 0;
        pilihanButang = []; 
        
        try {
            let simpananSkor = localStorage.getItem('congakHighScore');
            if (simpananSkor) highScore = parseInt(simpananSkor);
        } catch (error) {
            highScore = 0; 
        }

        // Latar & Trek (Padang)
        this.add.rectangle(400, 1050, 800, 300, 0x4ade80); 
        this.add.rectangle(400, 950, 800, 10, 0xffffff);

        // WATAK PEMAIN - Guna Emoji Roket (Bebas dari masalah saiz & pelayan)
        pemain = this.add.text(50, 850, '🚀', { fontSize: '100px' });

        // Teks Skor & Pemasa
        skorText = this.add.text(30, 30, `Skor: ${skor} | Level: ${level}`, { fontSize: '40px', fill: '#1e3a8a', fontStyle: 'bold' });
        highScoreText = this.add.text(30, 80, `Rekod Tertinggi: ${highScore}`, { fontSize: '30px', fill: '#ef4444', fontStyle: 'bold' });

        this.add.rectangle(400, 150, 600, 30, 0x94a3b8).setOrigin(0.5); 
        masaBar = this.add.rectangle(100, 150, 600, 30, 0xef4444).setOrigin(0, 0.5); 
        masaText = this.add.text(400, 150, '10s', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        soalanText = this.add.text(400, 350, 'Soalan', { fontSize: '120px', fill: '#1e3a8a', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

        // Bina Butang Pilihan
        for(let i=0; i<3; i++) {
            let posX = 200 + (i * 200); 
            let posY = 650;             
            
            let butangBg = this.add.rectangle(posX, posY, 160, 140, 0x3b82f6, 1).setInteractive().setOrigin(0.5);
            let teksButang = this.add.text(posX, posY, '0', { fontSize: '70px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            butangBg.on('pointerdown', () => selectAnswer(this, butangBg)); 
            butangBg.teks = teksButang; 
            butangBg.jawapanValue = 0; 
            pilihanButang.push(butangBg); 
        }

        janaSoalan(this);
    }
};

// ==============================================
// 3. KONFIGURASI PHASER & LOGIK GLOBAL
// ==============================================
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 1200
    },
    parent: 'game-container',
    // Daftarkan babak di sini. Yang ditulis pertama (MenuScene) akan keluar dahulu!
    scene: [MenuScene, GameScene] 
};

const game = new Phaser.Game(config);

// Variabel Global
let soalanText, skorText, highScoreText;
let pilihanButang = []; 
let pemain;
let jawapanBetul;
let level = 1, skor = 0, highScore = 0;
let masa = 10, masaText, masaBar, masaEvent;
let isGameOver = false;

// -- Fungsi Pemasa --
function mulaTimer(scene) {
    if (masaEvent) masaEvent.remove(false); 
    masa = 10;
    masaBar.width = 600;
    masaText.setText('10s');

    masaEvent = scene.time.addEvent({
        delay: 1000,
        callback: () => {
            if(isGameOver) return;
            masa--;
            masaText.setText(masa + 's');
            scene.tweens.add({ targets: masaBar, width: (masa / 10) * 600, duration: 200 });
            if (masa <= 0) tamatPermainan(scene);
        },
        callbackScope: scene,
        loop: true
    });
}

// -- Fungsi Jana Soalan --
function janaSoalan(scene) {
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

    let pilihan = [jawapanBetul];
    while(pilihan.length < 3) {
        let salah = jawapanBetul + (Math.floor(Math.random() * 10) - 5);
        if(salah !== jawapanBetul && salah >= 0 && !pilihan.includes(salah)) pilihan.push(salah);
    }

    pilihan.sort(() => Math.random() - 0.5);

    for(let i=0; i<3; i++) {
        pilihanButang[i].teks.setText(pilihan[i]);
        pilihanButang[i].jawapanValue = pilihan[i]; 
    }

    mulaTimer(scene);
}

// -- Fungsi Semak Jawapan --
function selectAnswer(scene, butangObj) {
    if(isGameOver) return;
    butangObj.setFillStyle(0x1d4ed8);
    setTimeout(() => butangObj.setFillStyle(0x3b82f6), 150);

    if (butangObj.jawapanValue === jawapanBetul) {
        skor += 10;
        
        if(skor % 50 === 0) {
            level++;
            let naikLevel = scene.add.text(400, 500, 'LEVEL UP!', { fontSize: '70px', fill: '#eab308', fontStyle: 'bold' }).setOrigin(0.5);
            scene.tweens.add({ targets: naikLevel, y: 300, alpha: 0, duration: 1500, onComplete: () => naikLevel.destroy() });
        }

        skorText.setText(`Skor: ${skor} | Level: ${level}`);

        // Gerakkan roket!
        scene.tweens.add({ targets: pemain, x: pemain.x + 60, duration: 300, ease: 'Power2' });
        if(pemain.x > 700) pemain.x = 50; // Pusing semula ke garisan mula

        janaSoalan(scene);
    } else {
        tamatPermainan(scene);
    }
}

// -- Fungsi Tamat Permainan --
function tamatPermainan(scene) {
    isGameOver = true;
    scene.cameras.main.shake(400, 0.03);

    if (masaEvent) masaEvent.remove(false); 

    try {
        if (skor > highScore) {
            highScore = skor;
            localStorage.setItem('congakHighScore', highScore);
        }
    } catch (error) {}

    // Sijil Tamat
    let sijilBg = scene.add.rectangle(400, 600, 700, 950, 0xffffff).setOrigin(0.5);
    sijilBg.setStrokeStyle(10, 0x1e3a8a); 

    scene.add.text(400, 220, 'SIJIL PENCAPAIAN', { fontSize: '60px', fill: '#1e3a8a', fontStyle: 'bold' }).setOrigin(0.5);
    scene.add.text(400, 320, 'Dianugerahkan kepada peserta atas pencapaian:', { fontSize: '24px', fill: '#475569' }).setOrigin(0.5);
    scene.add.text(400, 450, `SKOR: ${skor}`, { fontSize: '80px', fill: '#ef4444', fontStyle: 'bold' }).setOrigin(0.5);
    scene.add.text(400, 550, `LEVEL: ${level}`, { fontSize: '50px', fill: '#3b82f6', fontStyle: 'bold' }).setOrigin(0.5);
    
    scene.add.text(400, 730, 'Tahniah dari Cikgu Khairee', { fontSize: '30px', fill: '#1e3a8a', fontStyle: 'italic' }).setOrigin(0.5);
    scene.add.text(400, 780, 'SMK Taman Desa 2', { fontSize: '24px', fill: '#1e3a8a', fontStyle: 'bold' }).setOrigin(0.5);

    // Dua pilihan butang: Main Semula ATAU Kembali ke Menu
    let btnMula = scene.add.rectangle(400, 900, 400, 80, 0x22c55e).setInteractive().setOrigin(0.5);
    scene.add.text(400, 900, 'MAIN SEMULA', { fontSize: '35px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    let btnMenu = scene.add.rectangle(400, 1000, 400, 80, 0xf59e0b).setInteractive().setOrigin(0.5);
    scene.add.text(400, 1000, 'KEMBALI KE MENU', { fontSize: '35px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    btnMula.on('pointerdown', () => {
        if (masaEvent) masaEvent.remove(false); 
        scene.scene.restart(); // Main semula terus
    });

    btnMenu.on('pointerdown', () => {
        if (masaEvent) masaEvent.remove(false); 
        scene.scene.start('Menu'); // Kembali ke muka hadapan
    });
}