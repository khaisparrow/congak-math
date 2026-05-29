const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 1200
    },
    backgroundColor: '#e0f2fe',
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Variabel Global
let soalanText, skorText, highScoreText;
let pilihanButang = [];
let pemain;
let jawapanBetul;
let level = 1, skor = 0, highScore = 0;
let masa = 10; // 10 saat untuk setiap soalan
let masaText, masaBar, masaEvent;
let bunyiBetul, bunyiSalah, bunyiSorak;
let isGameOver = false;

function preload() {
    // Muat turun fail Audio & Sprite dari pelayan ujian Phaser
    this.load.audio('ting', 'https://labs.phaser.io/assets/audio/SoundEffects/p-ping.mp3');
    this.load.audio('buzz', 'https://labs.phaser.io/assets/audio/SoundEffects/magical_horror_audiosprite.mp3'); // Kesan salah
    this.load.audio('cheer', 'https://labs.phaser.io/assets/audio/SoundEffects/key.mp3'); // Ganti dengan bunyi naik level
    this.load.image('spriteMurid', 'https://labs.phaser.io/assets/sprites/dude.png');
}

function create() {
    isGameOver = false;
    
    // Dapatkan High Score dari memori tablet/telefon
    let simpananSkor = localStorage.getItem('congakHighScore');
    if (simpananSkor) {
        highScore = parseInt(simpananSkor);
    }

    // Audio
    bunyiBetul = this.sound.add('ting');
    bunyiSalah = this.sound.add('buzz');
    bunyiSorak = this.sound.add('cheer');

    // Latar & Trek
    this.add.rectangle(400, 1050, 800, 300, 0x4ade80); 
    this.add.rectangle(400, 950, 800, 10, 0xffffff);

    // Karakter Pemain
    pemain = this.add.image(100, 900, 'spriteMurid').setScale(2);

    // Papan Skor & Level
    skorText = this.add.text(30, 30, `Skor: ${skor} | Level: ${level}`, { fontSize: '40px', fill: '#1e3a8a', fontStyle: 'bold' });
    highScoreText = this.add.text(30, 80, `Rekod Tertinggi: ${highScore}`, { fontSize: '30px', fill: '#ef4444', fontStyle: 'bold' });

    // Pemasa (Timer Bar & Text)
    this.add.rectangle(400, 150, 600, 30, 0x94a3b8).setOrigin(0.5); // Tapak kelabu
    masaBar = this.add.rectangle(100, 150, 600, 30, 0xef4444).setOrigin(0, 0.5); // Bar merah
    masaText = this.add.text(400, 150, '10s', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    // Soalan
    soalanText = this.add.text(400, 350, 'Soalan', { fontSize: '120px', fill: '#1e3a8a', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

    // Butang Pilihan
    for(let i=0; i<3; i++) {
        let butangBg = this.add.rectangle(200 + (i * 200), 650, 160, 140, 0x3b82f6, 1).setInteractive().setOrigin(0.5);
        let teksButang = this.add.text(200 + (i * 200), 650, '0', { fontSize: '70px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        butangBg.on('pointerdown', () => {
            if(!isGameOver) {
                butangBg.setFillStyle(0x1d4ed8);
                setTimeout(() => butangBg.setFillStyle(0x3b82f6), 150);
                semakJawapan(this, teksButang.text);
            }
        });
        pilihanButang.push(teksButang);
    }

    janaSoalan(this);
}

function update() {
    // Logik kemaskini jika perlu
}

function mulaTimer(scene) {
    if (masaEvent) masaEvent.remove();
    masa = 10;
    masaBar.width = 600;
    masaText.setText('10s');

    masaEvent = scene.time.addEvent({
        delay: 1000,
        callback: () => {
            if(isGameOver) return;
            masa--;
            masaText.setText(masa + 's');
            
            // Animasi bar masa berkurang
            scene.tweens.add({
                targets: masaBar,
                width: (masa / 10) * 600,
                duration: 200
            });

            if (masa <= 0) {
                tamatPermainan(scene);
            }
        },
        callbackScope: scene,
        loop: true
    });
}

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
        pilihanButang[i].setText(pilihan[i]);
    }

    mulaTimer(scene);
}

function semakJawapan(scene, tekaan) {
    if(parseInt(tekaan) === jawapanBetul) {
        // BETUL
        bunyiBetul.play();
        skor += 10;
        
        // Naik level
        if(skor % 50 === 0) {
            level++;
            bunyiSorak.play();
            let naikLevel = scene.add.text(400, 500, 'LEVEL UP!', { fontSize: '70px', fill: '#eab308', fontStyle: 'bold' }).setOrigin(0.5);
            scene.tweens.add({ targets: naikLevel, y: 300, alpha: 0, duration: 1500, onComplete: () => naikLevel.destroy() });
        }

        skorText.setText(`Skor: ${skor} | Level: ${level}`);

        scene.tweens.add({
            targets: pemain,
            x: pemain.x + 60,
            duration: 300,
            ease: 'Power2'
        });

        if(pemain.x > 700) pemain.x = 100;

        janaSoalan(scene);

    } else {
        // SALAH
        tamatPermainan(scene);
    }
}

function tamatPermainan(scene) {
    isGameOver = true;
    bunyiSalah.play();
    scene.cameras.main.shake(400, 0.03);
    if(masaEvent) masaEvent.remove();

    // Simpan High Score
    if (skor > highScore) {
        highScore = skor;
        localStorage.setItem('congakHighScore', highScore);
    }

    // Bina Sijil Digital (1 Halaman Skrin Penuh)
    let sijilBg = scene.add.rectangle(400, 600, 700, 900, 0xffffff).setOrigin(0.5);
    sijilBg.setStrokeStyle(10, 0x1e3a8a); // Bingkai sijil

    scene.add.text(400, 250, 'SIJIL PENCAPAIAN', { fontSize: '60px', fill: '#1e3a8a', fontStyle: 'bold' }).setOrigin(0.5);
    scene.add.text(400, 350, 'Dianugerahkan kepada peserta atas pencapaian:', { fontSize: '24px', fill: '#475569' }).setOrigin(0.5);
    
    scene.add.text(400, 480, `SKOR: ${skor}`, { fontSize: '80px', fill: '#ef4444', fontStyle: 'bold' }).setOrigin(0.5);
    scene.add.text(400, 580, `LEVEL: ${level}`, { fontSize: '50px', fill: '#3b82f6', fontStyle: 'bold' }).setOrigin(0.5);

    scene.add.text(400, 800, 'Tahniah dari Cikgu Khairee', { fontSize: '30px', fill: '#1e3a8a', fontStyle: 'italic' }).setOrigin(0.5);
    scene.add.text(400, 850, 'SMK Taman Desa 2', { fontSize: '24px', fill: '#1e3a8a', fontStyle: 'bold' }).setOrigin(0.5);

    let butangMula = scene.add.rectangle(400, 980, 400, 80, 0x22c55e).setInteractive().setOrigin(0.5);
    scene.add.text(400, 980, 'MAIN SEMULA', { fontSize: '35px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    butangMula.on('pointerdown', () => {
        skor = 0;
        level = 1;
        scene.scene.restart();
    });
}