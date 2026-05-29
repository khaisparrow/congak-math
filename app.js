// Variabel Permainan
let currentLevel = 1;
let lives = 3;
let correctAnswer = 0;
let step = 0; // Langkah avatar (0 hingga 5)

// Elemen DOM (UI)
const body = document.getElementById('game-body');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const gameContainer = document.getElementById('game-container');

const questionDisplay = document.getElementById('question-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const levelDisplay = document.getElementById('level-display');
const livesDisplay = document.getElementById('lives-display');
const finalLevelDisplay = document.getElementById('final-level');

const progressBar = document.getElementById('progress-bar');
const runnerAvatar = document.getElementById('runner-avatar');

// Fungsi Mula Main
function startGame() {
    currentLevel = 1;
    lives = 3;
    step = 0;
    
    updateUI();
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    generateQuestion();
}

// Fungsi Kembali ke Lobi
function resetToLobby() {
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Fungsi Jana Soalan
function generateQuestion() {
    let num1, num2, operator;
    
    if (currentLevel === 1) {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * (10 - num1)); 
        operator = '+';
    } else if (currentLevel === 2) {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
    } else {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 30) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
    }

    correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    questionDisplay.innerText = `${num1} ${operator} ${num2}`;
    answerInput.value = '';
    answerInput.focus();
}

// Fungsi Kemaskini Paparan (Level, Nyawa, Avatar)
function updateUI() {
    levelDisplay.innerText = currentLevel;
    
    // Papar jumlah Hati
    let hearts = '';
    for(let i = 0; i < lives; i++) hearts += '❤️';
    for(let i = lives; i < 3; i++) hearts += '🖤'; // Hati kosong jika hilang nyawa
    livesDisplay.innerText = hearts;

    // Gerakkan avatar (Setiap level perlukan 5 langkah)
    let percentage = (step / 5) * 100;
    progressBar.style.width = `${percentage}%`;
    
    // Elak avatar terkeluar dari landasan
    let avatarPosition = percentage;
    if(avatarPosition >= 90) avatarPosition = 90; 
    runnerAvatar.style.left = `${avatarPosition}%`;
}

// Fungsi Semak Jawapan
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) return;

    if (userAnswer === correctAnswer) {
        // JAWAPAN BETUL
        step++;
        flashBackground('bg-green-100'); // Skrin hijau sekejap
        
        if (step >= 5) {
            // Naik Level!
            currentLevel++;
            step = 0;
            // Boleh tambah bunyi di sini pada masa akan datang
        }
    } else {
        // JAWAPAN SALAH
        lives--;
        flashBackground('bg-red-100'); // Skrin merah sekejap
        
        // Animasi gegar
        gameContainer.classList.add('shake-animation');
        setTimeout(() => gameContainer.classList.remove('shake-animation'), 300);

        if (lives <= 0) {
            gameOver();
            return;
        }
    }

    updateUI();
    generateQuestion();
}

// Fungsi Latar Belakang Berkelip
function flashBackground(colorClass) {
    body.classList.remove('bg-blue-50');
    body.classList.add(colorClass);
    setTimeout(() => {
        body.classList.remove(colorClass);
        body.classList.add('bg-blue-50');
    }, 300);
}

// Fungsi Game Over
function gameOver() {
    finalLevelDisplay.innerText = currentLevel;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// Event Listeners untuk Butang Semak
submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAnswer();
});