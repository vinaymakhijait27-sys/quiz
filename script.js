/**
 * aarambh_recall Assessment - Script with 10 Spiritual Questions & Point Scoring
 * -------------------------------------------------------------------------------
 * Rules:
 * - 10 Questions total.
 * - 1 Point per correct answer (Maximum Total = 10 Points).
 * - Millisecond Precision Timer tracks exact completion speed.
 * - Single-Attempt assessment (No Retake option).
 */

// Global Quiz State
const state = {
    userName: "",
    currentQuestionIndex: 0,
    answers: {}, // Maps question index to selected option index
    startTime: null,
    endTime: null
};

// 10 Spiritual & Mindset Questions Data with Correct Options
const quizData = [
    {
        id: 1,
        question: "Where does the soul get its power?",
        options: [
            "Almighty",
            "Mitochondria",
            "Positive thoughts",
            "All of the above"
        ],
        correctOption: 0 // "Almighty"
    },
    {
        id: 2,
        question: "What is common between the soul and the Supreme Soul?",
        options: [
            "Both are eternal",
            "Both are self-luminous",
            "Both are points of light",
            "All of the above"
        ],
        correctOption: 3 // "All of the above"
    },
    {
        id: 3,
        question: "How is the soul different from the Supreme Soul?",
        options: [
            "Soul carries past karma; Supreme Soul does not",
            "Supreme Soul is bodied; soul is bodiless",
            "There are many Gods",
            "Soul incarnates; Supreme Soul is womb-born"
        ],
        correctOption: 0 // "Soul carries past karma; Supreme Soul does not"
    },
    {
        id: 4,
        question: "Which English term is paired with the Hindi phrase \"Sarva Shaktivaan\"?",
        options: [
            "Supreme",
            "Omniscient",
            "Almighty",
            "Beyond All"
        ],
        correctOption: 2 // "Almighty"
    },
    {
        id: 5,
        question: "Which negative trait is illustrated by a character surrounded by a ring of fire?",
        options: [
            "Anger",
            "Ego",
            "Lust",
            "Greed"
        ],
        correctOption: 2 // "Lust"
    },
    {
        id: 6,
        question: "Which of the following traits is NOT listed as one of the five elements which opposes the role of supreme?",
        options: [
            "Attachment",
            "Greed",
            "Ego",
            "Jealousy"
        ],
        correctOption: 3 // "Jealousy"
    },
    {
        id: 7,
        question: "Which of the following is a way to build a personal relationship with the Divine as a friend?",
        options: [
            "Avoiding quiet contemplation",
            "Sharing your personal secrets",
            "Relying only on physical strength",
            "Keeping your feelings hidden"
        ],
        correctOption: 1 // "Sharing your personal secrets"
    },
    {
        id: 8,
        question: "According to the ideas of spiritual connection, what do you \"receive\" when you connect with the Divine?",
        options: [
            "Material wealth",
            "Inner power and strength",
            "Immediate answers to every wish",
            "Physical rewards"
        ],
        correctOption: 1 // "Inner power and strength"
    },
    {
        id: 9,
        question: "Who is beyond the effects of birth and death, joy and sorrow, sin and virtue?",
        options: [
            "Supreme Soul",
            "Material elements",
            "Soul",
            "Lower mortal concepts"
        ],
        correctOption: 0 // "Supreme Soul"
    },
    {
        id: 10,
        question: "Who is the owner of the body?",
        options: [
            "Soul",
            "Supreme Soul",
            "Mind",
            "Heart"
        ],
        correctOption: 0 // "Soul"
    }
];

// Initialize DOM Events when page loads
document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/**
 * Handle Start Form Submit
 */
function handleStart(event) {
    event.preventDefault();
    const nameInput = document.getElementById("username");
    if (!nameInput || !nameInput.value.trim()) return;

    state.userName = nameInput.value.trim();
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.startTime = performance.now ? (performance.now() + performance.timeOrigin) : Date.now(); // High precision start timestamp

    switchView("quiz-view");
    renderQuestion();
}

/**
 * Switch View Helper
 */
function switchView(viewId) {
    const views = document.querySelectorAll(".view");
    views.forEach(v => {
        v.classList.remove("active");
    });

    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

/**
 * Render Current Question
 */
function renderQuestion() {
    const qIndex = state.currentQuestionIndex;
    const currentQ = quizData[qIndex];
    const totalQ = quizData.length;

    // Update Progress
    const counterEl = document.getElementById("question-counter");
    const percentEl = document.getElementById("progress-percent");
    const barEl = document.getElementById("progress-bar");

    const progressPercentage = Math.round(((qIndex + 1) / totalQ) * 100);
    counterEl.textContent = `Question ${qIndex + 1} of ${totalQ}`;
    percentEl.textContent = `${progressPercentage}% Completed`;
    barEl.style.width = `${progressPercentage}%`;

    // Render Question Text
    const qTextEl = document.getElementById("question-text");
    qTextEl.textContent = currentQ.question;

    // Render Options
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    currentQ.options.forEach((optText, optIdx) => {
        const optionCard = document.createElement("div");
        optionCard.className = "option-card";
        if (state.answers[qIndex] === optIdx) {
            optionCard.classList.add("selected");
        }

        optionCard.setAttribute("tabindex", "0");
        optionCard.setAttribute("role", "radio");
        optionCard.setAttribute("aria-checked", state.answers[qIndex] === optIdx ? "true" : "false");

        optionCard.innerHTML = `
            <div class="radio-indicator"></div>
            <span class="option-text">${escapeHtml(optText)}</span>
        `;

        optionCard.addEventListener("click", () => selectOption(optIdx));
        optionCard.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectOption(optIdx);
            }
        });

        optionsContainer.appendChild(optionCard);
    });

    // Update Footer Nav Buttons
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const btnNextText = document.getElementById("btn-next-text");

    btnPrev.disabled = qIndex === 0;

    const hasSelected = state.answers[qIndex] !== undefined;
    btnNext.disabled = !hasSelected;

    if (qIndex === totalQ - 1) {
        btnNextText.textContent = "See Score & Analysis";
    } else {
        btnNextText.textContent = "Next Question";
    }
}

/**
 * Handle Option Selection (Manual navigation only)
 */
function selectOption(optIdx) {
    state.answers[state.currentQuestionIndex] = optIdx;

    const cards = document.querySelectorAll(".option-card");
    cards.forEach((card, i) => {
        if (i === optIdx) {
            card.classList.add("selected");
            card.setAttribute("aria-checked", "true");
        } else {
            card.classList.remove("selected");
            card.setAttribute("aria-checked", "false");
        }
    });

    const btnNext = document.getElementById("btn-next");
    btnNext.disabled = false;
}

/**
 * Navigate Questions
 */
function navigateQuestion(direction) {
    const newIdx = state.currentQuestionIndex + direction;

    if (newIdx >= quizData.length) {
        calculateAndShowResults();
        return;
    }

    if (newIdx >= 0 && newIdx < quizData.length) {
        state.currentQuestionIndex = newIdx;
        renderQuestion();
    }
}

/**
 * Calculate Score Points, Archetype, Dimensions, Millisecond Precision Time Taken & Render Results
 */
function calculateAndShowResults() {
    state.endTime = performance.now ? (performance.now() + performance.timeOrigin) : Date.now(); // Record end timestamp

    // 1. Calculate Score Points (1 point per correct answer)
    let totalPoints = 0;
    quizData.forEach((qItem, qIdx) => {
        if (state.answers[qIdx] === qItem.correctOption) {
            totalPoints += 1;
        }
    });

    const maxPoints = quizData.length; // 10
    const scorePercent = Math.round((totalPoints / maxPoints) * 100);

    // Calculate exact millisecond duration
    const totalMs = Math.max(1, Math.round(state.endTime - state.startTime));
    const formattedTime = formatTimeTakenWithMs(totalMs);

    // Update Header Displays
    const nameEl = document.getElementById("user-display-name");
    if (nameEl) nameEl.textContent = state.userName || "Friend";

    const timeEl = document.getElementById("time-taken-display");
    if (timeEl) timeEl.textContent = formattedTime;

    // Render Score Card
    const scoreNumEl = document.getElementById("score-points-display");
    if (scoreNumEl) scoreNumEl.textContent = `${totalPoints}/${maxPoints}`;

    const scoreTitleEl = document.getElementById("score-title");
    const scoreDescEl = document.getElementById("score-summary-text");

    if (totalPoints === maxPoints) {
        if (scoreTitleEl) scoreTitleEl.textContent = "Perfect Score! 🌟";
        if (scoreDescEl) scoreDescEl.textContent = `Outstanding! You scored a perfect ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    } else if (totalPoints >= 7) {
        if (scoreTitleEl) scoreTitleEl.textContent = "Great Job! 🎯";
        if (scoreDescEl) scoreDescEl.textContent = `Well done! You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    } else if (totalPoints >= 4) {
        if (scoreTitleEl) scoreTitleEl.textContent = "Good Attempt! 👍";
        if (scoreDescEl) scoreDescEl.textContent = `You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    } else {
        if (scoreTitleEl) scoreTitleEl.textContent = "Keep Learning & Growing 💡";
        if (scoreDescEl) scoreDescEl.textContent = `You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    }

    // Dimension score metrics based on points
    let spiritualScore = Math.round((totalPoints / maxPoints) * 100);
    let focusScore = Math.min(100, Math.round(spiritualScore * 1.05));
    let wisdomScore = Math.min(100, Math.round(spiritualScore * 0.95));
    let purityScore = Math.min(100, Math.round(spiritualScore * 1.02));

    // Evaluate Archetype
    const archetype = determineArchetype(totalPoints, scorePercent);

    // Render Archetype Card
    document.getElementById("archetype-title").textContent = archetype.title;
    document.getElementById("archetype-description").textContent = archetype.description;

    // Render Dimension Metric Cards
    updateMetricBar("intent", spiritualScore, archetype.intentDesc);
    updateMetricBar("clarity", focusScore, archetype.clarityDesc);
    updateMetricBar("action", wisdomScore, archetype.actionDesc);
    updateMetricBar("love", purityScore, archetype.loveDesc);

    // Render Detailed Insights List
    renderInsights(totalPoints);

    // Render Question & Answer Breakdown with Correct/Incorrect Badges
    renderAnswersSummary();

    // Show Results View
    switchView("results-view");
}

/**
 * Format Duration with Millisecond Precision
 */
function formatTimeTakenWithMs(totalMs) {
    const seconds = totalMs / 1000;
    if (seconds < 60) {
        return `${seconds.toFixed(2)} sec (${totalMs.toLocaleString()} ms)`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins} min ${secs} sec (${totalMs.toLocaleString()} ms)`;
}

/**
 * Determine Mindset Archetype based on score
 */
function determineArchetype(points, percent) {
    if (points >= 9) {
        return {
            title: "Spiritual Master & Enlightened Soul",
            description: "You possess extraordinary spiritual clarity and profound knowledge regarding the Soul, Supreme Soul, and divine relationships. You recognize the Soul as the true owner of the body.",
            intentDesc: "Deep alignment with divine power & supreme truth.",
            clarityDesc: "Unshakable spiritual focus and mental purity.",
            actionDesc: "Harmonious union between divine wisdom and life.",
            loveDesc: "Pure spiritual love and complete inner freedom."
        };
    } else if (points >= 7) {
        return {
            title: "The Conscious Seeker",
            description: "You have strong spiritual understanding and awareness of divine connection. You appreciate the eternal nature of the soul and the supreme power of the Divine.",
            intentDesc: "High awareness of spiritual principles.",
            clarityDesc: "Clear focus with growing meditative discernment.",
            actionDesc: "Applies spiritual knowledge effectively.",
            loveDesc: "Strong personal relationship with the Divine."
        };
    } else if (points >= 4) {
        return {
            title: "The Developing Explorer",
            description: "You understand fundamental spiritual concepts, though some deeper distinctions between Soul, Karma, and Supreme Soul offer great opportunity for deeper contemplation.",
            intentDesc: "Balanced understanding of spiritual concepts.",
            clarityDesc: "Steady progress in mental focus.",
            actionDesc: "Encouraged to deepen spiritual practice.",
            loveDesc: "Growing connection with inner power."
        };
    } else {
        return {
            title: "The Curious Beginner",
            description: "You are starting your spiritual journey. Reviewing the answer breakdown will help you understand the eternal nature of the Soul and Divine connection.",
            intentDesc: "Initial exploration of spiritual concepts.",
            clarityDesc: "Seeking deeper mental stillness.",
            actionDesc: "Great opportunity to build spiritual knowledge.",
            loveDesc: "Opening heart to divine friendship."
        };
    }
}

/**
 * Helper to Update Metric Bar
 */
function updateMetricBar(idKey, score, descText) {
    const scoreEl = document.getElementById(`metric-${idKey}-score`);
    const barEl = document.getElementById(`bar-${idKey}`);
    const descEl = document.getElementById(`metric-${idKey}-desc`);

    if (scoreEl) scoreEl.textContent = `${score}%`;
    if (barEl) barEl.style.width = `${score}%`;
    if (descEl && descText) descEl.textContent = descText;
}

/**
 * Render Tailored Insights
 */
function renderInsights(points) {
    const container = document.getElementById("insights-container");
    container.innerHTML = "";

    const insights = [
        {
            title: "Eternal Nature of the Soul",
            text: "The Soul is the true owner of the body—eternal, self-luminous, and a point of light. Unlike the Supreme Soul who remains beyond karma and birth-death cycles, the soul carries past karma and incarnates."
        },
        {
            title: "Sarva Shaktivaan (Almighty)",
            text: "The Supreme Soul is Almighty, incorporeal, and eternal. Connecting with the Divine as a friend through sharing your personal secrets fills the soul with inner power and strength."
        },
        {
            title: "Overcoming Vices",
            text: "Lust is a major vice illustrated by being surrounded by a ring of fire. Recognizing and overcoming negative traits leads to true emotional freedom and spiritual liberation."
        }
    ];

    insights.forEach(item => {
        const div = document.createElement("div");
        div.className = "insight-item";
        div.innerHTML = `
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.text)}</p>
        `;
        container.appendChild(div);
    });
}

/**
 * Render Question & Answer Review List with Correct/Incorrect Badges
 */
function renderAnswersSummary() {
    const container = document.getElementById("answers-summary");
    container.innerHTML = "";

    quizData.forEach((item, qIdx) => {
        const selectedOptIdx = state.answers[qIdx];
        const selectedOptText = selectedOptIdx !== undefined ? item.options[selectedOptIdx] : "Not Answered";
        const isCorrect = selectedOptIdx === item.correctOption;
        const correctOptText = item.options[item.correctOption];

        const div = document.createElement("div");
        div.className = `summary-item ${isCorrect ? "correct-item" : "incorrect-item"}`;

        div.innerHTML = `
            <div class="summary-q-header">
                <span class="summary-q">Q${qIdx + 1}: ${escapeHtml(item.question)}</span>
                <span class="point-badge ${isCorrect ? "badge-correct" : "badge-incorrect"}">
                    ${isCorrect ? "✓ +1 Point" : "✗ 0 Points"}
                </span>
            </div>
            <div class="summary-a-user ${isCorrect ? "is-correct" : "is-incorrect"}">
                <span>Your Answer: ${escapeHtml(selectedOptText)}</span>
            </div>
            ${!isCorrect ? `<div class="summary-correct-answer">✓ Correct Answer: ${escapeHtml(correctOptText)}</div>` : ""}
        `;

        container.appendChild(div);
    });
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
