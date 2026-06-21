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
const iconPlay = $("iconPlay");
const iconLock = $("iconLock");

let settings = null;
let playing = true;
let locked = false;
let trackY = 0;
let lastTs = 0;
let rafId = null;

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

function play() {
  playing = true;
  iconPlay.textContent = "❚❚";
  lastTs = 0;
  if (!rafId) rafId = requestAnimationFrame(loop);
  api.sendState({ playing: true, locked });
}
function pause() {
  playing = false;
  iconPlay.textContent = "▶";
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
  const speed = (settings && settings.speed) || 40;
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
  iconLock.textContent = locked ? "🔒" : "🔓";
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
