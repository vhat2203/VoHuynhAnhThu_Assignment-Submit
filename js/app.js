// js/app.js
// Core quiz flow + Timer + Scoring + Results Screen với văn phong hội thoại chuẩn xác.

(function () {
  "use strict";

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
  
  // Settings Modal elements
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings-btn");
  const toggleBgmBtn = document.getElementById("toggle-bgm");
  const toggleSfxBtn = document.getElementById("toggle-sfx");

  const introScreenEl = document.getElementById("intro-screen");
  const introStepContentEl = document.getElementById("intro-step-content");
  const introPreviousBtn = document.getElementById("intro-previous-btn");
  const introNextBtn = document.getElementById("intro-next-btn");
  const graycatRacerEl = document.getElementById("graycat-racer");
  const gingercatRacerEl = document.getElementById("gingercat-racer");
  const mascotImageEl = document.getElementById("mascot-image");
  const mascotSpeechEl = document.getElementById("mascot-speech");

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
            Suỵt, mình đang chuẩn bị một bất ngờ thật cho Mèo Cam nè.
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
            Luật chơi nè: Bạn có 15 giây cho mỗi câu hỏi. Trả lời đúng thì mình sẽ tiến về nhà 1 bước, còn trả lời sai hoặc hết giờ thì Mèo Cam sẽ tiến lại gần hơn. Đạt từ 80% điểm trở lên để mở khóa Happy Ending nhé!
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
            Mình và Mèo Cam rất mong chờ bữa tiệc này, tụi mình phải thật tập trung để mang chiếc bánh cá hồi yêu thích về kịp lúc mừng sinh nhật Mèo Cam nha!
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

  const TIME_LIMIT_SECONDS = 15;
  const TOTAL_QUESTIONS = questions.length;

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

  const state = {
    currentIndex: 0,
    answers: [],
    score: 0,
    graycatProgress: 0,
    gingercatProgress: 0,
    isAdvancing: false,
    startTime: null,
  };

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
  let audioMode = "home";

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
      mascotSpeechEl.textContent = "Tuyệt lắm! Tiến gần về nhà rồi nè!";
      mascotImageEl.classList.add("bounce");
    } else if (feedbackState === "incorrect") {
      mascotImageEl.src = "assets/graycat_sadstatus.png";
      mascotImageEl.alt = "Gray Cat disappointed";
      mascotSpeechEl.textContent = "Hichic, Mèo Cam sắp về tới nhà mất rồi...";
      mascotImageEl.classList.add("shake");
    } else {
      mascotImageEl.src = "assets/graycat.png";
      mascotImageEl.alt = "Gray Cat status";
      mascotSpeechEl.textContent = "Sẵn sàng về nhà chúc mừng sinh nhật Mèo Cam chưa?";
    }
  }

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
    audioPlayer.stopBgm(); // Tắt hoàn toàn nhạc nền trong 4 câu hội thoại
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

  // Văn phong hội thoại Happy Ending (tự nhiên, ngọt ngào, đúng góc độ)
  const happyEndingMessages = [
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "Hôm nay đuối quá chừng... Ủa, sao nhà tối thui không một bóng đèn vậy kìa?",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Ngạc nhiên chưa! Chúc mừng sinh nhật Mèo Cam nha, bật đèn lên lẹ nào!",
    },
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "Hả trời ơi... Mình cứ ngỡ là bận quá nên Mèo Xám quên béng mất rồi chứ. Hạnh phúc xỉu luôn á!",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Quà sinh nhật với bánh cá hồi chuẩn bị sẵn sàng hết rồi nè, qua đây ăn bánh cùng mình mau lên!",
    },
  ];

  // Văn phong hội thoại Sad Ending (tự nhiên, thấu hiểu, ấm áp)
  const sadEndingMessages = [
    {
      character: "ginger",
      image: "assets/gingercat._annoyed.png",
      text: "Hôm nay đường xá đông đúc mệt lử luôn á...",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Mèo Cam ơi, mình xin lỗi nha... Loay hoay chuẩn bị bánh trái mà cuối cùng lại về trễ mất tiệc sinh nhật của Mèo Cam rồi...",
    },
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "Trời ơi, có nhớ tới nhau là vui lắm rồi, đâu cần phải tự trách thế đâu.",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Ừm...",
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
      audioPlayer.playMessage(); // Tiếng pop tin nhắn khi hiện từng câu

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
          Dù Mèo Cam bảo không sao, nhưng mình vẫn thấy buồn vì lỡ mất khoảnh khắc vui vẻ...
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
            Cảm ơn bạn vì đã luôn đồng hành và mang đến thật nhiều tiếng cười nhé!
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
          <div class="font-pixel text-3xl text-pink-600">Happy Birthday Mèo Cam!</div>
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
    audioPlayer.startBgm(returnToHome ? "home" : "intro");
  }

  function startQuiz() {
    homeScreenEl.classList.add("hidden");
    introScreenEl.classList.add("hidden");
    quizCardEl.classList.remove("hidden");

    audioMode = "quiz";
    audioPlayer.startBgm("quiz");
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
    audioPlayer.startBgm("intro");
  }

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

    menuToggleBtn.addEventListener("click", () => {
      settingsModal.classList.remove("hidden");
    });

    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("hidden");
    });

    toggleBgmBtn.addEventListener("click", () => {
      const enabled = audioPlayer.toggleBgm();
      toggleBgmBtn.textContent = enabled ? "ON" : "OFF";
      toggleBgmBtn.className = `font-pixel px-4 py-2 text-xs border-2 border-black shadow-[2px_2px_0_0_#000] ${enabled ? "bg-emerald-400 text-black" : "bg-slate-300 text-slate-600"}`;
    });

    toggleSfxBtn.addEventListener("click", () => {
      const enabled = audioPlayer.toggleSfx();
      toggleSfxBtn.textContent = enabled ? "ON" : "OFF";
      toggleSfxBtn.className = `font-pixel px-4 py-2 text-xs border-2 border-black shadow-[2px_2px_0_0_#000] ${enabled ? "bg-emerald-400 text-black" : "bg-slate-300 text-slate-600"}`;
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("button") && event.target !== menuToggleBtn && !settingsModal.contains(event.target)) {
        audioPlayer.playClick();
      }
    });

    updateScoreUI();
    renderIntroStep();
    audioMode = "home";
    audioPlayer.startBgm("home");
  }

  document.addEventListener("DOMContentLoaded", init);

  window.addEventListener("beforeunload", () => {
    clearTimer();
    clearEndingEffects();
  });
})();