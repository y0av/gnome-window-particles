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
    // Check if window is blacklisted
    const wmClass = window.get_wm_class();
    if (this._isBlacklisted(wmClass)) {
      return;
    }

    const frameRect = window.get_frame_rect();
    // Spawn from entire window area for explosion effect
    this.particleEngine.spawnEffect(
      frameRect.x,
      frameRect.y,
      frameRect.width,
      frameRect.height,
      this.currentEffect
    );
  }

  _isBlacklisted(wmClass) {
    const blacklist = this._getBlacklist();
    return blacklist.some((pattern) => wmClass?.includes(pattern));
  }

  _getBlacklist() {
    // Default browser blacklist
    const settings = this.getSettings();
    const custom = settings.get_string('browser-blacklist') || '';
    const defaults = ['firefox', 'chromium', 'google-chrome'];
    const customList = custom.split(',').map((s) => s.trim()).filter((s) => s);
    return [...defaults, ...customList];
  }
}
