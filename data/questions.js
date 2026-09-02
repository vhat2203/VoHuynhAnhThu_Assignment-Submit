// data/questions.js
// Quiz questions dataset. Consumed by js/app.js as a plain global array
// (no bundler / module loader per CLAUDE.md — kept as vanilla JS).

const questions = [
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Trainer Marking Language",
      "Hyper Text Markup Language",
      "Hyper Text Marketing Language",
      "Hyphen Text Markup Language",
    ],
    correctAnswer: "Hyper Text Markup Language",
  },
  {
    question: "Which company developed the Claude family of AI models?",
    options: ["OpenAI", "Google DeepMind", "Anthropic", "Meta"],
    correctAnswer: "Anthropic",
  },
  {
    question: "In JavaScript, which keyword declares a block-scoped variable that can be reassigned?",
    options: ["const", "let", "var", "static"],
    correctAnswer: "let",
  },
  {
    question: "What is the time complexity of binary search on a sorted array?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    correctAnswer: "O(log n)",
  },
  {
    question: "Which CSS utility framework is used via CDN in this project?",
    options: ["Bootstrap", "Bulma", "Tailwind CSS", "Foundation"],
    correctAnswer: "Tailwind CSS",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctAnswer: "Mars",
  },
  {
    question: "Which Web API is used in this project to synthesize sound without external audio files?",
    options: ["Fetch API", "Web Audio API", "WebSocket API", "Canvas API"],
    correctAnswer: "Web Audio API",
  },
  {
    question: "What does 'DOM' stand for in web development?",
    options: [
      "Document Object Model",
      "Data Object Management",
      "Document Order Mapping",
      "Digital Output Module",
    ],
    correctAnswer: "Document Object Model",
  },
  {
    question: "Which HTTP status code indicates a resource was not found?",
    options: ["200", "301", "404", "500"],
    correctAnswer: "404",
  },
  {
    question: "In Git, which command creates a new branch and switches to it in one step?",
    options: ["git branch -m", "git checkout -b", "git merge -b", "git switch --list"],
    correctAnswer: "git checkout -b",
  },
];