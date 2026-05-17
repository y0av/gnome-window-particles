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
