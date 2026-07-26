# AGENTS.md

## Cursor Cloud specific instructions

pmptr is a single **Electron** desktop app (no backend/API/database). Settings persist to a local JSON file under Electron `userData`. There is also a separate static marketing site in `web/` (optional; not needed to run the app).

Standard commands live in `package.json` (`start`, `lint`, `test`, `build`) — refer to those rather than duplicating.

Non-obvious notes for running/testing in this cloud VM:

- A display is available at `DISPLAY=:1`; the Electron app renders there. Launch with `npm start`.
- On launch you will see noisy `bus.cc` (dbus) and GPU/`SharedImage` errors in the logs. These are harmless in this containerized environment — the windows still render and the app works.
- The app opens a **Control window** first. Click **Open floating prompter** to open the overlay prompter window. Prompter keyboard shortcuts: Space = play/pause scroll, R = reset, ↑/↓ = speed, Esc = close.
- The floating prompter defaults to **Click-through (lock)** enabled, which makes it ignore mouse clicks. To interact with the prompter window directly (e.g. for manual testing), disable "Click-through (lock)" in the Control window first.
- `npm test` is just an alias for `npm run lint` (ESLint); there are no unit/integration tests.
- `npm run build` runs electron-builder to produce distributables (`.AppImage`/`.deb` on Linux) into `dist/`. This is packaging, not needed for development; dev mode is `npm start`.
- `electron` is a peerDependency; `npm install` installs it automatically (currently Electron 31).
