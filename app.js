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
let pilihanButang = []; // Store button objects, not just text
let pemain;
let jawapanBetul;
let level = 1, skor = 0, highScore = 0;
let masa = 10; 
let masaText, masaBar, masaEvent;
let isGameOver = false;

function preload() {
    // 1. MUAT HELAIAN SPRITE WATAK
    // Gunakan filename imej helaian sprite Cikgu di sini. 
    // Saya menganggarkan saiz bingkai sebagai 100x130 pixels.
    this.load.spritesheet('pemainSheet', './pemainSheet.png', { frameWidth: 100, frameHeight: 130 });
}

function create() {
    isGameOver = false;
    
    // 2. BINA ANIMASI WATAK
    // Kita buat animasi 'larian'. Bingkai-bingkai untuk RUN bermula dari index 10 hingga 14.
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('pemainSheet', { start: 10, end: 14 }),
        frameRate: 10,
        repeat: -1
    });

    // Sistem pelindung memori (Incognito safe)
    try {
        let simpananSkor = localStorage.getItem('congakHighScore');
        if (simpananSkor) {
            highScore = parseInt(simpananSkor);
        }
    } catch (error) {
        console.log("Incognito Mode: Memori skor ditutup.");
        highScore = 0; 
    }

    // Latar & Trek
    this.add.rectangle(400, 1050, 800, 300, 0x4ade80); 
    this.add.rectangle(400, 950, 800, 10, 0xffffff);

    // 3. WATAK PEMAIN SPRITE (Beranimasi)
    // Mulakan pemain di x=100. Y=850 (lebih tinggi sedikit untuk sprite). Scaled up by 2.
    // .play('run') akan memulakan animasi larian serta-merta.
    pemain = this.add.sprite(100, 850, 'pemainSheet').setScale(2).play('run');

    // Papan Skor & Level
    skorText = this.add.text(30, 30, `Skor: ${skor} | Level: ${level}`, { fontSize: '40px', fill: '#1e3a8a', fontStyle: 'bold' });
    highScoreText = this.add.text(30, 80, `Rekod Tertinggi: ${highScore}`, { fontSize: '30px', fill: '#ef4444', fontStyle: 'bold' });

    // Pemasa
    this.add.rectangle(400, 150, 600, 30, 0x94a3b8).setOrigin(0.5); 
    masaBar = this.add.rectangle(100, 150, 600, 30, 0xef4444).setOrigin(0, 0.5); 
    masaText = this.add.text(400, 150, '10s', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    // Soalan
    soalanText = this.add.text(400, 350, 'Soalan', { fontSize: '120px', fill: '#1e3a8a', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

    // 4. BUTANG PILIHAN DENGAN JAWAPAN NILAI INTEGER
    // Kita bina butang penuh sebagai objek pilihan
    for(let i=0; i<3; i++) {
        // Latar butang
        let butang = this.add.rectangle(200 + (i * 200), 650, 160, 140, 0x3b82f6, 1).setInteractive().setOrigin(0.5);
        butang.on('pointerdown', () => selectAnswer(this, butang)); // attach click handler to the button

        // Teks di atas butang
        butang.teks = this.add.text(0, 0, '0', { fontSize: '70px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        butang.add(butang.teks); // make text a child of the rectangle

        butang.jawapanValue = 0; // custom property to store the integer answer
        pilihanButang.push(butang); // store button references
    }

    //jana soalan, pemasa akan dimulakan dalam janaSoalan
    janaSoalan(this);
}

function update() {}

// FUNGSI LOGIK: Mula Timer (Bebas dari pepijat hanged)
function mulaTimer(scene) {
    // 1. Bersihkan pemasa sedia ada untuk keselamatan penuh
    if (masaEvent) {
        masaEvent.remove(false); // remove completely, don't call the callback
    }

    // 2. Set semula UI pemasa
    masa = 10;
    masaBar.width = 600;
    masaText.setText('10s');

    // 3. Cipta pemasa baharu
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
                // Tamat masa
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

    // 5. Kemaskini teks pada 3 butang DAN simpan nilai
    for(let i=0; i<3; i++) {
        pilihanButang[i].teks.setText(pilihan[i]);
        pilihanButang[i].jawapanValue = pilihan[i]; // Store as an integer
    }

    // Mulakan semula pemasa dari dalam janaSoalan
    mulaTimer(scene);
}

// FUNGSI LOGIK: Semak Jawapan & Animasi (Bebas dari pepijat Game Over pada jawapan betul)
function selectAnswer(scene, butangObj) {
    if(isGameOver) return;
    
    // Kesan butang sekejap
    butangObj.setFillStyle(0x1d4ed8);
    setTimeout(() => butangObj.setFillStyle(0x3b82f6), 150);

    // Semak nilai yang disimpan
    if (butangObj.jawapanValue === jawapanBetul) {
        // BETUL
        console.log('BETUL!');
        scoreAnswer(scene, true);
    } else {
        // SALAH
        console.log('SALAH!');
        scoreAnswer(scene, false);
    }
}

function scoreAnswer(scene, isCorrect) {
    if (isGameOver) return;

    if (isCorrect) {
        skor += 10;
        
        if(skor % 50 === 0) {
            level++;
            let naikLevel = scene.add.text(400, 500, 'LEVEL UP!', { fontSize: '70px', fill: '#eab308', fontStyle: 'bold' }).setOrigin(0.5);
            scene.tweens.add({ targets: naikLevel, y: 300, alpha: 0, duration: 1500, onComplete: () => naikLevel.destroy() });
        }

        skorText.setText(`Skor: ${skor} | Level: ${level}`);

        // Animasi pemain maju
        scene.tweens.add({
            targets: pemain,
            x: pemain.x + 60,
            duration: 300,
            ease: 'Power2'
        });

        // Set semula pemain ke belakang jika terlalu jauh
        if(pemain.x > 700) pemain.x = 50;

        // Jana soalan baharu (pemasa akan dimulakan semula dalam janaSoalan)
        janaSoalan(scene);

    } else {
        // JAWAPAN SALAH - tamat permainan
        tamatPermainan(scene);
    }
}

function tamatPermainan(scene) {
    isGameOver = true;
    scene.cameras.main.shake(400, 0.03);

    // 6. BERSERSIHKAN PEMASA
    if (masaEvent) {
        masaEvent.remove(false); // remove completely
    }

    try {
        if (skor > highScore) {
            highScore = skor;
            localStorage.setItem('congakHighScore', highScore);
        }
    } catch (error) {
        console.log("Memori skor ditutup.");
    }

    // Bina Sijil Digital (1 Halaman Skrin Penuh)
    let sijilBg = scene.add.rectangle(400, 600, 700, 900, 0xffffff).setOrigin(0.5);
    sijilBg.setStrokeStyle(10, 0x1e3a8a); 

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
        // BERSERSINKAN SEMUA PEMASA SEBELUM RESTART
        if (masaEvent) {
            masaEvent.remove(false); // remove completely
        }
        scene.scene.restart();
    });
}