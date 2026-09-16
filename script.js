/**
 * Mind & Perception Assessment - Script with Points Scoring & Millisecond Precision Timer
 * ----------------------------------------------------------------------------------------
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

// Quiz Questions & Options Data with Correct Answers
const quizData = [
    {
        id: 1,
        question: "Do you think our thoughts and words can influence the world around us?",
        options: [
            "Yes, the mind has a powerful influence",
            "Maybe, but I’m not sure",
            "No, only physical factors matter",
            "I need more evidence"
        ],
        correctOption: 0 // "Yes, the mind has a powerful influence"
    },
    {
        id: 2,
        question: "What do you think about the claim that positive words create more beautiful water-crystal patterns?",
        options: [
            "I find it fascinating",
            "There could be something to it",
            "Interesting, but needs scientific proof",
            "I don’t believe it"
        ],
        correctOption: 2 // "Interesting, but needs scientific proof"
    },
    {
        id: 3,
        question: "Which state best describes your mind most often?",
        options: [
            "Distracted — constantly jumping between thoughts",
            "Overactive — thinking about everything at once",
            "Clean & Clear — calm, focused and aware",
            "It depends on the situation"
        ],
        correctOption: 3 // "It depends on the situation"
    },
    {
        id: 4,
        question: "What do you think transforms knowledge into actual change?",
        options: [
            "Knowledge alone",
            "Meditation & reflection",
            "Knowledge + Meditation",
            "Experience & practice"
        ],
        correctOption: 2 // "Knowledge + Meditation"
    },
    {
        id: 5,
        question: "What does attachment feel like to you?",
        options: [
            "Giving someone control over your emotions",
            "Losing your sense of independence",
            "Feeling deeply connected",
            "Depends on the relationship"
        ],
        correctOption: 0 // "Giving someone control over your emotions"
    },
    {
        id: 6,
        question: "Which statement do you agree with more?",
        options: [
            "Love gives freedom",
            "Attachment creates dependency",
            "Love can have both freedom & attachment",
            "It depends on how you love"
        ],
        correctOption: 0 // "Love gives freedom"
    },
    {
        id: 7,
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
        id: 8,
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
        id: 9,
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
        id: 10,
        question: "What is the true form of God?",
        options: [
            "Incorporeal",
            "Point of light",
            "Eternal",
            "All of the above"
        ],
        correctOption: 3 // "All of the above"
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
        if (scoreTitleEl) scoreTitleEl.textContent = "Thought-Provoking Assessment 💡";
        if (scoreDescEl) scoreDescEl.textContent = `You scored ${totalPoints} out of ${maxPoints} points (${scorePercent}%).`;
    }

    // Extract raw choices
    const a1 = state.answers[0]; // Q1 Mind Influence
    const a2 = state.answers[1]; // Q2 Water Crystal
    const a3 = state.answers[2]; // Q3 State of Mind
    const a4 = state.answers[3]; // Q4 Knowledge to Change
    const a5 = state.answers[4]; // Q5 Attachment Feeling
    const a6 = state.answers[5]; // Q6 Love & Freedom
    const a7 = state.answers[6]; // Q7 Soul Power
    const a8 = state.answers[7]; // Q8 Soul vs Supreme Common
    const a9 = state.answers[8]; // Q9 Soul vs Supreme Diff
    const a10 = state.answers[9]; // Q10 Form of God

    // Calculate Dimension Scores (0 - 100)
    let intentScore = 50;
    if (a1 === 0) intentScore += 20;
    if (a2 === 0 || a2 === 2) intentScore += 15;
    if (a7 === 0) intentScore += 15;

    let clarityScore = 50;
    if (a3 === 3 || a3 === 2) clarityScore += 25;
    if (a8 === 3) clarityScore += 25;

    let actionScore = 50;
    if (a4 === 2) actionScore += 25;
    if (a9 === 0) actionScore += 25;

    let loveScore = 50;
    if (a5 === 0) loveScore += 25;
    if (a6 === 0) loveScore += 25;

    // Evaluate Archetype
    const archetype = determineArchetype(a1, a2, a3, a4, a5, a6, intentScore, clarityScore, actionScore, loveScore);

    // Render Archetype Card
    document.getElementById("archetype-title").textContent = archetype.title;
    document.getElementById("archetype-description").textContent = archetype.description;

    // Render Dimension Metric Cards
    updateMetricBar("intent", intentScore, archetype.intentDesc);
    updateMetricBar("clarity", clarityScore, archetype.clarityDesc);
    updateMetricBar("action", actionScore, archetype.actionDesc);
    updateMetricBar("love", loveScore, archetype.loveDesc);

    // Render Detailed Insights List
    renderInsights(a1, a2, a3, a4, a5, a6);

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
 * Determine Mindset Archetype
 */
function determineArchetype(a1, a2, a3, a4, a5, a6, intentScore, clarityScore, actionScore, loveScore) {
    if (intentScore >= 75 && clarityScore >= 70) {
        return {
            title: "The Conscious Visionary",
            description: "You possess a profound awareness of the relationship between internal thoughts, spiritual truth, and external reality. With a clear mind and open perspective, you recognize that true wisdom transforms outward through practice and divine alignment.",
            intentDesc: "High belief in the power of conscious thought and spiritual energy.",
            clarityDesc: "Strong mental clarity with a peaceful, focused internal state.",
            actionDesc: "Grounded in practical execution and mindful meditation.",
            loveDesc: "Views love as a force of liberation and meaningful connection."
        };
    } else if (intentScore < 50 && actionScore >= 80) {
        return {
            title: "The Practical Realist",
            description: "Grounded and analytical, you rely on empirical evidence, physical facts, and real-world experience. You value clear action and tangible results over abstract theories.",
            intentDesc: "Focuses heavily on observable physical phenomena and evidence.",
            clarityDesc: "Pragmatic mental processing focused on tangible reality.",
            actionDesc: "Strong emphasis on direct experience and practical iteration.",
            loveDesc: "Values personal autonomy, clear boundaries, and functional relationships."
        };
    } else if (a3 === 2 && actionScore >= 80) {
        return {
            title: "The Centered Strategist",
            description: "Calm, focused, and discerning. You maintain a clean mental space and understand that knowledge paired with meditation produces meaningful life transformations.",
            intentDesc: "Open-minded yet balanced in evaluating subtle influence.",
            clarityDesc: "Exceptional calm, focus, and heightened situational awareness.",
            actionDesc: "Executes efficiently by turning insight into habitual practice.",
            loveDesc: "Maintains healthy balance between emotional intimacy and independence."
        };
    } else if (a1 <= 1 && a2 <= 1 && (a5 === 2 || a6 === 2 || a6 === 0)) {
        return {
            title: "The Intuitive Explorer",
            description: "Fascinated by the hidden connections in nature, soul, and human interaction. You view mind and spiritual emotion as interconnected currents flowing through life.",
            intentDesc: "High receptivity to subtle intentions, words, and divine resonance.",
            clarityDesc: "Dynamic mental state responsive to environment and mood.",
            actionDesc: "Believes inner reflection and outer practice work in harmony.",
            loveDesc: "Embraces love as a expanding field of freedom and deep unity."
        };
    } else {
        return {
            title: "The Balanced Observer",
            description: "Thoughtful and adaptable. You navigate life's questions with nuance—recognizing that situations vary and that wisdom comes from synthesizing multiple perspectives.",
            intentDesc: "Balanced view of mental intention and physical factors.",
            clarityDesc: "Adaptable mindset that shifts thoughtfully with context.",
            actionDesc: "Recognizes that real change requires both reflection and experience.",
            loveDesc: "Understands the nuanced dance between freedom, connection, and growth."
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
function renderInsights(a1, a2, a3, a4, a5, a6) {
    const container = document.getElementById("insights-container");
    container.innerHTML = "";

    const insights = [];

    if (a1 === 0 || a2 === 0 || a2 === 1) {
        insights.push({
            title: "High Intentionality & Mindful Speech",
            text: "You naturally lean towards believing that human thought and spoken words hold vibrant subtle power. Being intentional with your language and internal dialogue will yield positive reflections in your environment."
        });
    } else {
        insights.push({
            title: "Empirical Discerning Mindset",
            text: "You maintain a high standard for scientific verification before accepting claims regarding mental influence. This skepticism keeps you anchored in solid reality."
        });
    }

    if (a3 === 2 || a3 === 3) {
        insights.push({
            title: "Clean & Centered Focus",
            text: "Your mind operates primarily from a clear or adaptable baseline. This mental clarity provides you with emotional resilience, keen decision-making capabilities, and peace."
        });
    } else {
        insights.push({
            title: "High Cognitive Speed & Processing",
            text: "Having an active mind means you process vast information simultaneously. Channelling this energy through structured reflection can convert mental noise into profound creativity."
        });
    }

    if (a4 === 2 || a4 === 3) {
        insights.push({
            title: "Action & Meditation Synergy",
            text: "You wisely identify Meditation and practice as key catalysts for transformation. You understand that theoretical knowledge remains potential energy until synthesized internally."
        });
    } else {
        insights.push({
            title: "Reflective Synthesis",
            text: "You place deep value on contemplation and mental processing as essential precursors to meaningful personal evolution."
        });
    }

    if (a6 === 0 || a6 === 2) {
        insights.push({
            title: "Expansive View of Love",
            text: "You perceive genuine love not as a cage of obligation, but as an empowering foundation that grants freedom while fostering profound connection."
        });
    } else {
        insights.push({
            title: "Protective Emotional Boundaries",
            text: "You are acutely aware of how attachment can lead to emotional dependency. Maintaining distinct individuality is crucial to your peace of mind."
        });
    }

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
