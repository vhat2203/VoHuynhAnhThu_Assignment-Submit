// js/audio.js
// Sound effects synthesized purely via the Web Audio API.
// Per CLAUDE.md: NEVER use external audio files (MP3/WAV/etc).
//
// Exposes a single global audio controller. All music and effects are
// synthesized locally with Web Audio API; no external audio files are used.

const audioPlayer = (function () {
  "use strict";

  let ctx = null;
  let isMuted = false;
  let bgmIntervalId = null;
  let bgmStep = 0;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function playTone(freq, duration, type, startGain) {
    if (isMuted) return;
    const audioCtx = getContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(startGain, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
  }

  function playCorrect() {
    try {
      const audioCtx = getContext();
      playTone(880, 0.15, "sine", 0.2); // A5
      window.setTimeout(() => {
        if (audioCtx.state !== "closed") playTone(1318.5, 0.2, "sine", 0.2); // E6
      }, 90);
    } catch (err) {
      console.warn("audioPlayer: unable to play correct sound", err);
    }
  }

  function playClick() {
    try {
      playTone(740, 0.06, "square", 0.08);
    } catch (err) {
      console.warn("audioPlayer: unable to play click sound", err);
    }
  }

  function playMessage() {
    try {
      playTone(1047, 0.08, "sine", 0.07);
      window.setTimeout(() => playTone(1568, 0.12, "sine", 0.05), 45);
    } catch (err) {
      console.warn("audioPlayer: unable to play message sound", err);
    }
  }

  function playWrong() {
    try {
      playTone(140, 0.35, "sawtooth", 0.15);
    } catch (err) {
      console.warn("audioPlayer: unable to play wrong sound", err);
    }
  }

  const BGM_TRACKS = {
    home: { melody: [262, 330, 392, 523, 659, 523, 392, 330], interval: 300 },
    intro: { melody: [392, 440, 523, 659, 523, 440, 392, 330], interval: 340 },
    quiz: { melody: [330, 392, 494, 659, 494, 392, 330, 247], interval: 220 },
  };

  let activeBgmTrack = "home";

  function playBgmNote() {
    const track = BGM_TRACKS[activeBgmTrack] || BGM_TRACKS.home;
    const melody = track.melody;
    playTone(melody[bgmStep % melody.length], 0.24, "square", 0.035);
    bgmStep += 1;
  }

  function startBgm(trackName = "home") {
    if (isMuted) return;

    try {
      getContext();
      stopBgm();
      activeBgmTrack = BGM_TRACKS[trackName] ? trackName : "home";
      bgmStep = 0;
      playBgmNote();
      bgmIntervalId = window.setInterval(
        playBgmNote,
        BGM_TRACKS[activeBgmTrack].interval
      );
    } catch (err) {
      console.warn("audioPlayer: unable to start background music", err);
    }
  }

  function playEndingMusic(branch) {
    if (isMuted) return;

    try {
      getContext();
      stopBgm();
      const melody = branch === "happy"
        ? [523, 659, 784, 1047, 784, 659]
        : [330, 294, 262, 220, 262, 294];
      let step = 0;
      const playEndingNote = () => {
        playTone(melody[step % melody.length], 0.45, branch === "happy" ? "square" : "triangle", 0.045);
        step += 1;
      };
      playEndingNote();
      bgmIntervalId = window.setInterval(playEndingNote, 600);
    } catch (err) {
      console.warn("audioPlayer: unable to start ending music", err);
    }
  }

  function stopBgm() {
    if (bgmIntervalId !== null) {
      window.clearInterval(bgmIntervalId);
      bgmIntervalId = null;
    }
  }

  function stopAll() {
    stopBgm();
  }

  function setMuted(nextMuted) {
    isMuted = nextMuted;
    if (isMuted) stopBgm();
  }

  function toggleMute() {
    setMuted(!isMuted);
    return isMuted;
  }

  return {
    playClick,
    playMessage,
    playCorrect,
    playWrong,
    startBgm,
    playEndingMusic,
    stopBgm,
    stopAll,
    toggleMute,
    isMuted: () => isMuted,
  };
})();