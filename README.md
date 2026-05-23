# Window Particle Effect - GNOME Shell Extension

A delightful GNOME Shell extension that displays satisfying particle effects whenever you close a window.

## Features

- ✨ **Particle Effects** - Sparkles, confetti, explosions, and more
- ⚙️ **Customizable** - Choose effect type, intensity, and appearance
- 🚀 **Performance Optimized** - Lightweight animations that don't impact system
- 🎨 **Visual Themes** - Works seamlessly with GNOME theme

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/ymoop/gnome-window-particles
cd gnome-window-particles
```

2. Install to GNOME extensions directory:
```bash
mkdir -p ~/.local/share/gnome-shell/extensions
cp -r . ~/.local/share/gnome-shell/extensions/gnome-window-particles@yoz.local
```

3. Restart GNOME Shell:
   - Press `Alt+F2`, type `r`, press Enter
   - Or log out and log back in

4. Enable the extension in GNOME Settings → Extensions

### GNOME 45/46 note

GNOME Shell 45+ loads extensions as ES modules. This repository now uses the required module-style imports for GNOME 45/46 as declared in `metadata.json`.

## Development

### Project Structure
```
.
├── metadata.json       # Extension metadata
├── extension.js        # Main extension logic
├── particle-engine.js  # Particle system
├── effects.js          # Effect definitions
├── prefs.js            # Preferences dialog
└── README.md           # This file
```

### Building

No build step required! Changes take effect after GNOME Shell restart.

### Testing

1. Enable extension in GNOME Settings
2. Close any window to see the effect
3. Check logs: `journalctl /usr/bin/gnome-shell -f`

### Testing Different Effects

To test each effect type:

1. Install extension (see Installation section)
2. Enable it in GNOME Settings → Extensions
3. Open and close windows to trigger effects:
   - **Sparkles** (default) – Gentle golden particles burst outward
   - **Confetti** – Colorful squares with rotation and gravity
   - **Smoke** – Gray particles floating upward
   - **Explosion** – Fast particles bursting in all directions with scaling
   - **Rainbow** – Colorful stars with variety of motion patterns

4. Switch effects via prefs:
   - Right-click extension icon → Preferences
   - Select different effect type
   - Close any window to see the new effect

### Physics Tuning Notes

**Gravity Effect:** Each effect can include `gravity` parameter which causes particles to accelerate downward during animation. The physics calculation accounts for the animation duration:
- `gravity: 0` – No gravity (sparkles float freely)
- `gravity: 150-200` – Medium gravity (rainbow, explosion)
- `gravity: 220+` – Strong gravity (confetti falls naturally)

**Scale Effect:** Controls particle size change during animation:
- `scale: 1.5` – Particles grow (smoke effect)
- `scale: 0.3` – Particles shrink (explosion effect)
- Undefined – Particles maintain size

**Performance:** Currently limited to 300 active particles max. This prevents lag when closing multiple windows rapidly. Adjust `maxParticles` in `particle-engine.js` if needed.

### Debugging

```bash
# Monitor extension logs in real-time
journalctl /usr/bin/gnome-shell -f

# Restart GNOME Shell to reload extension changes
altf2; r

# View extension state
gsettings get org.gnome.shell.extensions.window-particles effect-type
```

## Contributing

Contributions welcome! Please open issues or PRs for:
- New particle effect ideas
- Performance improvements
- Bug fixes
- Translation additions

## License

GPL-3.0+

## Roadmap

- [ ] Multiple effect types (explosion, confetti, sparkles, smoke, rainbow)
- [ ] Customizable colors and intensity
- [ ] Preferences UI
- [ ] Sound effects (optional)
- [ ] Different effects per window type
- [ ] Performance metrics
