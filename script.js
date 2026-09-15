/**
 * Mind & Perception Assessment - Script with Google Sheets & Live Leaderboard Integration
 * --------------------------------------------------------------------------------------
 * HOW TO CONNECT TO YOUR OWN GOOGLE SHEET (1 MINUTE SETUP):
 * 1. Create a Google Sheet on Google Drive.
 * 2. Click extensions -> Apps Script.
 * 3. Paste this code into Apps Script:
 * 
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([data.timestamp, data.name, data.archetype, data.score, data.a1, data.a2, data.a3, data.a4, data.a5, data.a6]);
 *      return ContentService.createTextOutput(JSON.stringify({"result": "success"})).setMimeType(ContentService.MimeType.JSON);
 *    }
 * 
 * 4. Click Deploy -> New Deployment -> Select type "Web app".
 * 5. Set "Who has access" to "Anyone".
 * 6. Copy the Web App URL and paste it into GOOGLE_SHEET_WEB_APP_URL below!
 */

// OPTIONAL: Paste your Google Apps Script Web App URL here to auto-sync submissions to Google Sheets
const GOOGLE_SHEET_WEB_APP_URL = ""; 

// Global Quiz State
const state = {
    userName: "",
    currentQuestionIndex: 0,
    answers: {} // Maps question index to selected option index
};

// Default seed participants for the Leaderboard showcase
const defaultParticipants = [
    { name: "Priya Sharma", archetype: "The Conscious Visionary", score: 92, date: "2026-09-15" },
    { name: "David Chen", archetype: "The Centered Strategist", score: 88, date: "2026-09-14" },
    { name: "Sophia Martinez", archetype: "The Intuitive Explorer", score: 85, date: "2026-09-14" },
    { name: "Rohan Verma", archetype: "The Practical Realist", score: 82, date: "2026-09-13" },
    { name: "Ananya Mehta", archetype: "The Balanced Observer", score: 80, date: "2026-09-13" },
    { name: "Marcus Vance", archetype: "The Conscious Visionary", score: 78, date: "2026-09-12" },
    { name: "Emily Watson", archetype: "The Centered Strategist", score: 75, date: "2026-09-11" },
    { name: "Kabir Nair", archetype: "The Intuitive Explorer", score: 72, date: "2026-09-10" }
];

// Quiz Questions & Options Data
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
    
    // Seed initial leaderboard storage if empty
    if (!localStorage.getItem("mind_spectrum_participants")) {
        localStorage.setItem("mind_spectrum_participants", JSON.stringify(defaultParticipants));
    }
    
    renderWelcomeLeaderboard();
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
 * Toggle Welcome Screen Leaderboard Box
 */
function toggleWelcomeLeaderboard() {
    const box = document.getElementById("welcome-leaderboard-box");
    if (!box) return;
    box.classList.toggle("hidden");
    if (!box.classList.contains("hidden")) {
        renderWelcomeLeaderboard();
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
 * Calculate Archetype, Dimensions, Save Participant & Render Results
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
    if (a1 === 0) intentScore += 25;
    else if (a1 === 1) intentScore += 15;
    else if (a1 === 3) intentScore += 10;

    if (a2 === 0) intentScore += 25;
    else if (a2 === 1) intentScore += 20;
    else if (a2 === 2) intentScore += 10;

    // Dimension 2: Clarity & Mental Peace (Q3)
    let clarityScore = 50;
    if (a3 === 2) clarityScore = 95;
    else if (a3 === 3) clarityScore = 75;
    else if (a3 === 1) clarityScore = 55;
    else if (a3 === 0) clarityScore = 40;

    // Dimension 3: Action & Growth Philosophy (Q4)
    let actionScore = 50;
    if (a4 === 3) actionScore = 95;
    else if (a4 === 2) actionScore = 85;
    else if (a4 === 1) actionScore = 70;
    else if (a4 === 0) actionScore = 50;

    // Dimension 4: Emotional Autonomy & Love (Q5 & Q6)
    let loveScore = 50;
    if (a5 === 2) loveScore += 25;
    else if (a5 === 3) loveScore += 20;
    else if (a5 === 1) loveScore += 10;

    if (a6 === 0) loveScore += 25;
    else if (a6 === 2) loveScore += 25;
    else if (a6 === 3) loveScore += 20;

    // Calculate Overall Awareness Index
    const overallScore = Math.round((intentScore + clarityScore + actionScore + loveScore) / 4);

    // 2. Evaluate Archetype
    const archetype = determineArchetype(a1, a2, a3, a4, a5, a6, intentScore, clarityScore, actionScore, loveScore);

    // 3. Save Participant Record to Local Storage & Google Sheets
    saveParticipantRecord(state.userName, archetype.title, overallScore, a1, a2, a3, a4, a5, a6);

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

    // Render Top 10 Leaderboard Table
    renderResultsLeaderboard(state.userName);

    // Render Answers Summary List
    renderAnswersSummary();

    // Show Results View
    switchView("results-view");
}

/**
 * Save Participant Record to Local Database & Google Sheets Webhook
 */
function saveParticipantRecord(name, archetypeTitle, score, a1, a2, a3, a4, a5, a6) {
    const today = new Date().toISOString().split("T")[0];
    const newRecord = {
        name: name,
        archetype: archetypeTitle,
        score: score,
        date: today,
        answers: [a1, a2, a3, a4, a5, a6]
    };

    // 1. Save to Local Storage Database
    let participants = [];
    try {
        const stored = localStorage.getItem("mind_spectrum_participants");
        if (stored) participants = JSON.parse(stored);
    } catch (e) {
        participants = defaultParticipants;
    }

    // Append new participant
    participants.push(newRecord);
    localStorage.setItem("mind_spectrum_participants", JSON.stringify(participants));

    // 2. If Google Sheet Web App URL is provided, send payload to Google Sheet
    if (GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.trim().length > 0) {
        try {
            fetch(GOOGLE_SHEET_WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp: new Date().toLocaleString(),
                    name: name,
                    archetype: archetypeTitle,
                    score: score + "%",
                    a1: quizData[0].options[a1] || "",
                    a2: quizData[1].options[a2] || "",
                    a3: quizData[2].options[a3] || "",
                    a4: quizData[3].options[a4] || "",
                    a5: quizData[4].options[a5] || "",
                    a6: quizData[5].options[a6] || ""
                })
            }).catch(err => console.log("Google Sheet sync notice:", err));
        } catch (e) {
            console.log("Sheet push skipped.");
        }
    }
}

/**
 * Fetch and Sort Top 10 Participants
 */
function getTop10Participants() {
    let participants = [];
    try {
        const stored = localStorage.getItem("mind_spectrum_participants");
        if (stored) participants = JSON.parse(stored);
    } catch (e) {
        participants = defaultParticipants;
    }

    if (!participants || participants.length === 0) {
        participants = defaultParticipants;
    }

    // Sort by Score descending
    participants.sort((a, b) => b.score - a.score);

    // Return Top 10
    return participants.slice(0, 10);
}

/**
 * Render Top 10 Leaderboard in Results View
 */
function renderResultsLeaderboard(currentUserName) {
    const tbody = document.getElementById("results-lb-tbody");
    if (!tbody) return;

    const top10 = getTop10Participants();
    tbody.innerHTML = "";

    top10.forEach((item, index) => {
        const rank = index + 1;
        const tr = document.createElement("tr");

        if (currentUserName && item.name.toLowerCase() === currentUserName.toLowerCase()) {
            tr.className = "current-user-row";
        }

        let rankClass = "rank-other";
        if (rank === 1) rankClass = "rank-1";
        else if (rank === 2) rankClass = "rank-2";
        else if (rank === 3) rankClass = "rank-3";

        tr.innerHTML = `
            <td><span class="rank-badge ${rankClass}">#${rank}</span></td>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>${escapeHtml(item.archetype)}</td>
            <td><span class="metric-score">${item.score}%</span></td>
            <td><span style="color: var(--text-muted); font-size: 0.8rem;">${escapeHtml(item.date)}</span></td>
        `;

        tbody.appendChild(tr);
    });
}

/**
 * Render Preview Leaderboard in Welcome Screen
 */
function renderWelcomeLeaderboard() {
    const container = document.getElementById("welcome-lb-list");
    if (!container) return;

    const top10 = getTop10Participants().slice(0, 5); // Show top 5 in preview
    container.innerHTML = "";

    top10.forEach((item, index) => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifySpaceBetween = "space-between";
        div.style.alignItems = "center";
        div.style.padding = "6px 0";
        div.style.fontSize = "0.85rem";
        div.style.borderBottom = "1px solid var(--border-color)";

        div.innerHTML = `
            <div><strong>#${index + 1} ${escapeHtml(item.name)}</strong> <span style="color:var(--text-muted);">(${escapeHtml(item.archetype)})</span></div>
            <div style="font-weight:700; color:var(--primary);">${item.score}%</div>
        `;
        container.appendChild(div);
    });
}

/**
 * Export All Participants to CSV / Excel File
 */
function exportParticipantsToCSV() {
    let participants = [];
    try {
        const stored = localStorage.getItem("mind_spectrum_participants");
        if (stored) participants = JSON.parse(stored);
    } catch (e) {
        participants = defaultParticipants;
    }

    if (!participants || participants.length === 0) {
        alert("No participant records found to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Participant Name,Mindset Archetype,Awareness Score %,Date\n";

    // Sort by score
    participants.sort((a, b) => b.score - a.score);

    participants.forEach((item, idx) => {
        const row = [
            idx + 1,
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.archetype.replace(/"/g, '""')}"`,
            `${item.score}%`,
            `"${item.date}"`
        ];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MindSpectrum_Top_Participants_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        inputName.value = state.userName;
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
