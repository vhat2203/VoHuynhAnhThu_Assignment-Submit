// js/app.js
// Core quiz flow + Timer + Scoring + Results Screen.
//
// NOTE: Gamification features (streak bonus, leaderboard, difficulty,
// animations, sound) are intentionally NOT implemented yet.

(function () {
  "use strict";

  // ---- DOM references — the ONE status bar's elements live here ----------
  const questionEl = document.getElementById("question-text");
  const optionsEl = document.getElementById("options-container");
  const progressEl = document.getElementById("progress-indicator");
  const scoreEl = document.getElementById("score-indicator");
  const timerTextEl = document.getElementById("timer-text");
  const timerBarEl = document.getElementById("timer-bar");
  const quizCardEl = document.getElementById("quiz-card");
  const completionEl = document.getElementById("completion-screen");
  const resultScoreEl = document.getElementById("result-score");
  const resultAccuracyEl = document.getElementById("result-accuracy");
  const resultTimeEl = document.getElementById("result-time");
  const resultStatsEl = document.getElementById("result-stats");
  const endingContentEl = document.getElementById("ending-content");
  const endingDialogueContainerEl = document.getElementById("ending-dialogue-container");
  const endingNextBtn = document.getElementById("ending-next-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const homeBtn = document.getElementById("home-btn");
  const homeScreenEl = document.getElementById("home-screen");
  const homeStartBtn = document.getElementById("home-start-btn");
  const muteToggleBtn = document.getElementById("mute-toggle");
  const introScreenEl = document.getElementById("intro-screen");
  const introStepContentEl = document.getElementById("intro-step-content");
  const introPreviousBtn = document.getElementById("intro-previous-btn");
  const introNextBtn = document.getElementById("intro-next-btn");
  const graycatRacerEl = document.getElementById("graycat-racer");
  const gingercatRacerEl = document.getElementById("gingercat-racer");
  const mascotImageEl = document.getElementById("mascot-image");
  const mascotSpeechEl = document.getElementById("mascot-speech");

  // ---- Intro Screen: Visual Novel Cutscene State Machine -----------------
  const BUBBLE_CLASSES =
    "w-fit max-w-[60vw] bg-slate-300 border-4 border-black shadow-[6px_6px_0_0_#000] p-12 text-[clamp(1.2rem,2.5vw,2.5rem)] text-left leading-loose rounded-none";

  let currentIntroStep = 0;

  const INTRO_STEPS = [
    {
      buttonLabel: "Next ➔",
      html: `
        <div class="flex flex-row items-center gap-16 w-full">
          <img src="assets/gingercat.png" alt="Ginger Cat" class="w-80 h-80 object-contain shrink-0" />
          <div class="${BUBBLE_CLASSES}">
            Hôm nay là sinh nhật mình! Không biết có ai nhớ không&nbsp;ta...
          </div>
        </div>
      `,
    },
    {
      buttonLabel: "Next ➔",
      html: `
        <div class="flex flex-row items-center gap-16 w-full">
          <img src="assets/graycat.png" alt="Gray Cat" class="w-80 h-80 object-contain shrink-0" />
          <div class="${BUBBLE_CLASSES}">
            Suỵt, mình đang tạo bất ngờ cho Mèo Cam.
          </div>
        </div>
      `,
    },
    {
      buttonLabel: "Next ➔",
      html: `
        <div class="flex flex-row items-center gap-16 w-full">
          <img src="assets/graycat.png" alt="Gray Cat" class="w-80 h-80 object-contain shrink-0" />
          <div class="${BUBBLE_CLASSES}">
            Game Rules: You have 15 seconds for each question. A correct answer moves Gray Cat one house forward toward home. An incorrect answer or timeout lets Ginger Cat move closer. Score 80% or higher to unlock the Happy Ending; below 80% leads to the Sad Ending.
          </div>
        </div>
      `,
    },
    {
      buttonLabel: "Start Game",
      html: `
        <div class="flex flex-row items-center justify-between w-full gap-8 px-12">
          <img src="assets/graycat.png" alt="Gray Cat" class="w-80 h-80 object-contain shrink-0" />
          <div class="${BUBBLE_CLASSES}">
            Mình và Mèo Cam rất mong chờ đến buổi tiệc sinh nhật này. Hãy cùng trả lời đúng các câu hỏi để giúp mình mang chiếc bánh cá hồi mà Mèo Cam yêu thích về nhà trước khi Mèo Cam phát hiện nhé!
          </div>
          <img src="assets/salmoncake.png" alt="Salmon cake" class="w-80 h-80 object-contain shrink-0" />
        </div>
      `,
    },
  ];

  function renderIntroStep() {
    const step = INTRO_STEPS[currentIntroStep];
    introStepContentEl.innerHTML = step.html;
    introPreviousBtn.classList.toggle("hidden", currentIntroStep === 0);
    introNextBtn.textContent = step.buttonLabel;
  }

  function handleIntroNextClick() {
    if (currentIntroStep < INTRO_STEPS.length - 1) {
      currentIntroStep += 1;
      renderIntroStep();
    } else {
      startQuiz();
    }
  }

  function handleIntroPreviousClick() {
    if (currentIntroStep > 0) {
      currentIntroStep -= 1;
      renderIntroStep();
    }
  }

  // ---- Config ---------------------------------------------------------------
  const TIME_LIMIT_SECONDS = 15;
  const TOTAL_QUESTIONS = questions.length;

  // Base classes applied to every freshly-rendered answer button. Kept as an
  // array so we can reliably remove exactly these classes later without
  // guessing at what's on the element.
  const OPTION_BASE_CLASSES = [
    "w-full",
    "text-left",
    "p-4",
    "font-pixel",
    "text-xl",
    "leading-relaxed",
    "break-words",
    "flex",
    "items-center",
    "border-4",
    "border-black",
    "shadow-[4px_4px_0_0_#000]",
    "bg-white",
    "hover:bg-indigo-50",
    "active:scale-[0.99]",
    "transition-colors",
    "duration-150",
    "font-medium",
    "text-slate-800",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-indigo-400",
  ];

  const OPTION_CORRECT_CLASSES = ["bg-green-500", "text-white", "border-green-500"];
  const OPTION_INCORRECT_CLASSES = ["bg-red-500", "text-white", "border-red-500"];

  // ---- State ---------------------------------------------------------------
  const state = {
    currentIndex: 0,
    answers: [], // { questionIndex, selected, correct, timedOut }
    score: 0,
    graycatProgress: 0,
    gingercatProgress: 0,
    isAdvancing: false, // guards against double-click/double-advance/double-timeout
    startTime: null, // Date.now() when the quiz (re)starts
  };

  // Timer-specific state, kept separate so it's obvious what startTimer/clearTimer touch.
  const timerState = {
    intervalId: null,
    timeLeft: TIME_LIMIT_SECONDS,
  };

  let currentEndingStep = 0;
  let currentSadEndingStep = 0;
  let endingBranch = "happy";
  let endingRevealTimeoutId = null;
  let confettiIntervalId = null;
  let endingDialogueToken = 0;
  let audioMode = "idle";

  // ---- Timer -----------------------------------------------------------
  // CRITICAL: always clear any existing interval before starting a new one.
  // Without this, re-rendering a question (or a race between click + tick)
  // can leave two intervals running, which halves the visible countdown time.
  function clearTimer() {
    if (timerState.intervalId !== null) {
      window.clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
  }

  function updateTimerUI() {
    timerTextEl.textContent = `${timerState.timeLeft}s`;
    const pct = (timerState.timeLeft / TIME_LIMIT_SECONDS) * 100;
    timerBarEl.style.width = `${pct}%`;

    if (timerState.timeLeft <= 5) {
      timerBarEl.classList.remove("bg-indigo-500");
      timerBarEl.classList.add("bg-red-500");
    } else {
      timerBarEl.classList.remove("bg-red-500");
      timerBarEl.classList.add("bg-indigo-500");
    }
  }

  function startTimer() {
    clearTimer();

    timerState.timeLeft = TIME_LIMIT_SECONDS;
    updateTimerUI();

    timerState.intervalId = window.setInterval(() => {
      timerState.timeLeft -= 1;
      updateTimerUI();

      if (timerState.timeLeft <= 0) {
        clearTimer();
        handleTimeout();
      }
    }, 1000);
  }

  // ---- Scoring -----------------------------------------------------------
  function updateScoreUI() {
    scoreEl.textContent = `Score: ${state.score}`;
  }

  function updateRacingMap(isCorrect) {
    const progressKey = isCorrect ? "graycatProgress" : "gingercatProgress";
    state[progressKey] = Math.min(88, state[progressKey] + 10);

    graycatRacerEl.style.left = `${state.graycatProgress}%`;
    gingercatRacerEl.style.left = `${state.gingercatProgress}%`;
  }

  function resetRacingMap() {
    state.graycatProgress = 0;
    state.gingercatProgress = 0;
    graycatRacerEl.style.left = "0%";
    gingercatRacerEl.style.left = "0%";
  }

  function updateMascotState(feedbackState) {
    mascotImageEl.classList.remove("bounce", "shake");

    if (feedbackState === "correct") {
      mascotImageEl.src = "assets/graycat_happystatus.png";
      mascotImageEl.alt = "Gray Cat celebrating";
      mascotSpeechEl.textContent = "Great! Let's move forward!";
      mascotImageEl.classList.add("bounce");
    } else if (feedbackState === "incorrect") {
      mascotImageEl.src = "assets/graycat_sadstatus.png";
      mascotImageEl.alt = "Gray Cat disappointed";
      mascotSpeechEl.textContent = "Oh no! Ginger Cat is getting closer to home!";
      mascotImageEl.classList.add("shake");
    } else {
      mascotImageEl.src = "assets/graycat.png";
      mascotImageEl.alt = "Gray Cat status";
      mascotSpeechEl.textContent = "Ready to race home!";
    }
  }

  // ---- Rendering -------------------------------------------------------
  function renderQuestion() {
    const q = questions[state.currentIndex];

    document.body.classList.remove("is-loading");
    updateMascotState("idle");
    progressEl.textContent = `Question ${state.currentIndex + 1} of ${TOTAL_QUESTIONS}`;
    questionEl.textContent = q.question;

    optionsEl.innerHTML = "";

    q.options.forEach((optionText) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = optionText;
      btn.classList.add(...OPTION_BASE_CLASSES);
      btn.addEventListener("click", () => handleAnswerClick(optionText, btn));
      optionsEl.appendChild(btn);
    });

    startTimer();
  }

  function finishAnswer(selectedOption, clickedBtn, timedOut = false) {
    if (state.isAdvancing) return;
    state.isAdvancing = true;
    document.body.classList.add("is-loading");

    const q = questions[state.currentIndex];
    const isCorrect = !timedOut && selectedOption === q.correctAnswer;

    // Disable controls and stop the active countdown immediately.
    disableAllOptions();
    clearTimer();

    if (clickedBtn) {
      clickedBtn.classList.remove(
        "bg-white",
        "border-slate-300",
        "text-slate-800",
        "hover:bg-indigo-50",
        "hover:border-indigo-400"
      );
      clickedBtn.classList.add(...(isCorrect ? OPTION_CORRECT_CLASSES : OPTION_INCORRECT_CLASSES));
    }

    // Update score first, then the map, then mascot feedback.
    state.score += isCorrect ? 1 : 0;
    updateScoreUI();

    updateRacingMap(isCorrect);
    updateMascotState(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      audioPlayer.playCorrect();
    } else {
      audioPlayer.playWrong();
    }

    state.answers.push({
      questionIndex: state.currentIndex,
      selected: timedOut ? null : selectedOption,
      correct: isCorrect,
      timedOut,
    });

    window.setTimeout(advance, 1500);
  }

  function handleAnswerClick(selectedOption, clickedBtn) {
    finishAnswer(selectedOption, clickedBtn);
  }

  function handleTimeout() {
    if (state.isAdvancing) return;
    timerTextEl.textContent = "Time's up!";
    finishAnswer(null, null, true);
  }

  function disableAllOptions() {
    Array.from(optionsEl.children).forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("opacity-70", "cursor-not-allowed");
    });
  }

  function advance() {
    state.isAdvancing = false;

    if (state.currentIndex < TOTAL_QUESTIONS - 1) {
      state.currentIndex += 1;
      renderQuestion();
    } else {
      clearTimer();
      showResultsScreen();
    }
  }

  // ---- Results Screen -----------------------------------------------------
  function showResultsScreen() {
    const elapsedMs = Date.now() - state.startTime;
    const elapsedSeconds = Math.round(elapsedMs / 1000);
    const accuracy = Math.round((state.score / TOTAL_QUESTIONS) * 100);

    resultScoreEl.textContent = `${state.score}/${TOTAL_QUESTIONS}`;
    resultAccuracyEl.textContent = `${accuracy}%`;
    resultTimeEl.textContent = `${elapsedSeconds}s`;

    quizCardEl.classList.add("hidden");
    completionEl.classList.remove("hidden");

    endingBranch = accuracy >= 80 ? "happy" : "sad";
    audioMode = "dialogue";
    currentEndingStep = 0;
    currentSadEndingStep = 0;
    renderEndingScreen();
  }

  function clearEndingEffects() {
    endingDialogueToken += 1;

    if (endingRevealTimeoutId !== null) {
      window.clearTimeout(endingRevealTimeoutId);
      endingRevealTimeoutId = null;
    }

    if (confettiIntervalId !== null) {
      window.clearInterval(confettiIntervalId);
      confettiIntervalId = null;
    }
  }

  const happyEndingMessages = [
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "I'm finally home... Huh? Why is the house completely dark?",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Surprise!!! Happy birthday, Ginger Cat! Hurry up and turn on the lights!",
    },
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "Oh my gosh, I thought you were too busy and had completely forgotten! Thank you so much!",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "How could I ever forget? I prepared a gigantic birthday cake for you. Come on, let's eat!",
    },
  ];

  const sadEndingMessages = [
    {
      character: "ginger",
      image: "assets/gingercat._annoyed.png",
      text: "The traffic was so bad today... I'm exhausted...",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Ginger Cat... I'm sorry. I ran out to buy a birthday cake, but I didn't make it back in time to celebrate your birthday...",
    },
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "It's okay, silly. The fact that you remembered my birthday already makes me happy. That's all I need.",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Hmm...",
    },
  ];

  function startCelebrationConfetti() {
    if (typeof confetti !== "function") return;

    const burst = () => {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
    };

    burst();
    confettiIntervalId = window.setInterval(burst, 1800);
  }

  function updateResultButtons({ showNext, showPlayAgain, showHome }) {
    endingNextBtn.classList.toggle("hidden", !showNext);
    playAgainBtn.classList.toggle("hidden", !showPlayAgain);
    homeBtn.classList.toggle("hidden", !showHome);
  }

  function renderEndingDialogue(messages) {
    const token = endingDialogueToken + 1;
    endingDialogueToken = token;
    endingDialogueContainerEl.innerHTML = "";
    audioPlayer.stopBgm();
    endingDialogueContainerEl.classList.remove("hidden");
    endingContentEl.classList.add("hidden");
    resultStatsEl.classList.add("hidden");
    updateResultButtons({ showNext: true, showPlayAgain: false, showHome: false });
    endingNextBtn.disabled = true;
    endingNextBtn.classList.add("opacity-50", "cursor-not-allowed");
    document.body.classList.add("is-loading");

    const appendMessage = (messageIndex) => {
      if (token !== endingDialogueToken) return;

      const message = messages[messageIndex];
      const row = document.createElement("div");
      row.className = `ending-message-in flex ${message.character === "gray" ? "flex-row-reverse" : "flex-row"} items-center gap-4 w-full`;
      row.innerHTML = `
        <img src="${message.image}" alt="${message.character === "gray" ? "Gray Cat" : "Ginger Cat"}" class="w-24 h-24 object-contain shrink-0" />
        <div class="flex-1 min-w-0 bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-6 text-2xl leading-relaxed text-left text-slate-800">
          ${message.text}
        </div>
      `;
      endingDialogueContainerEl.appendChild(row);
      audioPlayer.playMessage();

      if (messageIndex === messages.length - 1) {
        endingNextBtn.disabled = false;
        endingNextBtn.classList.remove("opacity-50", "cursor-not-allowed", "hidden");
        document.body.classList.remove("is-loading");
        endingRevealTimeoutId = null;
        return;
      }

      endingRevealTimeoutId = window.setTimeout(() => appendMessage(messageIndex + 1), 1000);
    };

    appendMessage(0);
  }

  function showSadEnding() {
    endingNextBtn.textContent = "Next";

    if (currentSadEndingStep === 0) {
      renderEndingDialogue(sadEndingMessages);
      return;
    }

    endingDialogueContainerEl.classList.add("hidden");
    endingContentEl.classList.remove("hidden");
    document.body.classList.remove("is-loading");
    resultStatsEl.classList.remove("hidden");
    updateResultButtons({ showNext: false, showPlayAgain: true, showHome: true });
    endingContentEl.innerHTML = `
      <div class="ending-message-in flex flex-col items-center gap-6 text-center">
        <img src="assets/graycat_sadstatus.png" alt="Sad Gray Cat" class="w-80 h-80 max-w-full object-contain" />
        <div class="bg-white border-4 border-black shadow-[6px_6px_0_0_#000] p-8 text-3xl leading-relaxed text-slate-800">
          Even though Ginger Cat says it's okay, I still feel really sad...
        </div>
      </div>
    `;
    audioMode = "sad";
    audioPlayer.playEndingMusic("sad");
  }

  function renderEndingScreen() {
    clearEndingEffects();
    endingNextBtn.disabled = false;
    endingNextBtn.classList.remove("opacity-50", "cursor-not-allowed");

    if (endingBranch === "sad") {
      showSadEnding();
      return;
    }

    if (currentEndingStep === 0) {
      renderEndingDialogue(happyEndingMessages);
    } else if (currentEndingStep === 1) {
      endingDialogueContainerEl.classList.add("hidden");
      endingContentEl.classList.remove("hidden");
      resultStatsEl.classList.remove("hidden");
      updateResultButtons({ showNext: true, showPlayAgain: false, showHome: false });
      endingNextBtn.textContent = "Next";
      document.body.classList.remove("is-loading");
      endingContentEl.innerHTML = `
        <div class="ending-message-in flex flex-col items-center gap-6 text-center">
          <div class="flex items-center justify-center gap-8">
            <img src="assets/gingercat_happy.png" alt="Happy Ginger Cat" class="w-48 h-48 object-contain" />
            <img src="assets/graycat_happystatus.png" alt="Happy Gray Cat" class="w-48 h-48 object-contain" />
          </div>
          <div class="bg-white border-4 border-black shadow-[6px_6px_0_0_#000] p-8 text-3xl leading-relaxed text-slate-800">
            Thank you for helping us! You made this birthday surprise extra special!
          </div>
        </div>
      `;
      audioMode = "happy";
      audioPlayer.playEndingMusic("happy");
    } else {
      endingDialogueContainerEl.classList.add("hidden");
      endingContentEl.classList.remove("hidden");
      resultStatsEl.classList.remove("hidden");
      updateResultButtons({ showNext: false, showPlayAgain: true, showHome: true });
      endingContentEl.innerHTML = `
        <div class="ending-message-in flex flex-col items-center gap-6 text-center">
          <img src="assets/together.png" alt="Ginger Cat and Gray Cat celebrating together" class="w-full max-w-5xl max-h-[65vh] object-contain" />
          <div class="font-pixel text-3xl text-pink-600">Happy Birthday!</div>
        </div>
      `;
      document.body.classList.remove("is-loading");
      startCelebrationConfetti();
    }
  }

  function handleEndingNextClick() {
    if (endingNextBtn.disabled) return;
    if (endingBranch === "sad") {
      if (currentSadEndingStep === 0) {
        currentSadEndingStep = 1;
        renderEndingScreen();
      }
      return;
    }
    if (currentEndingStep < 2) {
      currentEndingStep += 1;
      renderEndingScreen();
    }
  }

  // ---- Reset / Play Again --------------------------------------------------
  function resetQuiz(returnToHome = false) {
    clearTimer();
    clearEndingEffects();
    document.body.classList.remove("is-loading");
    audioPlayer.stopAll();
    audioMode = returnToHome ? "home" : "intro";

    state.currentIndex = 0;
    state.answers = [];
    state.score = 0;
    resetRacingMap();
    state.isAdvancing = false;
    state.startTime = Date.now();
    currentIntroStep = 0;
    currentEndingStep = 0;
    currentSadEndingStep = 0;
    endingBranch = "happy";

    updateScoreUI();

    completionEl.classList.add("hidden");
    homeScreenEl.classList.toggle("hidden", !returnToHome);
    introScreenEl.classList.toggle("hidden", returnToHome);
    quizCardEl.classList.add("hidden");
    renderIntroStep();
    audioPlayer.startBgm();
  }

  function startQuiz() {
    homeScreenEl.classList.add("hidden");
    introScreenEl.classList.add("hidden");
    quizCardEl.classList.remove("hidden");

    audioMode = "quiz";
    audioPlayer.startBgm();
    state.startTime = Date.now();
    renderQuestion();
  }

  function showIntroScreen() {
    clearEndingEffects();
    homeScreenEl.classList.add("hidden");
    introScreenEl.classList.remove("hidden");
    quizCardEl.classList.add("hidden");
    completionEl.classList.add("hidden");
    currentIntroStep = 0;
    renderIntroStep();
    audioMode = "intro";
    audioPlayer.startBgm();
  }

  // ---- Init ---------------------------------------------------------------
  function init() {
    if (!Array.isArray(questions) || questions.length !== 10) {
      questionEl.textContent = "Error: questions dataset must contain exactly 10 questions.";
      return;
    }

    playAgainBtn.addEventListener("click", () => resetQuiz());
    homeBtn.addEventListener("click", () => resetQuiz(true));
    homeStartBtn.addEventListener("click", showIntroScreen);
    endingNextBtn.addEventListener("click", handleEndingNextClick);
    introPreviousBtn.addEventListener("click", handleIntroPreviousClick);
    introNextBtn.addEventListener("click", handleIntroNextClick);
    document.addEventListener("click", (event) => {
      if (event.target.closest("button") && event.target !== muteToggleBtn) {
        audioPlayer.playClick();
      }
    });
    muteToggleBtn.addEventListener("click", () => {
      const muted = audioPlayer.toggleMute();
      muteToggleBtn.textContent = muted ? "Sound Off" : "Sound On";
      muteToggleBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
      if (!muted) {
        if (audioMode === "home" || audioMode === "intro") audioPlayer.startBgm();
        if (audioMode === "quiz") audioPlayer.startBgm();
        if (audioMode === "happy" || audioMode === "sad") audioPlayer.playEndingMusic(audioMode);
      }
    });

    updateScoreUI();
    renderIntroStep();
    audioMode = "home";
    audioPlayer.startBgm();
  }

  document.addEventListener("DOMContentLoaded", init);

  window.addEventListener("beforeunload", () => {
    clearTimer();
    clearEndingEffects();
  });
})();