/**
 * Web Audio procedural sound synthesizer for realistic paper page turns.
 * Generates natural friction, rustle, and smooth breeze audio without external MP3 files.
 */
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPageTurnSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. White Noise Buffer for crisp paper rustle friction
    const bufferSize = ctx.sampleRate * 0.18; // 180ms duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Pink/Brownish noise roll-off
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass Filter: Simulates crisp paper fiber resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.16);
    filter.Q.setValueAtTime(1.2, now);

    // Gain Envelope: Fast attack, soft decay
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    // 2. Low-frequency soft thump for book spine flex
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    oscGain.gain.setValueAtTime(0.07, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    // Connect graph
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    // Trigger
    noiseSource.start(now);
    noiseSource.stop(now + 0.18);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Gracefully handle browser autoplay policies
  }
}

export const playFlipSound = (_type?: string) => playPageTurnSound();
