"use strict";

const QUESTION_COUNT = 8;
const TIME_PER_QUESTION = 20;

const questionBank = [
  { category: "Science", difficulty: "Easy", question: "Which planet is known as the Red Planet?", answers: ["Venus", "Mars", "Jupiter", "Mercury"], correct: 1, fact: "Mars looks red because iron-rich dust on its surface has rusted." },
  { category: "Science", difficulty: "Easy", question: "What is the chemical symbol for water?", answers: ["CO₂", "O₂", "H₂O", "NaCl"], correct: 2, fact: "Each water molecule is made of two hydrogen atoms and one oxygen atom." },
  { category: "Science", difficulty: "Medium", question: "What is the name for animals that are most active at dawn and dusk?", answers: ["Nocturnal", "Diurnal", "Crepuscular", "Migratory"], correct: 2, fact: "Crepuscular animals make the most of the softer light at twilight." },
  { category: "Science", difficulty: "Hard", question: "Which particle in an atom has a negative electric charge?", answers: ["Proton", "Neutron", "Electron", "Nucleus"], correct: 2, fact: "Electrons carry a negative charge and occupy regions around an atom's nucleus." },
  { category: "Nature", difficulty: "Easy", question: "What is the largest animal on Earth?", answers: ["African elephant", "Blue whale", "Whale shark", "Giraffe"], correct: 1, fact: "A blue whale can grow longer than 30 metres and weigh around 200 tonnes." },
  { category: "Nature", difficulty: "Easy", question: "What do bees collect from flowers to make honey?", answers: ["Nectar", "Pollen only", "Sap", "Dew"], correct: 0, fact: "Bees transform flower nectar into honey and store it as food for the colony." },
  { category: "Nature", difficulty: "Medium", question: "Which part of a plant takes in most of its water?", answers: ["Leaves", "Flower", "Roots", "Stem"], correct: 2, fact: "Tiny root hairs help plants absorb water and nutrients from the soil." },
  { category: "Nature", difficulty: "Hard", question: "What is the term for a group of flamingos?", answers: ["A parliament", "A flamboyance", "A tower", "A skulk"], correct: 1, fact: "A group of flamingos is delightfully called a flamboyance." },
  { category: "History", difficulty: "Easy", question: "The ancient pyramids of Giza are in which country?", answers: ["Greece", "Mexico", "Egypt", "India"], correct: 2, fact: "The Giza pyramid complex sits on the outskirts of modern Cairo, Egypt." },
  { category: "History", difficulty: "Medium", question: "Which writing system was used in ancient Egypt?", answers: ["Cuneiform", "Hieroglyphs", "Linear B", "Runes"], correct: 1, fact: "Egyptian hieroglyphs used picture-like signs to represent words and sounds." },
  { category: "History", difficulty: "Medium", question: "The Renaissance began in which European country?", answers: ["France", "Italy", "Spain", "Portugal"], correct: 1, fact: "The Renaissance took root in Italian cities such as Florence in the 14th century." },
  { category: "History", difficulty: "Hard", question: "Which city was the capital of the Byzantine Empire?", answers: ["Athens", "Alexandria", "Constantinople", "Rome"], correct: 2, fact: "Constantinople, now Istanbul, served as the Byzantine capital for over a thousand years." },
  { category: "Technology", difficulty: "Easy", question: "What does 'www' stand for in a website address?", answers: ["World Wide Web", "Web World Wire", "Wide Web Window", "World Web Way"], correct: 0, fact: "The World Wide Web is the system of linked pages and resources accessed over the internet." },
  { category: "Technology", difficulty: "Medium", question: "Which two digits are used in the binary number system?", answers: ["1 and 2", "0 and 1", "0 and 9", "2 and 10"], correct: 1, fact: "Binary represents information using just two symbols: 0 and 1." },
  { category: "Technology", difficulty: "Medium", question: "What does GPS help a device determine?", answers: ["Its location", "Its temperature", "Its battery health", "Its screen size"], correct: 0, fact: "GPS uses signals from satellites to calculate a receiver's position on Earth." },
  { category: "Technology", difficulty: "Hard", question: "What does the 'S' in HTTPS stand for?", answers: ["System", "Secure", "Server", "Software"], correct: 1, fact: "HTTPS uses encryption to protect data sent between your browser and a website." }
];

const setupPanel = document.querySelector("#setup-panel");
const questionPanel = document.querySelector("#question-panel");
const resultsPanel = document.querySelector("#results-panel");
const startButton = document.querySelector("#start-button");
const nextButton = document.querySelector("#next-button");
const playAgainButton = document.querySelector("#play-again-button");
const categorySelect = document.querySelector("#category-select");
const difficultySelect = document.querySelector("#difficulty-select");
const questionCounter = document.querySelector("#question-counter");
const statusLabel = document.querySelector("#status-label");
const questionCategory = document.querySelector("#question-category");
const questionText = document.querySelector("#question-text");
const answerList = document.querySelector("#answer-list");
const feedback = document.querySelector("#feedback");
const progressFill = document.querySelector("#progress-fill");
const timerElement = document.querySelector("#timer");
const timerValue = document.querySelector("#timer-value");
const soundToggle = document.querySelector("#sound-toggle");
const roundCount = document.querySelector("#round-count");
const roundDetail = document.querySelector("#round-detail");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let answered = false;
let soundEnabled = false;
let audioContext = null;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function updateRoundInfo() {
  const availableCount = questionBank.filter((item) =>
    (categorySelect.value === "all" || item.category === categorySelect.value) &&
    (difficultySelect.value === "all" || item.difficulty === difficultySelect.value)
  ).length;
  const roundLength = Math.min(QUESTION_COUNT, availableCount);

  roundCount.textContent = roundLength === 1 ? "1 question" : `${roundLength} questions`;
  roundDetail.textContent = availableCount === 0
    ? " Try another subject and pace."
    : " A fresh mix every time. You’ve got this.";
  startButton.disabled = availableCount === 0;
}

function startQuiz() {
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  const filteredQuestions = questionBank.filter((item) =>
    (category === "all" || item.category === category) &&
    (difficulty === "all" || item.difficulty === difficulty)
  );

  if (filteredQuestions.length < QUESTION_COUNT) {
    const availableCount = filteredQuestions.length;
    questions = shuffle(filteredQuestions);
    if (availableCount === 0) {
      feedback.textContent = "No questions match those choices. Please try another combination.";
      return;
    }
  } else {
    questions = shuffle(filteredQuestions).slice(0, QUESTION_COUNT);
  }

  currentQuestionIndex = 0;
  score = 0;
  setupPanel.classList.add("hidden");
  resultsPanel.classList.add("hidden");
  questionPanel.classList.remove("hidden");
  statusLabel.textContent = "YOUR CURIOSITY, IN MOTION";
  renderQuestion();
}

function renderQuestion() {
  clearInterval(timerId);
  answered = false;
  const currentQuestion = questions[currentQuestionIndex];
  questionCounter.textContent = `${String(currentQuestionIndex + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`;
  questionCategory.textContent = currentQuestion.category.toUpperCase();
  questionText.textContent = currentQuestion.question;
  progressFill.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
  feedback.textContent = "";
  feedback.className = "feedback";
  nextButton.classList.add("hidden");
  timerElement.classList.remove("is-low", "is-urgent");

  answerList.replaceChildren();
  currentQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.answerIndex = String(index);

    const key = document.createElement("span");
    key.className = "answer-key";
    key.textContent = String.fromCharCode(65 + index);
    const answerText = document.createElement("span");
    answerText.textContent = answer;
    button.append(key, answerText);
    button.addEventListener("click", () => selectAnswer(index));
    answerList.append(button);
  });

  timeLeft = TIME_PER_QUESTION;
  timerValue.textContent = String(timeLeft);
  timerId = window.setInterval(tickTimer, 1000);
}

function tickTimer() {
  timeLeft -= 1;
  timerValue.textContent = String(timeLeft);
  timerElement.classList.toggle("is-low", timeLeft <= 10);
  timerElement.classList.toggle("is-urgent", timeLeft <= 5);
  if (timeLeft > 0 && timeLeft <= 5) playTone(880, 0.09);
  if (timeLeft <= 0) {
    clearInterval(timerId);
    selectAnswer(null);
  }
}

function selectAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);

  const currentQuestion = questions[currentQuestionIndex];
  const answerButtons = [...answerList.querySelectorAll(".answer-button")];
  answerButtons.forEach((button) => {
    button.disabled = true;
    if (Number(button.dataset.answerIndex) === currentQuestion.correct) {
      button.classList.add("correct");
    }
    if (selectedIndex !== null && Number(button.dataset.answerIndex) === selectedIndex && selectedIndex !== currentQuestion.correct) {
      button.classList.add("incorrect");
    }
  });

  if (selectedIndex === currentQuestion.correct) {
    score += 1;
    feedback.textContent = `That’s right! ${currentQuestion.fact}`;
    playTone(660, 0.13);
  } else if (selectedIndex === null) {
    feedback.textContent = `Time’s up! ${currentQuestion.fact}`;
    feedback.classList.add("incorrect");
    playTone(220, 0.18);
  } else {
    feedback.textContent = `Not quite — ${currentQuestion.fact}`;
    feedback.classList.add("incorrect");
    playTone(220, 0.18);
  }

  nextButton.innerHTML = currentQuestionIndex === questions.length - 1
    ? 'See your results <span aria-hidden="true">→</span>'
    : 'Next question <span aria-hidden="true">→</span>';
  nextButton.classList.remove("hidden");
}

function showNextQuestion() {
  currentQuestionIndex += 1;
  if (currentQuestionIndex >= questions.length) {
    showResults();
    return;
  }
  renderQuestion();
}

function showResults() {
  clearInterval(timerId);
  questionPanel.classList.add("hidden");
  resultsPanel.classList.remove("hidden");
  questionCounter.textContent = "QUIZ COMPLETE";
  statusLabel.textContent = "WELL DONE, EXPLORER";
  progressFill.style.width = "100%";

  const percentage = Math.round((score / questions.length) * 100);
  document.querySelector("#results-score").textContent = `${score} / ${questions.length}`;
  document.querySelector("#results-title").textContent =
    percentage === 100 ? "A brilliant mind." :
      percentage >= 60 ? "Beautifully curious." : "Curiosity suits you.";
  document.querySelector("#results-message").textContent =
    percentage === 100
      ? "A perfect round! You clearly love learning. Ready to explore another subject?"
      : percentage >= 60
        ? `You got ${percentage}% right — and picked up a few new facts along the way. Keep that curiosity going.`
        : "Every question is a chance to discover something new. Take another round and see what sticks.";
  document.querySelector("#results-icon").textContent = percentage >= 60 ? "✳" : "✦";
  playTone(percentage >= 60 ? 660 : 440, 0.2);
}

function playTone(frequency, duration) {
  if (!soundEnabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
  if (soundEnabled) playTone(520, 0.1);
}

startButton.addEventListener("click", startQuiz);
nextButton.addEventListener("click", showNextQuestion);
playAgainButton.addEventListener("click", () => {
  questionPanel.classList.add("hidden");
  resultsPanel.classList.add("hidden");
  setupPanel.classList.remove("hidden");
  questionCounter.textContent = "LET'S BEGIN";
  statusLabel.textContent = "READY WHEN YOU ARE";
});
soundToggle.addEventListener("click", toggleSound);
categorySelect.addEventListener("change", updateRoundInfo);
difficultySelect.addEventListener("change", updateRoundInfo);
updateRoundInfo();
