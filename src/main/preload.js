const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pmptr", {
  loadSettings: () => ipcRenderer.invoke("settings:load"),
  saveSettings: (s) => ipcRenderer.invoke("settings:save", s),

  openPrompter: (s) => ipcRenderer.invoke("prompter:open", s),
  closePrompter: () => ipcRenderer.invoke("prompter:close"),
  isPrompterOpen: () => ipcRenderer.invoke("prompter:isOpen"),

  setClickThrough: (b) =>
    ipcRenderer.invoke("prompter:setClickThrough", !!b),
  setIgnoreMouse: (b) => ipcRenderer.invoke("prompter:setIgnoreMouse", !!b),
  setAlwaysOnTop: (b) =>
    ipcRenderer.invoke("prompter:setAlwaysOnTop", !!b),
  setBounds: (b) => ipcRenderer.invoke("prompter:setBounds", b),

  sendSettings: (s) => ipcRenderer.invoke("prompter:sendSettings", s),
  sendCommand: (c) => ipcRenderer.invoke("prompter:sendCommand", c),

  sendPrompterState: (s) => ipcRenderer.send("prompter:state", s),
  onPrompterState: (cb) => {
    const fn = (_e, s) => cb(s);
    ipcRenderer.on("prompter:state", fn);
    return () => ipcRenderer.removeListener("prompter:state", fn);
  },
  onPrompterClosed: (cb) => {
    const fn = () => cb();
    ipcRenderer.on("prompter:closed", fn);
    return () => ipcRenderer.removeListener("prompter:closed", fn);
  },

  openExternal: (u) => ipcRenderer.invoke("app:openExternal", u),
  quit: () => ipcRenderer.invoke("app:quit"),
});
