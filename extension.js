import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { EffectType } from './effects.js';
import { ParticleEngine } from './particle-engine.js';

export default class WindowParticlesExtension extends Extension {
  enable() {
    this.particleEngine = new ParticleEngine();
    this.currentEffect = EffectType.SPARKLES; // Default effect
    this._windowSignals = new Map();

    this._windowCreatedId = global.display.connect(
      'window-created',
      this._onWindowCreated.bind(this)
    );

    for (const windowActor of global.get_window_actors())
      this._trackWindow(windowActor.meta_window);
    
    log('[Window Particles] Extension enabled with effect: ' + this.currentEffect);
  }

  disable() {
    if (this._windowCreatedId) {
      global.display.disconnect(this._windowCreatedId);
      this._windowCreatedId = null;
    }

    for (const [window, signalId] of this._windowSignals) {
      if (window && signalId)
        window.disconnect(signalId);
    }
    this._windowSignals.clear();
    
    if (this.particleEngine) {
      this.particleEngine.cleanup();
      this.particleEngine = null;
    }
    
    log('[Window Particles] Extension disabled');
  }

  _onWindowCreated(display, window) {
    this._trackWindow(window);
  }

  _trackWindow(window) {
    if (!window || this._windowSignals.has(window))
      return;

    const signalId = window.connect('unmanaged', () => {
      this._windowSignals.delete(window);
      this._onWindowClosed(window);
    });

    this._windowSignals.set(window, signalId);
  }

  _onWindowClosed(window) {
    const frameRect = window.get_frame_rect();
    const centerX = frameRect.x + frameRect.width / 2;
    const centerY = frameRect.y + frameRect.height / 2;

    this.particleEngine.spawnEffect(centerX, centerY, this.currentEffect);
  }
}
