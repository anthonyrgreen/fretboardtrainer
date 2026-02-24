let audioCtx: AudioContext | null = null;
let unlocked = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// iOS (Safari and Chrome) requires AudioContext to be created and resumed
// inside a direct user gesture. Call this once on the first touchstart/click
// to unlock audio for the lifetime of the page.
function unlockAudio() {
  if (unlocked) return;
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  // Play a silent buffer to fully unlock on iOS
  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  unlocked = true;
}

document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });

export function playClick(accent: boolean): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = accent ? 1000 : 800;

  gain.gain.setValueAtTime(accent ? 0.3 : 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  oscillator.start(now);
  oscillator.stop(now + 0.03);
}

export function resumeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}
