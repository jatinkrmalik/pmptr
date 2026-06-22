# <img src="assets/icon.svg" height="40" align="center" /> pmptr

<p align="center">
  <a href="https://www.npmjs.com/package/pmptr">
    <img src="https://img.shields.io/npm/v/pmptr?style=flat-square&color=cb3837" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/pmptr">
    <img src="https://img.shields.io/npm/dt/pmptr?style=flat-square&color=cb3837" alt="npm downloads">
  </a>
  <a href="https://github.com/jatinkrmalik/pmptr/releases">
    <img src="https://img.shields.io/github/v/release/jatinkrmalik/pmptr?include_prereleases&style=flat-square" alt="GitHub release">
  </a>
  <a href="https://github.com/jatinkrmalik/pmptr/actions/workflows/build.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/jatinkrmalik/pmptr/build.yml?branch=main&style=flat-square&label=build" alt="Build">
  </a>
  <a href="https://github.com/jatinkrmalik/pmptr/actions/workflows/release.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/jatinkrmalik/pmptr/release.yml?style=flat-square&label=release" alt="Release Pipeline">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-beta-orange?style=flat-square" alt="Status: beta">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT">
  </a>
  <img src="https://img.shields.io/badge/platform-linux%20%7C%20macos%20%7C%20windows-blue?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square" alt="Node">
  <img src="https://img.shields.io/badge/electron-31-47848F?style=flat-square" alt="Electron">
</p>

**pmptr** is a minimal virtual teleprompter that lives as a transparent, always-on-top,
click-through overlay over whatever you do on your screen.

## Features

- 🎛️ **Control window** - paste your script, tune speed, size, colors, opacity, mirror,
  window dimensions, and more.
- 🪟 **Floating prompter window** - transparent, frameless, always on top, with
  a true OS-level click-through "lock" so you can keep working with your mouse
  on whatever is underneath.
- 💾 **Settings persistence** - settings are saved to disk in your Electron user-data folder.
- ⚡ **Live updates** - edits in the control window apply to the prompter instantly.
- ⌨️ **Keyboard shortcuts** - play/pause, reset, speed control, and click-through toggle.

## Quick Start

The fastest way to try pmptr is via **npm**:

```bash
npm install -g pmptr
pmptr
```

Requires [Node.js](https://nodejs.org) **20** or later.

Then click **Open floating prompter** in the control window.

## Download

> **Beta** - pmptr is in active beta. Expect occasional bugs and breaking changes.
> Please [report issues](https://github.com/jatinkrmalik/pmptr/issues) you encounter.

Prefer a native installer? Grab the latest build from the [Releases page](https://github.com/jatinkrmalik/pmptr/releases).

| Platform | Format |
|----------|--------|
| macOS    | `.dmg` |
| Windows  | `.exe` (NSIS installer) |
| Linux    | `.AppImage` or `.deb` |

Not code-signed - your OS may warn on first launch. That's expected during beta.

## Run from source

```bash
git clone https://github.com/jatinkrmalik/pmptr.git
cd pmptr
npm install
npm start
```

## Shortcuts (in the floating window)

| Key       | Action                                  |
| --------- | --------------------------------------- |
| `Space`   | Play / pause                            |
| `R`       | Reset scroll to the top                 |
| `↑` / `↓` | Speed ± 5 px/s                          |
| `L`       | Toggle click-through (lock / unlock)    |
| `Esc`     | Close the prompter                      |

You can also use the small HUD in the bottom-right of the floating window
(mouse over it to reveal it).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              pmptr Architecture                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────┐
                              │     Main process    │
                              │  src/main/main.js   │  Creates windows, owns
                              │ src/main/preload.js │  IPC, click-through,
                              │                     │  always-on-top, settings
                              └──────────┬──────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │ spawns                   │ spawns                   │ read/write
              ▼                          ▼                          ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌──────────────────┐
│    Control window   │      │   Prompter window   │      │   settings.json  │
│ src/control/        │      │ src/prompter/       │      │  (Electron user  │
│   control.html      │      │   prompter.html     │      │   data directory)│
│   control.js        │      │   prompter.js       │      └──────────────────┘
└─────────────────────┘      │ prompter-preload.js │
                             └─────────────────────┘

Data flow
─────────

  Control window              Main process             Prompter window
        │                          │                           │
        │── IPC: setting changed ─►│                           │
        │                          │── IPC: settings ─────────►│
        │                          │                           │
        │◄──────── IPC: state ─────│◄──────── IPC: state ──────│
        │                          │                           │

- The **main process** spawns both windows and persists settings to `settings.json`.
- The **control window** sends new settings to the main process over IPC.
- The **prompter window** receives settings from the main process and reports its state back.
- Live edits in the control window are reflected in the prompter instantly.
```

## How the click-through works

The prompter is a separate `BrowserWindow` with `transparent: true`, `frame: false`,
and `alwaysOnTop: true`. When you toggle "click-through" (the lock), the main
process calls `win.setIgnoreMouseEvents(true, { forward: true })` - clicks
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
src/
├── main/
│   ├── main.js               Electron main: creates both windows, handles IPC,
│   │                         click-through, always-on-top, position presets.
│   └── preload.js            contextBridge for the control window.
├── control/
│   ├── control.html          The control panel UI.
│   ├── control.js            Control panel logic.
│   └── control.css           Control panel styles.
└── prompter/
    ├── prompter.html         The floating teleprompter overlay.
    ├── prompter.js           Prompter logic (scroll, shortcuts, HUD).
    ├── prompter.css          Prompter styles.
    └── prompter-preload.js   contextBridge for the prompter window.

assets/
└── icon.svg                  Application icon.

.github/workflows/
── build.yml                 CI build for Linux, macOS, Windows.
├── release.yml               Tag-triggered release pipeline.
├── nightly.yml               Daily scheduled builds.
└── pr-build.yml              Comment-triggered PR artifact builds.
```

## Development

```bash
# Install dependencies
npm install

# Run the app
npm start

# Lint code
npm run lint

# Run tests (currently just lint)
npm test

# Build for distribution
npm run build
```

## Known limitations

- Wayland compositors vary in their support for `setIgnoreMouseEvents` and
  `setAlwaysOnTop` (the underlying APIs Electron uses). X11 (Xorg) and recent
  KDE / GNOME Wayland work fine; some lighter Wayland compositors may ignore
  these hints. If click-through or always-on-top does not work, the prompter
  is still useful - just drag it to a corner.
- On macOS you may need to grant Accessibility / Screen Recording permissions
  to the app for click-through to behave predictably across all apps.
- The app is not code-signed. Your OS may warn on first launch.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.
