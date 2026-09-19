/**
 * aarambh_recall Assessment - Script with 9 Growth & Discipline Questions
 * -----------------------------------------------------------------------
 * Rules:
 * - 9 Questions total.
 * - 1 Point per correct answer (Maximum Total = 9 Points).
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

// 9 Daily Growth & Discipline Questions Data with Correct Options
const quizData = [
    {
        id: 1,
        question: "What should we do with our morning time? ☀️",
        options: [
            "Waste it",
            "Delay our tasks",
            "Use it efficiently",
            "Avoid planning"
        ],
        correctOption: 2 // "Use it efficiently"
    },
    {
        id: 2,
        question: "What does 1% daily growth show? 📈",
        options: [
            "Growth happens overnight",
            "Small progress adds up",
            "Effort has no value",
            "Change is impossible"
        ],
        correctOption: 1 // "Small progress adds up"
    },
    {
        id: 3,
        question: "What can keep us away from growth?",
        options: [
            "Self-awareness",
            "Comfort zone",
            "Consistent effort",
            "Positive habits"
        ],
        correctOption: 1 // "Comfort zone"
    },
    {
        id: 4,
        question: "What is the result of consistent small efforts?",
        options: [
            "Long-term growth",
            "Instant success",
            "No noticeable change",
            "Guaranteed perfection"
        ],
        correctOption: 0 // "Long-term growth"
    },
    {
        id: 5,
        question: "Why do we need help during change?",
        options: [
            "To avoid responsibility",
            "To remain dependent",
            "To make change easier",
            "To escape effort"
        ],
        correctOption: 2 // "To make change easier"
    },
    {
        id: 6,
        question: "What does \"Golden Time\" mean? ⏳",
        options: [
            "Using time wisely",
            "Sleeping longer",
            "Avoiding responsibilities",
            "Delaying important work"
        ],
        correctOption: 0 // "Using time wisely"
    },
    {
        id: 7,
        question: "What makes change easier? 🌱",
        options: [
            "Taking external help",
            "Staying in comfort zone",
            "Avoiding challenges",
            "Waiting for change"
        ],
        correctOption: 0 // "Taking external help"
    },
    {
        id: 8,
        question: "Which of these helps in maintaining a disciplined daily routine?",
        options: [
            "Consistency",
            "Procrastination",
            "Irregular sleep",
            "Skipping activities"
        ],
        correctOption: 0 // "Consistency"
    },
    {
        id: 9,
        question: "Which habit can help you start your day with discipline?",
        options: [
            "Staying in bed",
            "Waking up early",
            "Using your phone first",
            "Skipping your routine"
        ],
        correctOption: 1 // "Waking up early"
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

    const maxPoints = quizData.length; // 9
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
        if (scoreTitleEl) scoreTitleEl.textContent = "Disciplined Master! 🌟";
        if (scoreDescEl) scoreDescEl.textContent = `Outstanding! You scored a perfect ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    } else if (totalPoints >= 7) {
        if (scoreTitleEl) scoreTitleEl.textContent = "High Achiever! 🎯";
        if (scoreDescEl) scoreDescEl.textContent = `Great job! You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    } else if (totalPoints >= 4) {
        if (scoreTitleEl) scoreTitleEl.textContent = "Growing Practitioner! 👍";
        if (scoreDescEl) scoreDescEl.textContent = `Good effort! You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    } else {
        if (scoreTitleEl) scoreTitleEl.textContent = "Build Daily Habits 💡";
        if (scoreDescEl) scoreDescEl.textContent = `You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    }

    // Dimension score metrics based on points
    let timeEfficiency = Math.round((totalPoints / maxPoints) * 100);
    let consistency = Math.min(100, Math.round(timeEfficiency * 1.05));
    let resilience = Math.min(100, Math.round(timeEfficiency * 0.95));
    let routineDiscipline = Math.min(100, Math.round(timeEfficiency * 1.02));

    // Evaluate Archetype
    const archetype = determineArchetype(totalPoints, scorePercent);

    // Render Archetype Card
    document.getElementById("archetype-title").textContent = archetype.title;
    document.getElementById("archetype-description").textContent = archetype.description;

    // Render Dimension Metric Cards
    updateMetricBar("intent", timeEfficiency, archetype.intentDesc);
    updateMetricBar("clarity", consistency, archetype.clarityDesc);
    updateMetricBar("action", resilience, archetype.actionDesc);
    updateMetricBar("love", routineDiscipline, archetype.loveDesc);

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
    if (points >= 8) {
        return {
            title: "Disciplined Master & High Performer",
            description: "You possess a strong commitment to 1% daily compounding growth, early morning discipline, time efficiency, and stepping out of your comfort zone to achieve long-term mastery.",
            intentDesc: "Exceptional time management & morning discipline.",
            clarityDesc: "Unshakable consistency and small daily wins.",
            actionDesc: "Proactively seeks guidance & steps out of comfort zone.",
            loveDesc: "Master of early rising and routine execution."
        };
    } else if (points >= 6) {
        return {
            title: "Consistent Growth Practitioner",
            description: "You appreciate the value of golden time, early morning routines, and daily progress. Continuing to eliminate procrastination will propel you to peak performance.",
            intentDesc: "High awareness of time value & morning efficiency.",
            clarityDesc: "Steady habit consistency and effort.",
            actionDesc: "Open to seeking help during key changes.",
            loveDesc: "Solid foundation in structured daily habits."
        };
    } else if (points >= 4) {
        return {
            title: "Emerging Habit Builder",
            description: "You recognize the core principles of personal growth. Focusing on waking up early and consistently making small efforts will compound your results significantly.",
            intentDesc: "Growing awareness of morning time management.",
            clarityDesc: "Developing 1% daily progress momentum.",
            actionDesc: "Learning to step outside comfort zones.",
            loveDesc: "Building regular daily discipline."
        };
    } else {
        return {
            title: "Habit Pioneer & Future Achiever",
            description: "You are at the beginning of building your optimal routine. Reviewing the answer breakdown will help you understand the power of waking early and consistency.",
            intentDesc: "First steps toward structured time management.",
            clarityDesc: "Building momentum for daily progress.",
            actionDesc: "Opportunity to embrace external guidance.",
            loveDesc: "Ready to establish morning discipline."
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
            title: "The Power of 1% Daily Growth",
            text: "Small progress compounds massively over time. Consistent small efforts lead to remarkable long-term growth that far surpasses overnight bursts."
        },
        {
            title: "Golden Time & Morning Discipline",
            text: "Using your morning 'Golden Time' efficiently and waking up early sets a disciplined tone for your entire day and eliminates wasteful delays."
        },
        {
            title: "Breaking Free from Comfort Zones",
            text: "Comfort zones block personal growth. Embracing challenges and taking external help makes navigating change easier and far more effective."
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
