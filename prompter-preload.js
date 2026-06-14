const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pmptrPrompter", {
  onSettings: (cb) => {
    const fn = (_e, s) => cb(s);
    ipcRenderer.on("prompter:settings", fn);
    return () => ipcRenderer.removeListener("prompter:settings", fn);
  },
  onCommand: (cb) => {
    const fn = (_e, c) => cb(c);
    ipcRenderer.on("prompter:command", fn);
    return () => ipcRenderer.removeListener("prompter:command", fn);
  },
  sendState: (s) => ipcRenderer.send("prompter:state", s),
  setClickThrough: (b) =>
    ipcRenderer.invoke("prompter:setClickThrough", !!b),
});
