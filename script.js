// ESL Word Scramble Game Logic
const words = [
    { word: "APPLE", hint: "A common fruit, often red or green." },
    { word: "HOUSE", hint: "A building where people live." },
    { word: "WATER", hint: "Essential liquid for life." },
    { word: "TABLE", hint: "A piece of furniture with a flat top." },
    { word: "COMPUTER", hint: "An electronic device for processing data." },
    { word: "BICYCLE", hint: "A two-wheeled vehicle powered by pedals." },
    { word: "COFFEE", hint: "A popular hot drink." },
    { word: "SCHOOL", hint: "A place for education." },
    { word: "OCEAN", hint: "A very large expanse of sea." },
    { word: "FRIEND", hint: "A person whom one knows and with whom one has a bond of mutual affection." }
];

let currentWord = {};
let score = 0;
let timeLeft = 60; // seconds
let timer = null;
let gameStarted = false;
// Lifelines: allocate totals (3 answer, 4 time, 3 break) => 10 total
let lifelines = {
    answer: 3,
    time: 4,
    brk: 3
};

// Whether current word is 'less scrambled' due to a break lifeline
let reducedScramble = false;
// Web Audio for lifeline sounds (no external files)
let audioCtx = null;
function ensureAudioContext() {
    if (!audioCtx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        audioCtx = new C();
    }
    return audioCtx;
}

function playTone(freq, duration = 0.12, type = 'sine') {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    o.stop(now + duration + 0.02);
}

function playLifelineSound(kind) {
    // kind: 'answer' | 'time' | 'break'
    try {
        if (kind === 'answer') {
            // short ascending arpeggio
            playTone(880, 0.10, 'sine');
            setTimeout(() => playTone(988, 0.10, 'sine'), 110);
            setTimeout(() => playTone(1320, 0.14, 'sine'), 220);
        } else if (kind === 'time') {
            // two soft pings
            playTone(440, 0.16, 'triangle');
            setTimeout(() => playTone(660, 0.12, 'triangle'), 180);
        } else if (kind === 'break') {
            // single gentle chime
            playTone(660, 0.18, 'sine');
            setTimeout(() => playTone(520, 0.10, 'sine'), 160);
        }
    } catch (e) {
        // Audio not available - ignore
        console.warn('Audio unavailable', e);
    }
}

const scrambledWordDisplay = document.getElementById('scrambled-word');
const userInput = document.getElementById('user-input');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const feedbackDisplay = document.getElementById('feedback');
const lifelineAnswerBtn = document.getElementById('lifeline-answer');
const lifelineTimeBtn = document.getElementById('lifeline-time');
const lifelineBreakBtn = document.getElementById('lifeline-break');
const countAnswerSpan = document.getElementById('count-answer');
const countTimeSpan = document.getElementById('count-time');
const countBreakSpan = document.getElementById('count-break');
const lifelinesTotalSpan = document.getElementById('lifelines-total');

// --- Helper Functions ---

function scrambleWord(word) {
    // Fisher-Yates shuffle
    let a = word.split("");
    // If reducedScramble is true, perform fewer swaps to make it easier
    const swaps = reducedScramble ? Math.max(1, Math.floor(a.length / 3)) : a.length;
    for (let i = a.length - 1; i > a.length - 1 - swaps; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]; // Swap letters
    }
    // If scrambled equals original (possible for short words), try again a few times
    if (a.join("") === word && word.length > 1) {
        return scrambleWord(word);
    }
    return a.join("");
}

function selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    // Reset reducedScramble for the new word unless a break lifeline was just used
    // reducedScramble persists only for current word; set to false after producing scrambled variant
    const scrambled = scrambleWord(currentWord.word);
    scrambledWordDisplay.textContent = scrambled;
    feedbackDisplay.textContent = `Hint: ${currentWord.hint}`; // Display hint
    feedbackDisplay.className = '';
    userInput.value = '';
    userInput.focus();
    nextBtn.disabled = true; // Disable next button until answered or checked
    // After scrambling for this word, reset reducedScramble so next new word is fully scrambled
    reducedScramble = false;
}

function updateScore(points) {
    score += points;
    // Prevent negative score display below zero
    if (score < 0) score = 0;
    scoreDisplay.textContent = score;
}

function startTimer() {
    clearInterval(timer); // Clear any existing timer
    timeLeft = 60; // Reset time for a new game
    timeDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameStarted = false;
    disableGameControls(true);
    startBtn.style.display = 'block'; // Show start button again
    startBtn.textContent = 'Play Again';
    feedbackDisplay.textContent = `Time's up! Your final score is ${score}. Click 'Play Again' to start a new game.`;
    feedbackDisplay.className = '';
}

function disableGameControls(disable = true) {
    userInput.disabled = disable;
    checkBtn.disabled = disable;
    nextBtn.disabled = disable;
}

// --- Event Listeners ---

startBtn.addEventListener('click', () => {
    gameStarted = true;
    score = 0; // Reset score for a new game
    updateScore(0); // Update display
    // Reset lifelines for a fresh game
    lifelines = { answer: 2, time: 3, brk: 2 };
    updateLifelineUI();
    startBtn.style.display = 'none'; // Hide start button
    disableGameControls(false); // Enable controls
    selectRandomWord();
    startTimer();
    feedbackDisplay.textContent = "";
});

checkBtn.addEventListener('click', () => {
    if (!gameStarted) return;

    const userAnswer = userInput.value.toUpperCase().trim();
    if (!userAnswer) {
        feedbackDisplay.textContent = "Please type an answer.";
        feedbackDisplay.className = '';
        return;
    }

    if (userAnswer === currentWord.word) {
        feedbackDisplay.textContent = "Correct!";
        feedbackDisplay.className = 'correct';
        updateScore(10); // Add points for correct answer
        nextBtn.disabled = false; // Enable next word button
        checkBtn.disabled = true; // Disable check until next word
    } else {
        feedbackDisplay.textContent = "Try again!";
        feedbackDisplay.className = 'wrong';
        updateScore(-2); // Deduct points for wrong answer
    }
});

nextBtn.addEventListener('click', () => {
    if (!gameStarted) return;
    feedbackDisplay.textContent = "";
    feedbackDisplay.className = '';
    selectRandomWord();
    checkBtn.disabled = false; // Re-enable check button for new word
});

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        if (!checkBtn.disabled) { // Only check if check button is enabled
            checkBtn.click();
        } else if (!nextBtn.disabled) { // If check is disabled, means correct, go to next word
            nextBtn.click();
        }
    }
});

// Lifeline handlers
function totalLifelinesLeft() {
    return lifelines.answer + lifelines.time + lifelines.brk;
}

function updateLifelineUI() {
    countAnswerSpan.textContent = lifelines.answer;
    countTimeSpan.textContent = lifelines.time;
    countBreakSpan.textContent = lifelines.brk;
    lifelinesTotalSpan.textContent = totalLifelinesLeft();
    lifelineAnswerBtn.disabled = lifelines.answer <= 0 || !gameStarted;
    lifelineTimeBtn.disabled = lifelines.time <= 0 || !gameStarted;
    lifelineBreakBtn.disabled = lifelines.brk <= 0 || !gameStarted;
}

lifelineAnswerBtn.addEventListener('click', () => {
    if (!gameStarted || lifelines.answer <= 0) return;
    const key = 'confirm_answer';
    const skip = localStorage.getItem(key) === 'true';
    if (!skip) {
        showConfirmModal('Use "Gimme Answer"? This will reveal the answer and consume a lifeline.', key)
            .then(confirmed => { if (confirmed) doUseAnswerLifeline(); });
        return;
    }
    doUseAnswerLifeline();
});

lifelineTimeBtn.addEventListener('click', () => {
    if (!gameStarted || lifelines.time <= 0) return;
    const key = 'confirm_time';
    const skip = localStorage.getItem(key) === 'true';
    if (!skip) {
        showConfirmModal('Add 20 seconds to the timer? This consumes one lifeline.', key)
            .then(confirmed => { if (confirmed) doUseTimeLifeline(); });
        return;
    }
    doUseTimeLifeline();
});

lifelineBreakBtn.addEventListener('click', () => {
    if (!gameStarted || lifelines.brk <= 0) return;
    const key = 'confirm_break';
    const skip = localStorage.getItem(key) === 'true';
    if (!skip) {
        showConfirmModal('Use "Gimme a Break" to reduce scrambling for this word?', key)
            .then(confirmed => { if (confirmed) doUseBreakLifeline(); });
        return;
    }
    doUseBreakLifeline();
});

// Lifeline action implementations
function doUseAnswerLifeline() {
    lifelines.answer--;
    animateLifelineUse(lifelineAnswerBtn);
    updateLifelineUI();
    userInput.value = currentWord.word;
    feedbackDisplay.textContent = `Answer revealed: ${currentWord.word}`;
    feedbackDisplay.className = 'correct';
    updateScore(7);
    checkBtn.disabled = true;
    nextBtn.disabled = false;
    playLifelineSound('answer');
}

function doUseTimeLifeline() {
    lifelines.time--;
    animateLifelineUse(lifelineTimeBtn);
    updateLifelineUI();
    timeLeft += 20;
    timeDisplay.textContent = timeLeft;
    feedbackDisplay.textContent = 'Added 20 seconds!';
    feedbackDisplay.className = '';
    playLifelineSound('time');
}

function doUseBreakLifeline() {
    lifelines.brk--;
    animateLifelineUse(lifelineBreakBtn);
    updateLifelineUI();
    reducedScramble = true;
    const scrambled = scrambleWord(currentWord.word);
    scrambledWordDisplay.textContent = scrambled;
    feedbackDisplay.textContent = 'Letters are less mixed for this word.';
    feedbackDisplay.className = '';
    playLifelineSound('break');
}

// Custom modal logic
const modal = document.getElementById('confirm-modal');
const modalMessage = document.getElementById('confirm-message');
const modalYes = document.getElementById('confirm-yes');
const modalNo = document.getElementById('confirm-no');
const dontAskCheckbox = document.getElementById('dont-ask');

function showConfirmModal(message, storageKey) {
    return new Promise(resolve => {
        modalMessage.textContent = message;
        dontAskCheckbox.checked = false;
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');

        function cleanUp(result) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            modalYes.removeEventListener('click', onYes);
            modalNo.removeEventListener('click', onNo);
            resolve(result);
        }

        function onYes() {
            if (dontAskCheckbox.checked) localStorage.setItem(storageKey, 'true');
            cleanUp(true);
        }

        function onNo() {
            if (dontAskCheckbox.checked) localStorage.setItem(storageKey, 'true');
            cleanUp(false);
        }

        modalYes.addEventListener('click', onYes);
        modalNo.addEventListener('click', onNo);
    });
}

// Small helper to animate lifeline button when used
function animateLifelineUse(button) {
    button.classList.add('lifeline-use');
    setTimeout(() => button.classList.remove('lifeline-use'), 420);
}

// --- Initial Setup ---
window.onload = () => {
    disableGameControls(); // Disable controls until game starts
    startBtn.style.display = 'block'; // Ensure start button is visible
    scrambledWordDisplay.textContent = "Click 'Start Game'!";
    feedbackDisplay.textContent = "";
    updateLifelineUI();
};
