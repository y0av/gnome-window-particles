const { Extension } = imports.misc.extensionUtils;
const GLib = imports.gi.GLib;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const ParticleEngine = Me.imports['particle-engine'].ParticleEngine;
const { EffectType } = Me.imports['effects'];

var WindowParticlesExtension = class extends Extension {
  enable() {
    this.particleEngine = new ParticleEngine();
    this.currentEffect = EffectType.SPARKLES; // Default effect

    this._windowClosedId = global.display.connect(
      'window-closed',
      this._onWindowClosed.bind(this)
    );
    
    console.log('[Window Particles] Extension enabled with effect:', this.currentEffect);
  }

  disable() {
    if (this._windowClosedId) {
      global.display.disconnect(this._windowClosedId);
    }
    
    if (this.particleEngine) {
      this.particleEngine.cleanup();
    }
    
    console.log('[Window Particles] Extension disabled');
  }

  _onWindowClosed(display, window) {
    const [x, y, width, height] = window.get_frame_rect();
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    this.particleEngine.spawnEffect(centerX, centerY, this.currentEffect);
  }
};

function init() {
  return new WindowParticlesExtension();
}
