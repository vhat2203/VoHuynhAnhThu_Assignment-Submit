// js/audio.js
// Daily & Cozy Audio Manager thuần Web Audio API với tính năng tùy chỉnh độc lập BGM và SFX.

const audioPlayer = (function () {
  "use strict";

  let ctx = null;
  let isBgmEnabled = true;
  let isSfxEnabled = true;
  let bgmIntervalId = null;
  let bgmStep = 0;
  let activeBgmTrack = "home";

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

  function playTone(freq, duration, type = "sine", startGain = 0.03, slideToFreq = null) {
    const audioCtx = getContext();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), now + duration);
    }

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(startGain, now + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  function playClick() {
    if (!isSfxEnabled) return;
    try {
      playTone(480, 0.05, "sine", 0.04, 320);
    } catch (err) {
      console.warn("audioPlayer: click sound error", err);
    }
  }

  function playMessage() {
    if (!isSfxEnabled) return;
    try {
      const audioCtx = getContext();
      playTone(880, 0.08, "sine", 0.035);
      window.setTimeout(() => {
        if (audioCtx.state !== "closed") playTone(1320, 0.12, "sine", 0.03);
      }, 80);
    } catch (err) {
      console.warn("audioPlayer: message sound error", err);
    }
  }

  function playCorrect() {
    if (!isSfxEnabled) return;
    try {
      const audioCtx = getContext();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        window.setTimeout(() => {
          if (audioCtx.state !== "closed") playTone(freq, 0.22, "sine", 0.03);
        }, idx * 70);
      });
    } catch (err) {
      console.warn("audioPlayer: correct sound error", err);
    }
  }

  function playWrong() {
    if (!isSfxEnabled) return;
    try {
      const audioCtx = getContext();
      playTone(293.66, 0.15, "triangle", 0.035, 220);
      window.setTimeout(() => {
        if (audioCtx.state !== "closed") playTone(220, 0.2, "triangle", 0.03, 164.81);
      }, 100);
    } catch (err) {
      console.warn("audioPlayer: wrong sound error", err);
    }
  }

  // Phân chia Nhạc nền (BGM) riêng biệt với phong cách daily nhẹ nhàng
  const BGM_TRACKS = {
    home: {
      melody: [392.0, 440.0, 523.25, 659.25, 523.25, 440.0, 392.0, 329.63],
      interval: 380, // Track 1: Home Screen (Êm dịu chủ đạo)
    },
    intro: {
      melody: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0],
      interval: 450, // Track 2: Intro / Rule Screen (Daily nhẹ nhàng, chậm rãi)
    },
    quiz: {
      melody: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0],
      interval: 240, // Track 3: Quiz Screen (Tập trung, nhịp độ vừa phải)
    },
  };

  function playBgmNote() {
    if (!isBgmEnabled) return;
    const track = BGM_TRACKS[activeBgmTrack] || BGM_TRACKS.home;
    const melody = track.melody;
    playTone(melody[bgmStep % melody.length], 0.25, "sine", 0.02);
    bgmStep += 1;
  }

  function startBgm(trackName = "home") {
    stopBgm();
    activeBgmTrack = BGM_TRACKS[trackName] ? trackName : "home";
    bgmStep = 0;
    if (!isBgmEnabled) return;

    try {
      getContext();
      playBgmNote();
      bgmIntervalId = window.setInterval(playBgmNote, BGM_TRACKS[activeBgmTrack].interval);
    } catch (err) {
      console.warn("audioPlayer: startBgm error", err);
    }
  }

  function playEndingMusic(branch) {
    stopBgm();
    if (!isBgmEnabled) return;

    try {
      getContext();
      const melody = branch === "happy"
        ? [523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 523.25]
        : [349.23, 329.63, 293.66, 261.63, 220.0, 261.63, 293.66];

      let step = 0;
      const playEndingNote = () => {
        if (!isBgmEnabled) return;
        playTone(melody[step % melody.length], 0.45, "sine", 0.025);
        step += 1;
      };

      playEndingNote();
      bgmIntervalId = window.setInterval(playEndingNote, branch === "happy" ? 420 : 560);
    } catch (err) {
      console.warn("audioPlayer: ending music error", err);
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

  function toggleBgm() {
    isBgmEnabled = !isBgmEnabled;
    if (!isBgmEnabled) {
      stopBgm();
    } else {
      startBgm(activeBgmTrack);
    }
    return isBgmEnabled;
  }

  function toggleSfx() {
    isSfxEnabled = !isSfxEnabled;
    return isSfxEnabled;
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
    toggleBgm,
    toggleSfx,
    isBgmEnabled: () => isBgmEnabled,
    isSfxEnabled: () => isSfxEnabled,
  };
})();