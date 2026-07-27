const api = window.pmptrPrompter;

const $ = (id) => document.getElementById(id);
const frame = $("frame");
const track = $("track");
const text = $("text");
const readArea = $("readArea");
const hud = $("hud");
const btnPlay = $("btnPlay");
const btnReset = $("btnReset");
const btnLock = $("btnLock");
const btnClose = $("btnClose");
const btnVoice = $("btnVoice");
const iconPlay = $("iconPlay");
const iconLock = $("iconLock");

let settings = null;
let playing = true;
let locked = false;
let trackY = 0;
let lastTs = 0;
let rafId = null;

// --- Voice-follow (opt-in): scroll only while the user is speaking ---
// A lightweight voice-activity detector: mic RMS vs. an adaptive noise
// floor, with attack/release smoothing and a short hangover so natural
// inter-word gaps do not stop the scroll.
const VOICE_HANGOVER_MS = 700; // keep scrolling this long after speech stops
const VOICE_ATTACK = 6; // gain ramp-up rate (per second)
const VOICE_RELEASE = 2.5; // gain ramp-down rate (per second)

const voice = {
  running: false,
  starting: false,
  error: false,
  stream: null,
  ctx: null,
  analyser: null,
  buf: null,
  rafId: null,
  lastTs: 0,
  noiseFloor: 0.01,
  speaking: false,
  lastSpeechAt: 0,
  gain: 0, // 0..1 multiplier applied to scroll speed
  uiState: "",
};

function voiceEnabled() {
  return !!(settings && settings.voiceFollow);
}

// Effective speed multiplier for the scroll loop. If the mic failed we
// fall back to constant scrolling instead of freezing the prompter.
function voiceGain() {
  if (!voiceEnabled() || !voice.running) return 1;
  return voice.gain;
}

async function startVoice() {
  if (voice.running || voice.starting) return;
  voice.starting = true;
  voice.error = false;
  updateVoiceUi();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    voice.stream = stream;
    voice.ctx = new AudioContext();
    if (voice.ctx.state === "suspended") await voice.ctx.resume();
    const src = voice.ctx.createMediaStreamSource(stream);
    voice.analyser = voice.ctx.createAnalyser();
    voice.analyser.fftSize = 1024;
    voice.analyser.smoothingTimeConstant = 0.3;
    src.connect(voice.analyser);
    voice.buf = new Float32Array(voice.analyser.fftSize);
    voice.noiseFloor = 0.01;
    voice.speaking = false;
    voice.lastSpeechAt = 0;
    voice.gain = 0;
    voice.lastTs = 0;
    voice.running = true;
    voice.rafId = requestAnimationFrame(voiceLoop);
  } catch (e) {
    console.error("voice-follow: microphone unavailable", e);
    voice.error = true;
  }
  voice.starting = false;
  updateVoiceUi();
}

function stopVoice() {
  if (voice.rafId) cancelAnimationFrame(voice.rafId);
  voice.rafId = null;
  if (voice.stream) {
    for (const t of voice.stream.getTracks()) t.stop();
  }
  if (voice.ctx) voice.ctx.close().catch(() => {});
  voice.stream = null;
  voice.ctx = null;
  voice.analyser = null;
  voice.buf = null;
  voice.running = false;
  voice.speaking = false;
  voice.gain = 0;
  updateVoiceUi();
}

function voiceLoop(ts) {
  if (!voice.running) return;
  if (!voice.lastTs) voice.lastTs = ts;
  const dt = Math.min(0.1, (ts - voice.lastTs) / 1000);
  voice.lastTs = ts;

  voice.analyser.getFloatTimeDomainData(voice.buf);
  let sum = 0;
  for (let i = 0; i < voice.buf.length; i++) {
    sum += voice.buf[i] * voice.buf[i];
  }
  const rms = Math.sqrt(sum / voice.buf.length);

  // Adaptive noise floor: drops quickly in silence, creeps up slowly so
  // sustained speech is not absorbed into the floor.
  if (rms < voice.noiseFloor) {
    voice.noiseFloor += (rms - voice.noiseFloor) * 0.2;
  } else {
    voice.noiseFloor += (rms - voice.noiseFloor) * 0.005;
  }
  voice.noiseFloor = Math.max(0.0005, voice.noiseFloor);

  // Sensitivity (0..100, default 50) sets how far above the noise floor
  // the signal must be to count as speech.
  const sens = (settings && settings.voiceSens) ?? 50;
  const mult = 1.5 + ((100 - sens) / 100) * 6; // 1.5x..7.5x floor
  const minAbs = 0.003 + ((100 - sens) / 100) * 0.02;
  const threshold = Math.max(minAbs, voice.noiseFloor * mult);

  const now = performance.now();
  voice.speaking = rms > threshold;
  if (voice.speaking) voice.lastSpeechAt = now;

  const target =
    voice.speaking || now - voice.lastSpeechAt < VOICE_HANGOVER_MS ? 1 : 0;
  const rate = target > voice.gain ? VOICE_ATTACK : VOICE_RELEASE;
  voice.gain += (target - voice.gain) * Math.min(1, rate * dt);
  if (Math.abs(target - voice.gain) < 0.01) voice.gain = target;

  updateVoiceUi();
  voice.rafId = requestAnimationFrame(voiceLoop);
}

function updateVoiceUi() {
  const enabled = voiceEnabled();
  let state = "off";
  if (enabled && voice.error) state = "error";
  else if (enabled && voice.running) {
    state = voice.speaking ? "speaking" : "listening";
  } else if (enabled) state = "starting";

  btnVoice.setAttribute("aria-pressed", String(enabled));
  btnVoice.classList.toggle("voice-on", enabled && !voice.error);
  btnVoice.classList.toggle("speaking", state === "speaking");
  btnVoice.classList.toggle("voice-err", state === "error");

  if (state !== voice.uiState) {
    voice.uiState = state;
    api.sendState({ voice: state, locked, playing });
  }
}

function syncVoice() {
  if (voiceEnabled()) startVoice();
  else stopVoice();
}

function toggleVoiceFollow() {
  if (!settings) return;
  settings.voiceFollow = !settings.voiceFollow;
  syncVoice();
  api.sendState({ voiceFollow: settings.voiceFollow, locked, playing });
}

function hexToRgb(hex) {
  const h = (hex || "#000000").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function applySettings() {
  if (!settings) return;
  const root = document.documentElement.style;
  root.setProperty("--text", settings.color || "#ffffff");
  root.setProperty("--hl", settings.hl || "#ffd84d");
  root.setProperty("--bg-rgb", hexToRgb("#000000"));
  root.setProperty("--bg-alpha", String((settings.bg ?? 35) / 100));
  root.setProperty("--dim", String(settings.dim ?? 0));
  root.setProperty("--font", `${settings.font || 44}px`);
  root.setProperty("--lh", String(settings.lh || 1.45));
  root.setProperty("--ls", `${settings.ls || 0}px`);
  root.setProperty("--margin", `${settings.margin || 0}px`);
  root.setProperty("--stroke", `${settings.stroke || 0}px`);
  root.setProperty("--mirror", settings.mirror ? "scaleX(-1)" : "none");
  root.setProperty("--tt", settings.uppercase ? "uppercase" : "none");
  root.setProperty("--weight", settings.bold ? "700" : "500");
  root.setProperty("--show-line", settings.showReadingLine ? "block" : "none");

  frame.classList.toggle("dim", (settings.dim ?? 0) > 0);

  text.innerHTML = formatScript(settings.script || "");
  resetScroll();
}

function formatScript(raw) {
  const safe = (raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = safe
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
  return paragraphs || "<p><i>(empty script)</i></p>";
}

function resetScroll() {
  trackY = readArea.clientHeight / 2;
  render();
}

const ICON_PAUSE =
  '<path fill="currentColor" d="M6.5 4.75a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 .75.75h1.75a.75.75 0 0 0 .75-.75v-9a.75.75 0 0 0-.75-.75H6.5Zm5.25 0a.75.75 0 0 0-.75.75v9c0 .414.336.75.75.75H14a.75.75 0 0 0 .75-.75v-9a.75.75 0 0 0-.75-.75h-2.25Z"/>';
const ICON_PLAY =
  '<path fill="currentColor" d="M7.05 4.41A.75.75 0 0 0 6 5.1v9.8a.75.75 0 0 0 1.12.65l8.1-4.9a.75.75 0 0 0 0-1.3l-8.1-4.94a.75.75 0 0 0-.07-.03Z"/>';

function setPlayIcon(isPlaying) {
  iconPlay.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
}

function play() {
  playing = true;
  setPlayIcon(true);
  lastTs = 0;
  if (!rafId) rafId = requestAnimationFrame(loop);
  api.sendState({ playing: true, locked });
}
function pause() {
  playing = false;
  setPlayIcon(false);
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  api.sendState({ playing: false, locked });
}
function togglePlay() {
  if (playing) pause();
  else play();
}

function loop(ts) {
  if (!playing) return;
  if (!lastTs) lastTs = ts;
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  const speed = ((settings && settings.speed) || 40) * voiceGain();
  trackY -= speed * dt;
  render();
  if (-trackY > track.scrollHeight - readArea.clientHeight / 2) {
    pause();
    return;
  }
  rafId = requestAnimationFrame(loop);
}

function render() {
  track.style.transform = `translate3d(0, ${trackY}px, 0)`;
}

async function setLocked(v) {
  locked = !!v;
  hud.dataset.locked = String(locked);
  iconLock.dataset.state = locked ? "locked" : "open";
  btnLock.setAttribute("aria-pressed", String(locked));
  await api.setClickThrough(locked);
  api.sendState({ locked, playing });
}

function adjustSpeed(delta) {
  if (!settings) return;
  const next = Math.max(5, Math.min(300, (settings.speed || 40) + delta));
  if (next === settings.speed) return;
  settings.speed = next;
  api.sendState({ speed: next, locked, playing });
}

function wireHud() {
  btnPlay.addEventListener("click", togglePlay);
  btnReset.addEventListener("click", () => {
    lastTs = 0;
    resetScroll();
  });
  btnLock.addEventListener("click", () => setLocked(!locked));
  btnVoice.addEventListener("click", toggleVoiceFollow);
  btnClose.addEventListener("click", () => window.close());

  readArea.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      trackY -= e.deltaY;
      render();
    },
    { passive: false }
  );
}

function wireKeys() {
  window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "r" || e.key === "R") {
      lastTs = 0;
      resetScroll();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      adjustSpeed(+5);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      adjustSpeed(-5);
    } else if (e.key === "l" || e.key === "L") {
      setLocked(!locked);
    } else if (e.key === "v" || e.key === "V") {
      toggleVoiceFollow();
    } else if (e.key === "Escape") {
      window.close();
    }
  });
}

function boot() {
  wireHud();
  wireKeys();
  applySettings({});
  api.onSettings((s) => {
    if (!s) return;
    settings = s;
    applySettings();
    syncVoice();
    if (playing) play();
    if (typeof s.clickThrough === "boolean" && s.clickThrough !== locked) {
      setLocked(s.clickThrough);
    }
  });
  api.onCommand((cmd) => {
    if (!cmd) return;
    if (cmd.type === "reset") resetScroll();
    if (cmd.type === "play") play();
    if (cmd.type === "pause") pause();
  });
  api.sendState({ playing, locked });
}

boot();
