// js/app.js
// Core logic trò chơi - Đã fix độc lập khung chat Intro không bị ảnh hưởng bởi màn hình Quiz.

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
  
  const menuToggleBtnFloating = document.getElementById("menu-toggle-btn-floating"); 
  const menuToggleBtnQuiz = document.getElementById("menu-toggle-btn-quiz"); 
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

  // Đã fix: Trả lại đúng tỷ lệ co giãn, giới hạn chiều rộng max-w cho riêng Intro
  const BUBBLE_CLASSES =
    "w-fit max-w-[95vw] md:max-w-[60vw] lg:max-w-[50vw] bg-white border-4 md:border-[6px] border-black shadow-[4px_4px_0_0_#000] md:shadow-[8px_8px_0_0_#000] p-5 md:p-8 font-pixel font-bold text-xl md:text-3xl lg:text-4xl text-slate-800 text-center md:text-left leading-relaxed md:leading-loose";

  let currentIntroStep = 0;

  const INTRO_STEPS = [
    {
      buttonLabel: "Tiếp tục ➔",
      html: `
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full">
          <img src="assets/gingercat.png" alt="Ginger Cat" class="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain shrink-0 drop-shadow-md" />
          <div class="${BUBBLE_CLASSES}">
            Hôm nay là sinh nhật mình! Không biết có ai nhớ không&nbsp;ta...
          </div>
        </div>
      `,
    },
    {
      buttonLabel: "Tiếp tục ➔",
      html: `
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full">
          <img src="assets/graycat.png" alt="Gray Cat" class="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain shrink-0 drop-shadow-md" />
          <div class="${BUBBLE_CLASSES}">
            Suỵt, mình đang chuẩn bị một bất ngờ thật êm đềm cho Mèo Cam nè.
          </div>
        </div>
      `,
    },
    {
      buttonLabel: "Đã rõ ➔",
      html: `
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full">
          <img src="assets/graycat.png" alt="Gray Cat" class="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain shrink-0 hidden md:block drop-shadow-md" />
          <div class="${BUBBLE_CLASSES}">
            Luật chơi nè: Cậu có 15 giây cho mỗi câu hỏi. Trả lời đúng thì mèo xám tiến về nhà 1 bước, còn sai hoặc hết giờ thì Mèo Cam sẽ tiến lại gần. Đạt từ 80% điểm để mở khóa Happy Ending nhé!
          </div>
        </div>
      `,
    },
    {
      buttonLabel: "Bắt đầu thôi!",
      html: `
        <!-- Đã fix: Tối ưu khoảng cách và size ảnh để nhường chỗ cho text hiển thị chiều ngang -->
        <div class="flex flex-col md:flex-row items-center justify-center w-full gap-6 md:gap-10 px-2 md:px-8">
          <div class="flex flex-row gap-4 md:hidden">
            <img src="assets/graycat.png" alt="Gray Cat" class="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
            <img src="assets/salmoncake.png" alt="Salmon cake" class="w-24 h-24 object-contain shrink-0 drop-shadow-md" />
          </div>
          <img src="assets/graycat.png" alt="Gray Cat" class="hidden md:block w-48 h-48 lg:w-64 lg:h-64 object-contain shrink-0 drop-shadow-md" />
          <div class="${BUBBLE_CLASSES}">
            Chuyến này tụi mình phải thật tập trung để mang chiếc bánh cá hồi yêu thích về kịp lúc mừng sinh nhật Mèo Cam nha!
          </div>
          <img src="assets/salmoncake.png" alt="Salmon cake" class="hidden md:block w-48 h-48 lg:w-64 lg:h-64 object-contain shrink-0 drop-shadow-md" />
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
    "h-full", 
    "p-3", 
    "md:p-6",      
    "font-pixel",
    "font-bold",
    "text-xl", 
    "sm:text-2xl",
    "md:text-3xl",  
    "lg:text-4xl",
    "leading-tight",
    "break-words",
    "flex",
    "items-center",
    "justify-center", 
    "text-center",    
    "border-[3px]",
    "md:border-[6px]",
    "border-black",
    "shadow-[4px_4px_0_0_#000]",
    "md:shadow-[8px_8px_0_0_#000]",
    "bg-white",
    "hover:bg-indigo-50",
    "active:translate-y-[4px]", 
    "md:active:translate-y-[8px]", 
    "active:shadow-none",
    "transition-all",
    "duration-100",
    "text-slate-600", 
    "focus:outline-none",
  ];

  const OPTION_CORRECT_CLASSES = ["bg-emerald-400", "text-black", "border-emerald-600"];
  const OPTION_INCORRECT_CLASSES = ["bg-red-400", "text-black", "border-red-600"];

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
    graycatRacerEl.style.left = "0%";
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
        "text-slate-600",
        "hover:bg-indigo-50",
        "shadow-[4px_4px_0_0_#000]",
        "md:shadow-[8px_8px_0_0_#000]"
      );
      clickedBtn.classList.add("translate-y-[4px]", "md:translate-y-[8px]", "shadow-none");
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
    timerTextEl.textContent = "Hết giờ!";
    finishAnswer(null, null, true);
  }

  function disableAllOptions() {
    Array.from(optionsEl.children).forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("opacity-60", "cursor-not-allowed");
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

    menuToggleBtnQuiz.classList.add("hidden"); 
    menuToggleBtnFloating.classList.remove("hidden");
    quizCardEl.classList.add("hidden");
    completionEl.classList.remove("hidden");

    endingBranch = accuracy >= 80 ? "happy" : "sad";
    audioMode = "dialogue";
    audioPlayer.stopBgm();
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
      text: "Hôm nay đuối quá chừng... Ủa, sao nhà tối thui không một bóng đèn vậy kìa ta?",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Bất ngờ chưa anh bạn nhỏ! Chúc mừng sinh nhật Mèo Cam nha, bật đèn lên lẹ nào!",
    },
    {
      character: "ginger",
      image: "assets/gingercat_icon.png",
      text: "Hả trời ơi... Anh cứ ngỡ bận quá nên quên béng mất rồi chứ bộ. Hạnh phúc xỉu luôn á!",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Quà sinh nhật với bánh cá hồi chuẩn bị sẵn sàng hết rồi nè, qua đây ăn bánh cùng em mau lên!",
    },
  ];

  const sadEndingMessages = [
    {
      character: "ginger",
      image: "assets/gingercat._annoyed.png",
      text: "Hôm nay đường xá đông đúc mệt lử luôn, tủi thân ghê...",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Mèo Cam ơi anh xin lỗi nha... Loay hoay chuẩn bị bánh trái mà cuối cùng lại về trễ mất tiệc sinh nhật của ông tướng rồi...",
    },
    {
      character: "ginger",
      image: "assets/gingercat._annoyed.png",
      text: "Ngốc ghê, có nhớ tới nhau là vui lắm rồi, đâu cần phải tự trách hoài thế đâu nè.",
    },
    {
      character: "gray",
      image: "assets/graycat_icon.png",
      text: "Hơi buồn chút xíu vì lỡ mất khoảnh khắc đẹp... Chờ anh bù lại gấp đôi nha thương thương.",
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
      row.className = `ending-message-in flex ${message.character === "gray" ? "flex-row-reverse" : "flex-row"} items-center gap-4 md:gap-8 w-full`;
      row.innerHTML = `
        <img src="${message.image}" alt="${message.character === "gray" ? "Gray Cat" : "Ginger Cat"}" class="w-20 h-20 md:w-32 md:h-32 object-contain shrink-0 drop-shadow-md" />
        <div class="flex-1 min-w-0 bg-white border-4 md:border-[6px] border-black shadow-[4px_4px_0_0_#000] md:shadow-[8px_8px_0_0_#000] p-6 md:p-8 font-pixel font-bold text-xl md:text-3xl leading-relaxed text-left text-slate-800">
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
    endingNextBtn.textContent = "Tiếp tục";

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
        <img src="assets/graycat_sadstatus.png" alt="Sad Gray Cat" class="w-48 h-48 md:w-80 md:h-80 max-w-full object-contain drop-shadow-lg" />
        <div class="bg-white border-4 md:border-[6px] border-black shadow-[4px_4px_0_0_#000] md:shadow-[8px_8px_0_0_#000] p-6 md:p-10 font-pixel font-bold text-2xl md:text-4xl leading-relaxed text-slate-800">
          Dù Mèo Cam bảo không sao, nhưng lòng vẫn thấy tiếc hùi hụi vì lỡ mất khoảnh khắc vui vẻ...
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
      endingNextBtn.textContent = "Tiếp tục";
      document.body.classList.remove("is-loading");
      endingContentEl.innerHTML = `
        <div class="ending-message-in flex flex-col items-center gap-5 md:gap-8 text-center">
          <div class="flex items-center justify-center gap-6 md:gap-10">
            <img src="assets/gingercat_happy.png" alt="Happy Ginger Cat" class="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-md" />
            <img src="assets/graycat_happystatus.png" alt="Happy Gray Cat" class="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-md" />
          </div>
          <div class="bg-white border-4 md:border-[6px] border-black shadow-[4px_4px_0_0_#000] md:shadow-[8px_8px_0_0_#000] p-6 md:p-10 font-pixel font-bold text-2xl md:text-4xl leading-relaxed text-slate-800">
            Cảm ơn cậu vì đã luôn đồng hành và mang đến thật nhiều tiếng cười nhé!
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
        <div class="ending-message-in flex flex-col items-center gap-8 md:gap-12 text-center">
          <img src="assets/together.png" alt="Ginger Cat and Gray Cat celebrating together" class="w-full max-w-5xl max-h-[40vh] md:max-h-[65vh] object-contain drop-shadow-lg" />
          <div class="font-pixel font-bold text-4xl md:text-7xl text-pink-600 drop-shadow-sm">Happy Birthday Mèo Cam!</div>
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
    menuToggleBtnFloating.classList.toggle("hidden", false);
    renderIntroStep();
    audioPlayer.startBgm(returnToHome ? "home" : "intro");
  }

  function startQuiz() {
    homeScreenEl.classList.add("hidden");
    introScreenEl.classList.add("hidden");
    quizCardEl.classList.remove("hidden");
    menuToggleBtnFloating.classList.add("hidden"); 

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

    menuToggleBtnFloating.addEventListener("click", () => settingsModal.classList.remove("hidden"));
    menuToggleBtnQuiz.addEventListener("click", () => settingsModal.classList.remove("hidden"));
    
    closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));

    toggleBgmBtn.addEventListener("click", () => {
      const enabled = audioPlayer.toggleBgm();
      toggleBgmBtn.textContent = enabled ? "ON" : "OFF";
      toggleBgmBtn.className = `px-4 py-2 text-xl font-bold border-[3px] border-black shadow-[2px_2px_0_0_#000] ${enabled ? "bg-emerald-400 text-black" : "bg-slate-300 text-slate-600"}`;
    });

    toggleSfxBtn.addEventListener("click", () => {
      const enabled = audioPlayer.toggleSfx();
      toggleSfxBtn.textContent = enabled ? "ON" : "OFF";
      toggleSfxBtn.className = `px-4 py-2 text-xl font-bold border-[3px] border-black shadow-[2px_2px_0_0_#000] ${enabled ? "bg-emerald-400 text-black" : "bg-slate-300 text-slate-600"}`;
    });

    document.addEventListener("click", (event) => {
      if (event.target.closest("button") && event.target !== menuToggleBtnFloating && event.target !== menuToggleBtnQuiz && !settingsModal.contains(event.target)) {
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