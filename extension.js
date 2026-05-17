import Meta from 'gi://Meta';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

const { Extension } = imports.misc.extensionUtils;

export default class WindowParticlesExtension extends Extension {
  enable() {
    this._windowClosedId = global.display.connect(
      'window-closed',
      this._onWindowClosed.bind(this)
    );
    
    console.log('[Window Particles] Extension enabled');
  }

  disable() {
    if (this._windowClosedId) {
      global.display.disconnect(this._windowClosedId);
    }
    console.log('[Window Particles] Extension disabled');
  }

  _onWindowClosed(display, window) {
    const [x, y, width, height] = window.get_frame_rect();
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    this._createParticleEffect(centerX, centerY);
  }

  _createParticleEffect(x, y) {
    // Placeholder: Create 20 particles at window close position
    for (let i = 0; i < 20; i++) {
      const particle = new St.Label({
        text: '✨',
        style_class: 'particle',
      });

      global.stage.add_child(particle);
      particle.set_position(x, y);

      // Simple animation: move outward and fade out
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 150 + Math.random() * 100;
      const duration = 800 + Math.random() * 400;

      const targetX = x + Math.cos(angle) * velocity;
      const targetY = y + Math.sin(angle) * velocity - 100;

      particle.ease({
        x: targetX,
        y: targetY,
        opacity: 0,
        duration,
        mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
        onComplete: () => global.stage.remove_child(particle),
      });
    }
  }
}
