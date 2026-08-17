# Changelog

All notable changes to pmptr will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-16

### Added
- Open, Save, and Save as for script files in the control window, using the native file dialog. Save writes back to the same path. Fixes #18.
- Opt-in voice follow. The prompter scrolls while you speak and eases to a stop when you pause. Local Web Audio only; nothing is recorded or sent. Toggle it in the Reading tab, the HUD mic button, or `V`. Mic sensitivity is a slider.
- Cue Booth control UI: light surface, Reading / Look / Stage tabs, and a cleaner floating HUD.
- Public site at https://jatinkrmalik.com/pmptr
- New app icon

### Changed
- README leads with npm install
- Version tags now build installers, open the GitHub Release, and publish to npm

### Fixed
- Hero demo no longer overflows sideways on phones

## [0.1.1] - 2026-06-21

### Fixed
- Moved `electron` to `peerDependencies` so `electron-builder` can produce native installers while `npm install -g pmptr` still works

## [0.1.0] - 2026-06-21

### Added
- Published `pmptr` to npm with a global CLI (`npm install -g pmptr`)

## [0.1.0-beta.1] - 2026-06-21

### Added
- Transparent, always-on-top floating teleprompter window
- Click-through lock for true OS-level pass-through
- Control window with settings for speed, size, colors, opacity, mirror
- Settings persistence to disk
- Keyboard shortcuts (Space, R, L, Esc, Arrow keys)
- HUD overlay in the prompter window
- CI/CD pipelines (build, release, nightly, PR artifacts)
- Multi-platform builds (macOS, Windows, Linux)

[Unreleased]: https://github.com/jatinkrmalik/pmptr/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/jatinkrmalik/pmptr/releases/tag/v0.2.0
[0.1.1]: https://github.com/jatinkrmalik/pmptr/releases/tag/v0.1.1
[0.1.0]: https://github.com/jatinkrmalik/pmptr/releases/tag/v0.1.0
[0.1.0-beta.1]: https://github.com/jatinkrmalik/pmptr/releases/tag/v0.1.0-beta.1
