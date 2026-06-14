const { app, BrowserWindow, ipcMain, screen, shell } = require("electron");
const path = require("path");
const fs = require("fs");

let controlWin = null;
let prompterWin = null;

const settingsPath = () => path.join(app.getPath("userData"), "settings.json");

function loadSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
  } catch {
    return null;
  }
}

function saveSettings(s) {
  try {
    fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
    fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2));
  } catch (e) {
    console.error("settings save failed", e);
  }
}

function createControlWindow() {
  controlWin = new BrowserWindow({
    width: 520,
    height: 820,
    minWidth: 380,
    minHeight: 520,
    title: "pmptr",
    backgroundColor: "#0f1115",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  controlWin.removeMenu();
  controlWin.loadFile(path.join(__dirname, "control.html"));
  controlWin.on("closed", () => {
    controlWin = null;
    if (prompterWin && !prompterWin.isDestroyed()) prompterWin.close();
    app.quit();
  });
}

function createPrompterWindow(initial) {
  if (prompterWin && !prompterWin.isDestroyed()) {
    prompterWin.show();
    prompterWin.focus();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const work = display.workArea;
  const width = Math.round(
    Math.min(initial?.windowWidth ?? 900, work.width - 40)
  );
  const height = Math.round(initial?.windowHeight ?? Math.min(320, work.height - 80));
  const x = Math.round(work.x + (work.width - width) / 2);
  const y = work.y + 24;

  prompterWin = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth: 240,
    minHeight: 80,
    frame: false,
    transparent: true,
    resizable: true,
    movable: true,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#00000000",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "prompter-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  prompterWin.setAlwaysOnTop(true, "screen-saver");
  prompterWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  prompterWin.loadFile(path.join(__dirname, "prompter.html"));
  prompterWin.once("ready-to-show", () => {
    prompterWin.showInactive();
  });
  prompterWin.on("closed", () => {
    prompterWin = null;
    if (controlWin && !controlWin.isDestroyed()) {
      controlWin.webContents.send("prompter:closed");
    }
  });
}

ipcMain.handle("settings:load", () => loadSettings() || {});
ipcMain.handle("settings:save", (_e, s) => {
  saveSettings(s);
  return true;
});

ipcMain.handle("prompter:open", (_e, settings) => {
  createPrompterWindow(settings);
  return true;
});

ipcMain.handle("prompter:close", () => {
  if (prompterWin && !prompterWin.isDestroyed()) prompterWin.close();
  return true;
});

ipcMain.handle("prompter:isOpen", () => {
  return !!(prompterWin && !prompterWin.isDestroyed());
});

ipcMain.handle("prompter:setClickThrough", (_e, enabled) => {
  if (!prompterWin || prompterWin.isDestroyed()) return false;
  // forward: true keeps mousemove + click on interactive children (HUD buttons)
  prompterWin.setIgnoreMouseEvents(!!enabled, { forward: true });
  return true;
});

ipcMain.handle("prompter:setIgnoreMouse", (_e, enabled) => {
  if (!prompterWin || prompterWin.isDestroyed()) return false;
  prompterWin.setIgnoreMouseEvents(!!enabled, { forward: true });
  return true;
});

ipcMain.handle("prompter:setBounds", (_e, bounds) => {
  if (!prompterWin || prompterWin.isDestroyed()) return false;
  const { x, y, width, height } = bounds || {};
  if ([x, y, width, height].every((v) => typeof v === "number")) {
    prompterWin.setBounds({ x, y, width, height });
    return true;
  }
  return false;
});

ipcMain.handle("prompter:setAlwaysOnTop", (_e, enabled) => {
  if (!prompterWin || prompterWin.isDestroyed()) return false;
  prompterWin.setAlwaysOnTop(!!enabled, "screen-saver");
  return true;
});

ipcMain.handle("prompter:sendSettings", (_e, settings) => {
  if (!prompterWin || prompterWin.isDestroyed()) return false;
  prompterWin.webContents.send("prompter:settings", settings);
  return true;
});

ipcMain.handle("prompter:sendCommand", (_e, cmd) => {
  if (!prompterWin || prompterWin.isDestroyed()) return false;
  prompterWin.webContents.send("prompter:command", cmd);
  if (cmd && cmd.type === "position") {
    const display = screen.getPrimaryDisplay();
    const work = display.workArea;
    const b = prompterWin.getBounds();
    const w = b.width;
    const h = b.height;
    let x, y;
    switch (cmd.value) {
      case "top-left":
        x = work.x + 20;
        y = work.y + 20;
        break;
      case "top-right":
        x = work.x + work.width - w - 20;
        y = work.y + 20;
        break;
      case "bottom-center":
        x = Math.round(work.x + (work.width - w) / 2);
        y = work.y + work.height - h - 20;
        break;
      case "top-center":
      default:
        x = Math.round(work.x + (work.width - w) / 2);
        y = work.y + 20;
        break;
    }
    prompterWin.setBounds({ x, y, width: w, height: h });
  }
  return true;
});

ipcMain.on("prompter:state", (_e, state) => {
  if (controlWin && !controlWin.isDestroyed()) {
    controlWin.webContents.send("prompter:state", state);
  }
});

ipcMain.handle("app:openExternal", (_e, url) => {
  if (typeof url === "string" && /^https?:\/\//.test(url)) {
    shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle("app:quit", () => {
  app.quit();
  return true;
});

app.whenReady().then(() => {
  createControlWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createControlWindow();
  });
});

app.on("window-all-closed", () => {
  app.quit();
});
