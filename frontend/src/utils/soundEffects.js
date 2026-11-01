// sound-effects.js — Zero-dependency Web Audio Procedural Engine
// Implemented directly from the Ghost Design System Specification

let audioCtx = null;
let masterGain = null;
let lastTick = 0;
let audioEnabled = true;

export function isAudioEnabled() {
  return audioEnabled;
}

export function toggleAudio(enabled) {
  if (typeof enabled === 'boolean') {
    audioEnabled = enabled;
  } else {
    audioEnabled = !audioEnabled;
  }
  return audioEnabled;
}

function getSynth() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      
      // 7000Hz warm lowpass filter to eliminate digital clipping
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 7000;
      masterGain.connect(lp);
      lp.connect(audioCtx.destination);
    }
  }
  return { ctx: audioCtx, out: masterGain };
}

/**
 * Subtle hover tick on interactive links & buttons
 * Strict compliance with Ghost engineering rules:
 * 1. 70ms debounce
 * 2. Fine pointer only ((hover: hover) and (pointer: fine))
 * 3. Warm analog filtering at 7,000 Hz
 */
export function playHoverTick() {
  if (!audioEnabled || typeof window === 'undefined') return;

  // Rule 2: Fine pointer only
  if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  const now = performance.now();
  // Rule 1: 70ms debounce
  if (now - lastTick < 70) return;
  lastTick = now;

  try {
    const { ctx, out } = getSynth();
    if (!ctx || !out) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.035);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.025, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(gain);
    gain.connect(out);

    osc.start(t);
    osc.stop(t + 0.045);
  } catch {
    // Non-blocking in case of browser autoplay policy restrictions
  }
}

/**
 * Mechanical relay switch for accordions and drawers
 * Synthesizes shaped procedural white noise with bandpass filtering:
 * 2200Hz for opening, 1600Hz for closing
 */
export function playMechanicalToggle(opening = true) {
  if (!audioEnabled || typeof window === 'undefined') return;

  try {
    const { ctx, out } = getSynth();
    if (!ctx || !out) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const size = Math.ceil(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buf.getChannelData(0);

    // Shaped procedural white noise
    for (let i = 0; i < size; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * 0.25));
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = opening ? 2200 : 1600;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(out);

    src.start();
  } catch {
    // Non-blocking
  }
}

/**
 * Initializes automatic delegating listeners for hover ticks and mechanical toggle clicks
 */
export function initGhostHaptics() {
  if (typeof window === 'undefined') return;

  // Hover delegate
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('button, a, [role="button"], [data-sfx], input[type="radio"], input[type="checkbox"], select');
    if (target) {
      playHoverTick();
    }
  }, { passive: true });

  // Click / Toggle delegate
  document.addEventListener('click', (e) => {
    const toggleTarget = e.target.closest('[data-sfx="toggle"], button[aria-expanded], details summary');
    if (toggleTarget) {
      const isExpanded = toggleTarget.getAttribute('aria-expanded') === 'true' || toggleTarget.closest('details')?.open;
      playMechanicalToggle(!isExpanded);
    }
  }, { passive: true });
}
