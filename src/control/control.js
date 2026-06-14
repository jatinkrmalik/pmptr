const api = window.pmptr;

const DEFAULTS = {
  script: "",
  speed: 40,
  font: 44,
  lh: 1.45,
  ls: 0,
  margin: 0,
  color: "#ffffff",
  hl: "#ffd84d",
  bg: 35,
  dim: 0,
  stroke: 0,
  mirror: false,
  bold: false,
  uppercase: false,
  showReadingLine: true,
  alwaysOnTop: true,
  clickThrough: false,
  winWidth: 900,
  winHeight: 280,
  position: "top-center",
};

const SAMPLE = `Welcome to pmptr.

This is a minimal virtual teleprompter that floats above your work as a transparent, always-on-top window.

Paste your own script on the left, adjust the speed, colors, and opacity, then open the floating prompter.

A few tips:

* The "lock" toggle makes the prompter click-through, so you can keep working with your mouse on whatever is behind it.
* Drag the bottom-right corner of the floating window to resize it.
* The reading line stays fixed in the middle; the text scrolls past it.

Good luck on stage.`;

const $ = (id) => document.getElementById(id);

const els = {
  script: $("script"),
  scriptMeta: $("scriptMeta"),
  loadSample: $("loadSample"),
  clearScript: $("clearScript"),
  speed: $("speed"),
  speedOut: $("speedOut"),
  font: $("font"),
  fontOut: $("fontOut"),
  lh: $("lh"),
  lhOut: $("lhOut"),
  ls: $("ls"),
  lsOut: $("lsOut"),
  margin: $("margin"),
  marginOut: $("marginOut"),
  color: $("color"),
  hl: $("hl"),
  bg: $("bg"),
  bgOut: $("bgOut"),
  dim: $("dim"),
  dimOut: $("dimOut"),
  stroke: $("stroke"),
  strokeOut: $("strokeOut"),
  mirror: $("mirror"),
  bold: $("bold"),
  uppercase: $("uppercase"),
  showReadingLine: $("showReadingLine"),
  alwaysOnTop: $("alwaysOnTop"),
  clickThrough: $("clickThrough"),
  winWidth: $("winWidth"),
  winWidthOut: $("winWidthOut"),
  winHeight: $("winHeight"),
  winHeightOut: $("winHeightOut"),
  position: $("position"),
  openBtn: $("openBtn"),
  closeBtn: $("closeBtn"),
  state: $("state"),
};

let state = { ...DEFAULTS };
let saveTimer = null;
let prompterOpen = false;

function snapshot() {
  state = {
    ...state,
    script: els.script.value,
    speed: +els.speed.value,
    font: +els.font.value,
    lh: +els.lh.value,
    ls: +els.ls.value,
    margin: +els.margin.value,
    color: els.color.value,
    hl: els.hl.value,
    bg: +els.bg.value,
    dim: +els.dim.value,
    stroke: +els.stroke.value,
    mirror: els.mirror.checked,
    bold: els.bold.checked,
    uppercase: els.uppercase.checked,
    showReadingLine: els.showReadingLine.checked,
    alwaysOnTop: els.alwaysOnTop.checked,
    clickThrough: els.clickThrough.checked,
    winWidth: +els.winWidth.value,
    winHeight: +els.winHeight.value,
    position: els.position.value,
  };
}

function renderOutputs() {
  els.speedOut.value = els.speed.value;
  els.fontOut.value = els.font.value;
  els.lhOut.value = (+els.lh.value).toFixed(2);
  els.lsOut.value = (+els.ls.value).toFixed(1);
  els.marginOut.value = els.margin.value;
  els.bgOut.value = els.bg.value;
  els.dimOut.value = els.dim.value;
  els.strokeOut.value = (+els.stroke.value).toFixed(1);
  els.winWidthOut.value = els.winWidth.value;
  els.winHeightOut.value = els.winHeight.value;
  updateMeta();
}

function updateMeta() {
  const t = els.script.value || "";
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const minutes = state.speed > 0 ? Math.max(0.1, words / (state.speed * 1.4)) : 0;
  els.scriptMeta.textContent = `${words} word${words === 1 ? "" : "s"} · ${t.length} chars · ≈ ${minutes.toFixed(1)} min @ current size`;
}

function fillForm() {
  els.script.value = state.script || "";
  els.speed.value = state.speed;
  els.font.value = state.font;
  els.lh.value = state.lh;
  els.ls.value = state.ls;
  els.margin.value = state.margin;
  els.color.value = state.color;
  els.hl.value = state.hl;
  els.bg.value = state.bg;
  els.dim.value = state.dim;
  els.stroke.value = state.stroke;
  els.mirror.checked = state.mirror;
  els.bold.checked = state.bold;
  els.uppercase.checked = state.uppercase;
  els.showReadingLine.checked = state.showReadingLine;
  els.alwaysOnTop.checked = state.alwaysOnTop;
  els.clickThrough.checked = state.clickThrough;
  els.winWidth.value = state.winWidth;
  els.winHeight.value = state.winHeight;
  els.position.value = state.position;
  renderOutputs();
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => api.saveSettings(state), 250);
}

async function pushToPrompter() {
  if (!prompterOpen) return;
  await api.sendSettings(state);
}

function applyClickThrough(enabled) {
  if (!prompterOpen) return;
  api.setClickThrough(enabled);
}

function applyAlwaysOnTop(enabled) {
  if (!prompterOpen) return;
  api.setAlwaysOnTop(enabled);
}

function applyPosition() {
  if (!prompterOpen) return;
  api.setBounds({ width: state.winWidth, height: state.winHeight });
  api.sendCommand({ type: "position", value: state.position });
}

async function openPrompter() {
  snapshot();
  await api.openPrompter({
    windowWidth: state.winWidth,
    windowHeight: state.winHeight,
    position: state.position,
    alwaysOnTop: state.alwaysOnTop,
  });
  prompterOpen = true;
  els.openBtn.disabled = true;
  els.closeBtn.disabled = false;
  setState("prompter open", "ok");
  await pushToPrompter();
  if (state.clickThrough) applyClickThrough(true);
}

async function closePrompter() {
  await api.closePrompter();
}

function setState(text, kind) {
  els.state.textContent = text;
  els.state.classList.remove("ok", "warn");
  if (kind) els.state.classList.add(kind);
}

function wire() {
  const inputs = [
    "speed",
    "font",
    "lh",
    "ls",
    "margin",
    "color",
    "hl",
    "bg",
    "dim",
    "stroke",
    "winWidth",
    "winHeight",
    "position",
  ];
  for (const k of inputs) {
    els[k].addEventListener("input", () => {
      snapshot();
      renderOutputs();
      queueSave();
      pushToPrompter();
      if (k === "winWidth" || k === "winHeight" || k === "position") {
        applyPosition();
      }
    });
  }
  const toggles = [
    "mirror",
    "bold",
    "uppercase",
    "showReadingLine",
    "alwaysOnTop",
    "clickThrough",
  ];
  for (const k of toggles) {
    els[k].addEventListener("change", () => {
      snapshot();
      queueSave();
      pushToPrompter();
      if (k === "clickThrough") applyClickThrough(els.clickThrough.checked);
      if (k === "alwaysOnTop") applyAlwaysOnTop(els.alwaysOnTop.checked);
    });
  }
  els.script.addEventListener("input", () => {
    snapshot();
    renderOutputs();
    queueSave();
    pushToPrompter();
  });

  els.openBtn.addEventListener("click", openPrompter);
  els.closeBtn.addEventListener("click", closePrompter);

  els.loadSample.addEventListener("click", () => {
    els.script.value = SAMPLE;
    snapshot();
    renderOutputs();
    queueSave();
    pushToPrompter();
  });
  els.clearScript.addEventListener("click", () => {
    els.script.value = "";
    snapshot();
    renderOutputs();
    queueSave();
    pushToPrompter();
    els.script.focus();
  });

  api.onPrompterClosed(() => {
    prompterOpen = false;
    els.openBtn.disabled = false;
    els.closeBtn.disabled = true;
    setState("prompter closed");
  });

  api.onPrompterState((s) => {
    if (!s || typeof s !== "object") return;
    let changed = false;
    if (s.locked !== undefined && s.locked !== els.clickThrough.checked) {
      els.clickThrough.checked = !!s.locked;
      state.clickThrough = !!s.locked;
      changed = true;
    }
    if (typeof s.speed === "number" && s.speed !== +els.speed.value) {
      els.speed.value = s.speed;
      state.speed = s.speed;
      els.speedOut.value = s.speed;
      changed = true;
    }
    if (changed) {
      queueSave();
    }
  });
}

(async function init() {
  const saved = await api.loadSettings();
  if (saved && typeof saved === "object") {
    state = { ...DEFAULTS, ...saved };
  }
  fillForm();
  wire();
  setState("ready");
})();
