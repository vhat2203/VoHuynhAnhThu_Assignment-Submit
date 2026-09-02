# Project Overview: Quiz Web App
A single-page Quiz Web Application built with HTML5, Tailwind CSS, and Vanilla JavaScript.

## Build & Run Commands
- Dev / Preview: Open `index.html` via VS Code Live Server or run `npx serve .`
- Formatting & Linting: No build step required for vanilla setup.

## Project Architecture & Conventions
- Single Page Application architecture.
- Modular JavaScript structure:
  - `data/questions.js`: Quiz questions dataset.
  - `js/audio.js`: Sound synthesized via native Web Audio API (no external audio assets).
  - `js/storage.js`: LocalStorage handler for leaderboard.
  - `js/app.js`: Main state management and UI interactions.
- Pure Vanilla JS: Do not install external node runtime packages or heavy frameworks.
- Styling: Tailwind CSS via CDN.

## Development Rules & NEVER List
- NEVER write logic that blocks the UI thread.
- NEVER overload a single file; keep logic separated by domain.
- NEVER leave `setInterval` or `setTimeout` uncleaned when switching views or questions.
- NEVER use external audio files (use Web Audio API synthetics only).
- Keep code clean with no console warnings or errors.