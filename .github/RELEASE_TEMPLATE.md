# pmptr {{ version }}

> A minimal virtual teleprompter that lives as a transparent, always-on-top, click-through overlay.

## What's New in {{ version }}

{{ changelog }}

## Downloads

Choose the appropriate installer for your platform:

### 🐧 Linux
- **pmptr-{{ version }}.AppImage** - Universal Linux binary (recommended)
  - Make it executable: `chmod +x pmptr-{{ version }}.AppImage`
  - Run: `./pmptr-{{ version }}.AppImage`
- **pmptr_{{ version }}}_amd64.deb** - Debian/Ubuntu package
  - Install: `sudo dpkg -i pmptr_{{ version }}}_amd64.deb`

### 🍎 macOS
- **pmptr-{{ version }}-arm64.dmg** - Apple Silicon (M1/M2/M3)
- **pmptr-{{ version }}.dmg** - Intel-based Macs
  - Open the DMG and drag pmptr to Applications
  - First launch: Right-click → Open (to bypass Gatekeeper)

### 🪟 Windows
- **pmptr-{{ version }}-x64.exe** - 64-bit Windows installer
  - Run the installer and follow the prompts
  - Windows SmartScreen: Click "More info" → "Run anyway"

## Testing Steps

After installation, verify the following works:

### Basic Functionality
1. ✅ **Launch pmptr** - Control window should appear
2. ✅ **Paste a script** in the control window's text area
3. ✅ **Click "Open floating prompter"** - Transparent overlay should appear
4. ✅ **Verify scrolling** - Text should scroll upward at the set speed
5. ✅ **Adjust speed** - Use the speed slider, verify changes apply
6. ✅ **Test pause/resume** - Click the pause button or press Space
7. ✅ **Reset scroll** - Click reset or press R, text should return to start

### Advanced Features
8. ✅ **Toggle click-through** - Click the lock button, verify clicks pass through to apps behind
9. ✅ **Test transparency** - Adjust opacity slider, verify see-through effect
10. ✅ **Window controls** - Drag the window, resize it, try position presets
11. ✅ **Settings persistence** - Close and reopen, verify settings are saved
12. ✅ **Keyboard shortcuts** - Test Space, R, ↑/↓, L, Esc

### Platform-Specific Tests

**Linux:**
- Verify always-on-top works in your desktop environment
- Test on X11 and Wayland (if applicable)
- Check that the AppImage runs on different distros

**macOS:**
- Grant Accessibility permissions if prompted (System Settings → Privacy & Security)
- Test on Apple Silicon and Intel if possible
- Verify the app appears in the menu bar

**Windows:**
- Test installer on Windows 10 and 11
- Verify the app starts on boot (if applicable)
- Check that notifications work

## Known Issues

- **Wayland**: Click-through behavior may vary by compositor (see README)
- **macOS**: May require Accessibility/Screen Recording permissions
- **All platforms**: App is not code-signed; expect OS warnings on first launch

## System Requirements

- **Linux**: glibc 2.31+, X11 or Wayland with XWayland
- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10 (1809) or later

## Reporting Issues

Found a bug? Please report it on our [GitHub Issues](https://github.com/jatinkrmalik/pmptr/issues) page with:
- Your OS and version
- pmptr version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable

## What's Next

Check out the [README](https://github.com/jatinkrmalik/pmptr#readme) for full documentation and upcoming features.

---

**Full Changelog**: https://github.com/jatinkrmalik/pmptr/compare/{{ previous_version }}...{{ version }}
