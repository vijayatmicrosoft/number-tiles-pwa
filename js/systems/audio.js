let muted = false;
let initialized = false;
let ctx = null;

const PRESETS = {
  tap: { freq: 600, duration: 0.05, type: 'sine' },
  match: { freq: 800, duration: 0.15, type: 'sine' },
  invalid: { freq: 200, duration: 0.1, type: 'square' },
  levelup: { freq: 1000, duration: 0.3, type: 'sine' },
};

export function initAudio() {
  if (initialized) return;
  initialized = true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { /* audio not available */ }
}

export function playSound(name) {
  if (muted || !ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const p = PRESETS[name] || PRESETS.tap;
    osc.frequency.value = p.freq;
    osc.type = p.type;
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.duration);
    osc.start();
    osc.stop(ctx.currentTime + p.duration);
  } catch (e) { /* audio not available */ }
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

export function setMuted(val) {
  muted = val;
}
