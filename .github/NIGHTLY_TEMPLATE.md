# pmptr Nightly Build - {{ date }}

> ⚠️ **This is a nightly build** - Use for testing only, not for production.

## Build Information

- **Build Date**: {{ date }}
- **Commit**: `{{ commit_sha }}`
- **Branch**: `{{ branch }}`
- **Build Number**: #{{ build_number }}

## What's Changed

This nightly build includes the latest changes from the `{{ branch }}` branch. Check the [commit history](https://github.com/jatinkrmalik/pmptr/commits/{{ branch }}) for details.

## Downloads

### 🐧 Linux
- **pmptr-nightly-linux.AppImage** - Universal Linux binary
  - Make it executable: `chmod +x pmptr-nightly-linux.AppImage`
  - Run: `./pmptr-nightly-linux.AppImage`
- **pmptr-nightly-linux_amd64.deb** - Debian/Ubuntu package
  - Install: `sudo dpkg -i pmptr-nightly-linux_amd64.deb`

### 🍎 macOS
- **pmptr-nightly-mac.dmg** - macOS universal binary
  - Open the DMG and drag pmptr to Applications
  - First launch: Right-click → Open (to bypass Gatekeeper)

### 🪟 Windows
- **pmptr-nightly-windows.exe** - Windows installer
  - Run the installer
  - Windows SmartScreen: Click "More info" → "Run anyway"

## Testing Steps

This is a nightly build, so please test thoroughly and report any issues:

### Quick Smoke Test (5 minutes)
1. ✅ Install the build for your platform
2. ✅ Launch pmptr and verify it opens
3. ✅ Paste a test script in the control window
4. ✅ Open the floating prompter
5. ✅ Verify text scrolls correctly
6. ✅ Test pause/resume and reset
7. ✅ Test the lock/click-through feature

### Feature Testing (15 minutes)
8. ✅ Test all sliders (speed, font size, colors, opacity, etc.)
9. ✅ Verify settings persist after restart
10. ✅ Test all keyboard shortcuts (Space, R, ↑/↓, L, Esc)
11. ✅ Test window positioning presets
12. ✅ Test mirror mode (if you have beam-splitter glass)
13. ✅ Adjust transparency and verify see-through effect

### Regression Testing
14. ✅ Test that previous features still work
15. ✅ Check for any new UI glitches
16. ✅ Verify performance (smooth scrolling, no lag)

## Reporting Issues

Found a bug or regression? Report it on [GitHub Issues](https://github.com/jatinkrmalik/pmptr/issues) with:

- **Title**: Include "Nightly {{ date }}" prefix
- **Build info**: Commit `{{ commit_sha }}`
- **Platform**: Your OS and version
- **Steps to reproduce**: What you were doing when the issue occurred
- **Expected vs actual**: What should happen vs what did happen
- **Screenshots/logs**: If applicable

## Nightly Build Policy

- Nightly builds run automatically at 00:00 UTC
- Only the **last 3 nightly builds** are retained (older ones are auto-deleted)
- These builds are **not signed** and should not be used in production
- Use nightlies to test new features and catch bugs early

## Installation Notes

### Linux
```bash
# For AppImage
chmod +x pmptr-nightly-linux.AppImage
./pmptr-nightly-linux.AppImage

# For .deb
sudo dpkg -i pmptr-nightly-linux_amd64.deb
```

### macOS
```bash
# Mount the DMG and drag to Applications
open pmptr-nightly-mac.dmg
```

### Windows
```powershell
# Run the installer
.\pmptr-nightly-windows.exe
```

## Recent Changes

Check the [commit log](https://github.com/jatinkrmalik/pmptr/commits/{{ branch }}) for the latest changes included in this build.

---

**Note**: This is an automated nightly build. For stable releases, check the [Releases page](https://github.com/jatinkrmalik/pmptr/releases).
