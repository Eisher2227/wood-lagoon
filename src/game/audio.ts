let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let muted = false;
let music: HTMLAudioElement | null = null;
let folkOn = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C({ latencyHint: "interactive" });
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.7;
    sfxBus.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio() {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
  if (!folkOn) startFolk();
  else if (music && music.paused && !muted) void music.play().catch(() => undefined);
}

function startFolk() {
  if (folkOn || typeof Audio === "undefined") return;
  folkOn = true;
  const el = new Audio();
  el.preload = "auto";
  el.loop = true;
  const ogg = el.canPlayType('audio/ogg; codecs="vorbis"') || el.canPlayType("audio/ogg");
  el.src = ogg ? "/music/folk.ogg" : "/music/folk.mp3";
  el.volume = muted ? 0 : 0.34;
  const play = () => {
    void el.play().catch(() => {
      /* gesture already used; next click retries via unlockAudio */
    });
  };
  play();
  el.addEventListener("ended", play);
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !muted) play();
      const a = ac();
      if (a && a.state === "suspended") void a.resume();
    });
  }
  music = el;
}

export function setMuted(v: boolean) {
  muted = v;
  if (music) {
    music.volume = v ? 0 : 0.34;
    if (!v) void music.play().catch(() => undefined);
    else music.pause();
  }
}

export function isMuted() {
  return muted;
}

function beep(freq: number, dur: number, type: OscillatorType, vol = 0.04) {
  if (muted) return;
  const c = ac();
  if (!c || !sfxBus) return;
  if (c.state === "suspended") void c.resume();
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = type === "sawtooth" || type === "square" ? "triangle" : type;
  o.frequency.value = freq;
  f.type = "lowpass";
  f.frequency.value = Math.min(1800, freq * 4);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(f);
  f.connect(g);
  g.connect(sfxBus);
  o.start(c.currentTime);
  o.stop(c.currentTime + dur + 0.03);
}

export function sfxClick() {
  beep(420, 0.06, "sine", 0.03);
}

export function sfxMove() {
  beep(180, 0.16, "sine", 0.035);
}

export function sfxDice() {
  beep(660, 0.05, "sine", 0.03);
  setTimeout(() => beep(520, 0.08, "sine", 0.025), 70);
}

export function sfxHit() {
  beep(140, 0.14, "triangle", 0.04);
}

export function sfxWin() {
  beep(392, 0.12, "sine", 0.03);
  setTimeout(() => beep(523, 0.18, "sine", 0.028), 110);
}

export function sfxLose() {
  beep(196, 0.28, "sine", 0.035);
}
