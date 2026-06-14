# pmptr

A minimal virtual teleprompter that lives as a transparent, always-on-top,
click-through overlay over whatever you do on your screen.

## What you get

- **Control window** — paste script, tune speed, size, colors, opacity, mirror,
  window dimensions, etc.
- **Floating prompter window** — transparent, frameless, always on top, with
  a true OS-level click-through "lock" so you can keep working with your mouse
  on whatever is underneath.
- Settings persist to disk in your Electron user-data folder.
- Live updates: edits in the control window apply to the prompter instantly.

## Run it

```bash
npm install
npm start
```

Then click **Open floating prompter** in the control window.

## Shortcuts (in the floating window)

| Key       | Action                                  |
| --------- | --------------------------------------- |
| `Space`   | Play / pause                            |
| `R`       | Reset scroll to the top                 |
| `↑` / `↓` | Speed ± 5 px/s                          |
| `L`       | Toggle click-through (lock / unlock)   |
| `Esc`     | Close the prompter                      |

You can also use the small HUD in the bottom-right of the floating window
(mouse over it to reveal it).

## How the click-through works

The prompter is a separate `BrowserWindow` with `transparent: true`, `frame: false`,
and `alwaysOnTop: true`. When you toggle "click-through" (the lock), the main
process calls `win.setIgnoreMouseEvents(true, { forward: true })` — clicks
and wheel events fall straight through to whatever app is behind, while the
window stays visible and keeps scrolling. The HUD itself is hidden while
locked, so nothing on the prompter intercepts your pointer.

## Tweaking transparency

The window background is a CSS `rgba()` color set on `.frame`. Move the
**Background opacity** slider to 0 for fully see-through, or use
**Background dim** to keep it readable on bright content underneath. The text
itself stays opaque.

## Project layout

```
main.js               Electron main: creates both windows, handles IPC,
                      click-through, always-on-top, position presets.
preload.js            contextBridge for the control window.
prompter-preload.js   contextBridge for the prompter window.
control.html / .js    The control panel.
prompter.html / .js   The floating teleprompter overlay.
```

## Known limitations

- Wayland compositors vary in their support for `setIgnoreMouseEvents` and
  `setAlwaysOnTop` (the underlying APIs Electron uses). X11 (Xorg) and recent
  KDE / GNOME Wayland work fine; some lighter Wayland compositors may ignore
  these hints. If click-through or always-on-top does not work, the prompter
  is still useful — just drag it to a corner.
- On macOS you may need to grant Accessibility / Screen Recording permissions
  to the app for click-through to behave predictably across all apps.
- The app is not code-signed. Your OS may warn on first launch.

## License

MIT
