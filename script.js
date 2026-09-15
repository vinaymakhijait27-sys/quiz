/**
 * Mind & Perception Assessment - Script
 * High-performance, clean JavaScript logic for state management,
 * assessment scoring, archetype evaluation, and dynamic UI transitions.
 */

// Global State
const state = {
    userName: "",
    currentQuestionIndex: 0,
    answers: {} // Maps question index to selected option index
};

// Quiz Questions & Options Data (Exactly as specified)
const quizData = [
    {
        id: 1,
        question: "Do you think our thoughts and words can influence the world around us?",
        options: [
            "Yes, the mind has a powerful influence",
            "Maybe, but I’m not sure",
            "No, only physical factors matter",
            "I need more evidence"
        ]
    },
    {
        id: 2,
        question: "What do you think about the claim that positive words create more beautiful water-crystal patterns?",
        options: [
            "I find it fascinating",
            "There could be something to it",
            "Interesting, but needs scientific proof",
            "I don’t believe it"
        ]
    },
    {
        id: 3,
        question: "Which state best describes your mind most often?",
        options: [
            "Distracted — constantly jumping between thoughts",
            "Overactive — thinking about everything at once",
            "Clean & Clear — calm, focused and aware",
            "It depends on the situation"
        ]
    },
    {
        id: 4,
        question: "What do you think transforms knowledge into actual change?",
        options: [
            "Knowledge alone",
            "Meditation & reflection",
            "Knowledge + Meditation",
            "Experience & practice"
        ]
    },
    {
        id: 5,
        question: "What does attachment feel like to you?",
        options: [
            "Giving someone control over your emotions",
            "Losing your sense of independence",
            "Feeling deeply connected",
            "Depends on the relationship"
        ]
    },
    {
        id: 6,
        question: "Which statement do you agree with more?",
        options: [
            "Love gives freedom",
            "Attachment creates dependency",
            "Love can have both freedom & attachment",
            "It depends on how you love"
        ]
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
        btnNextText.textContent = "See Full Analysis";
    } else {
        btnNextText.textContent = "Next Question";
    }
}

/**
 * Handle Option Selection
 */
function selectOption(optIdx) {
    state.answers[state.currentQuestionIndex] = optIdx;

    // Re-render options to reflect selection highlight
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

    // Enable next button
    const btnNext = document.getElementById("btn-next");
    btnNext.disabled = false;

    // Optional smooth auto-advance after slight delay if user clicks
    setTimeout(() => {
        if (state.currentQuestionIndex < quizData.length - 1) {
            navigateQuestion(1);
        }
    }, 280);
}

/**
 * Navigate Questions
 */
function navigateQuestion(direction) {
    const newIdx = state.currentQuestionIndex + direction;

    if (newIdx >= quizData.length) {
        // Calculate and Show Results
        calculateAndShowResults();
        return;
    }

    if (newIdx >= 0 && newIdx < quizData.length) {
        state.currentQuestionIndex = newIdx;
        renderQuestion();
    }
}

/**
 * Calculate Archetype, Dimensions & Render Results
 */
function calculateAndShowResults() {
    const nameEl = document.getElementById("user-display-name");
    nameEl.textContent = state.userName || "Friend";

    // Extract raw choices
    const a1 = state.answers[0]; // Q1 Mind Influence
    const a2 = state.answers[1]; // Q2 Water Crystal
    const a3 = state.answers[2]; // Q3 State of Mind
    const a4 = state.answers[3]; // Q4 Knowledge to Change
    const a5 = state.answers[4]; // Q5 Attachment Feeling
    const a6 = state.answers[5]; // Q6 Love & Freedom

    // 1. Calculate Dimension Scores (0 - 100)
    
    // Dimension 1: Mind Power & Intention (Q1 & Q2)
    let intentScore = 50;
    if (a1 === 0) intentScore += 25; // Yes, powerful
    else if (a1 === 1) intentScore += 15; // Maybe
    else if (a1 === 3) intentScore += 10; // Need evidence
    else if (a1 === 2) intentScore += 0;  // Physical only

    if (a2 === 0) intentScore += 25; // Fascinating
    else if (a2 === 1) intentScore += 20; // Something to it
    else if (a2 === 2) intentScore += 10; // Needs proof
    else if (a2 === 3) intentScore += 0;  // Don't believe

    // Dimension 2: Clarity & Mental Peace (Q3)
    let clarityScore = 50;
    if (a3 === 2) clarityScore = 95;      // Clean & Clear
    else if (a3 === 3) clarityScore = 75; // Depends on situation
    else if (a3 === 1) clarityScore = 55; // Overactive
    else if (a3 === 0) clarityScore = 40; // Distracted

    // Dimension 3: Action & Growth Philosophy (Q4)
    let actionScore = 50;
    if (a4 === 3) actionScore = 95;      // Experience & practice
    else if (a4 === 2) actionScore = 85; // Knowledge + Meditation
    else if (a4 === 1) actionScore = 70; // Meditation & reflection
    else if (a4 === 0) actionScore = 50; // Knowledge alone

    // Dimension 4: Emotional Autonomy & Love (Q5 & Q6)
    let loveScore = 50;
    if (a5 === 2) loveScore += 25; // Deeply connected
    else if (a5 === 3) loveScore += 20; // Depends on relationship
    else if (a5 === 1) loveScore += 10; // Losing independence
    else if (a5 === 0) loveScore += 5;  // Giving control

    if (a6 === 0) loveScore += 25; // Love gives freedom
    else if (a6 === 2) loveScore += 25; // Both freedom & attachment
    else if (a6 === 3) loveScore += 20; // Depends how you love
    else if (a6 === 1) loveScore += 10; // Attachment creates dependency

    // 2. Evaluate Archetype
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

    // Render Answers Summary List
    renderAnswersSummary();

    // Show Results View
    switchView("results-view");
}

/**
 * Determine Mindset Archetype
 */
function determineArchetype(a1, a2, a3, a4, a5, a6, intentScore, clarityScore, actionScore, loveScore) {
    if (intentScore >= 75 && clarityScore >= 70) {
        return {
            title: "The Conscious Visionary",
            description: "You possess a profound awareness of the relationship between internal thoughts and external reality. With a clear mind and open perspective, you recognize that true change begins within and transforms outward through experience.",
            intentDesc: "High belief in the power of conscious thought and intentional energy.",
            clarityDesc: "Strong mental clarity with a peaceful, focused internal state.",
            actionDesc: "Grounded in practical execution and mindful integration.",
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
            description: "Calm, focused, and discerning. You maintain a clean mental space and understand that knowledge paired with practice produces meaningful life transformations.",
            intentDesc: "Open-minded yet balanced in evaluating subtle influence.",
            clarityDesc: "Exceptional calm, focus, and heightened situational awareness.",
            actionDesc: "Executes efficiently by turning insight into habitual practice.",
            loveDesc: "Maintains healthy balance between emotional intimacy and independence."
        };
    } else if (a1 <= 1 && a2 <= 1 && (a5 === 2 || a6 === 2 || a6 === 0)) {
        return {
            title: "The Intuitive Explorer",
            description: "Fascinated by the hidden connections in nature and human interaction. You view mind and emotion not as isolated occurrences, but as interconnected currents flowing through life.",
            intentDesc: "High receptivity to subtle intentions, words, and resonance.",
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

    // Insight 1: Perception of Mind & Words
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

    // Insight 2: Mental State & Focus
    if (a3 === 2) {
        insights.push({
            title: "Clean & Centered Focus",
            text: "Your mind operates primarily from a clean and clear baseline. This mental clarity provides you with emotional resilience, keen decision-making capabilities, and peace."
        });
    } else if (a3 === 1) {
        insights.push({
            title: "High Cognitive Speed & Processing",
            text: "Having an overactive mind means you process vast information simultaneously. Channelling this energy through structured reflection can convert mental noise into profound creativity."
        });
    } else if (a3 === 0) {
        insights.push({
            title: "Seeking Mental Stillness",
            text: "Experiencing a distracted mind often signals a need to declutter digital and environmental stimuli. Mindfulness practices will help stabilize your attention."
        });
    } else {
        insights.push({
            title: "Contextual Adaptability",
            text: "Your mental state fluidly adapts to your environment. Harnessing conscious routines can help maintain focus when challenging situations arise."
        });
    }

    // Insight 3: Transformation Strategy
    if (a4 === 3) {
        insights.push({
            title: "Action-Driven Growth Engine",
            text: "You wisely identify direct experience and active practice as the true catalysts for change. You understand that theoretical knowledge remains potential energy until put into motion."
        });
    } else if (a4 === 2) {
        insights.push({
            title: "Holistic Mind-Body Synergy",
            text: "By pairing knowledge with meditation, you bridge the gap between intellectual understanding and deep internal conviction."
        });
    } else {
        insights.push({
            title: "Reflective Synthesis",
            text: "You place deep value on contemplation and mental processing as essential precursors to meaningful personal evolution."
        });
    }

    // Insight 4: Relationship & Autonomy Paradigm
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
 * Render Question & Answer Review List
 */
function renderAnswersSummary() {
    const container = document.getElementById("answers-summary");
    container.innerHTML = "";

    quizData.forEach((item, qIdx) => {
        const selectedOptIdx = state.answers[qIdx];
        const selectedOptText = selectedOptIdx !== undefined ? item.options[selectedOptIdx] : "Not Answered";

        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `
            <div class="summary-q">Q${qIdx + 1}: ${escapeHtml(item.question)}</div>
            <div class="summary-a">${escapeHtml(selectedOptText)}</div>
        `;
        container.appendChild(div);
    });
}

/**
 * Reset Quiz State
 */
function resetQuiz() {
    state.currentQuestionIndex = 0;
    state.answers = {};
    switchView("welcome-view");

    const inputName = document.getElementById("username");
    if (inputName) {
        inputName.value = state.userName; // Keep previous name filled for convenience
        inputName.focus();
    }
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
