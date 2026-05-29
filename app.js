let currentLevel = 1;
let score = 0;
let correctAnswer = 0;
let streak = 0;

const questionDisplay = document.getElementById('question-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackMessage = document.getElementById('feedback-message');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');

function generateQuestion() {
    let num1, num2, operator;
    
    // Logik Level untuk murid Tahun 1 & 2
    if (currentLevel === 1) {
        // Level 1: Tambah lingkungan 10
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * (10 - num1)); 
        operator = '+';
    } else if (currentLevel === 2) {
        // Level 2: Tambah & Tolak lingkungan 20
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        
        // Elakkan jawapan negatif untuk tolak
        if (operator === '-' && num1 < num2) {
            let temp = num1;
            num1 = num2;
            num2 = temp;
        }
    } else {
        // Level 3+: Tambah & Tolak lingkungan 50
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 30) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) {
            [num1, num2] = [num2, num1];
        }
    }

    correctAnswer = operator === '+' ? num1 + num2 : num1 - num2;
    questionDisplay.innerText = `${num1} ${operator} ${num2}`;
    answerInput.value = '';
    answerInput.focus();
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) return;

    if (userAnswer === correctAnswer) {
        score += 10;
        streak++;
        feedbackMessage.innerText = 'Betul! Hebat! 🎉';
        feedbackMessage.className = 'mt-4 text-lg font-bold h-6 text-green-500';
        
        // Naik level setiap 5 jawapan berturut-turut yang betul
        if (streak % 5 === 0) {
            currentLevel++;
            feedbackMessage.innerText = `Tahniah! Naik Level ${currentLevel}! 🚀`;
        }
    } else {
        streak = 0;
        feedbackMessage.innerText = 'Salah, cuba lagi! 💪';
        feedbackMessage.className = 'mt-4 text-lg font-bold h-6 text-red-500';
    }

    levelDisplay.innerText = currentLevel;
    scoreDisplay.innerText = score;
    
    setTimeout(() => {
        feedbackMessage.innerText = '';
        generateQuestion();
    }, 1500);
}

submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAnswer();
});

// Mulakan game
generateQuestion();