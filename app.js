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
let masa = 10; 
let masaText, masaBar, masaEvent;
let isGameOver = false;

function preload() {
    // Anggaran saiz potongan bingkai (frame). 
    // Jika watak nampak terpotong separuh, kita akan ejas nombor ini nanti.
    this.load.spritesheet('pemainSheet', './pemainSheet.png', { frameWidth: 145, frameHeight: 200 });
}

function create() {
    isGameOver = false;
    
    // Animasi Larian (Index 10 hingga 14 dari imej cikgu)
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('pemainSheet', { start: 10, end: 14 }),
        frameRate: 10,
        repeat: -1
    });

    try {
        let simpananSkor = localStorage.getItem('congakHighScore');
        if (simpananSkor) {
            highScore = parseInt(simpananSkor);
        }
    } catch (error) {
        highScore = 0; 
    }

    // Latar & Trek
    this.add.rectangle(400, 1050, 800, 300, 0x4ade80); 
    this.add.rectangle(400, 950, 800, 10, 0xffffff);

    // WATAK PEMAIN - Skala diturunkan dari 2 ke 0.7 supaya tidak gergasi
    pemain = this.add.sprite(100, 850, 'pemainSheet').setScale(0.7).play('run');

    skorText = this.add.text(30, 30, `Skor: ${skor} | Level: ${level}`, { fontSize: '40px', fill: '#1e3a8a', fontStyle: 'bold' });
    highScoreText = this.add.text(30, 80, `Rekod Tertinggi: ${highScore}`, { fontSize: '30px', fill: '#ef4444', fontStyle: 'bold' });

    this.add.rectangle(400, 150, 600, 30, 0x94a3b8).setOrigin(0.5); 
    masaBar = this.add.rectangle(100, 150, 600, 30, 0xef4444).setOrigin(0, 0.5); 
    masaText = this.add.text(400, 150, '10s', { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    soalanText = this.add.text(400, 350, 'Soalan', { fontSize: '120px', fill: '#1e3a8a', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);

    // BINA BUTANG & TEKS (Diasingkan dengan betul)
    for(let i=0; i<3; i++) {
        let posX = 200 + (i * 200); // Koordinat X: 200, 400, 600
        let posY = 650;             // Koordinat Y tetap
        
        let butangBg = this.add.rectangle(posX, posY, 160, 140, 0x3b82f6, 1).setInteractive().setOrigin(0.5);
        let teksButang = this.add.text(posX, posY, '0', { fontSize: '70px', fill: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        butangBg.on('pointerdown', () => selectAnswer(this, butangBg)); 

        butangBg.teks = teksButang; // Pautkan teks kepada kotak
        butangBg.jawapanValue = 0; 
        pilihanButang.push(butangBg); 
    }

    janaSoalan(this);
}

function update() {}

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

function selectAnswer(scene, butangObj) {
    if(isGameOver) return;
    
    butangObj.setFillStyle(0x1d4ed8);
    setTimeout(() => butangObj.setFillStyle(0x3b82f6), 150);

    if (butangObj.jawapanValue === jawapanBetul) {
        scoreAnswer(scene, true);
    } else {
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

        scene.tweens.add({ targets: pemain, x: pemain.x + 60, duration: 300, ease: 'Power2' });
        if(pemain.x > 700) pemain.x = 50;

        janaSoalan(scene);

    } else {
        tamatPermainan(scene);
    }
}

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
        if (masaEvent) masaEvent.remove(false); 
        scene.scene.restart();
    });
}