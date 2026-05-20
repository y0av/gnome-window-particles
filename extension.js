import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import { EffectType } from './effects.js';
import { ParticleEngine } from './particle-engine.js';

const HANDLED_WINDOW_TYPES = new Set([
  Meta.WindowType.NORMAL,
  Meta.WindowType.DIALOG,
  Meta.WindowType.MODAL_DIALOG,
  Meta.WindowType.UTILITY,
]);

const BROWSER_APP_PATTERNS = [
  'brave',
  'chrome',
  'chromium',
  'edge',
  'firefox',
  'google-chrome',
  'microsoft-edge',
  'navigator',
  'opera',
  'vivaldi',
];

export default class WindowParticlesExtension extends Extension {
  enable() {
    this.particleEngine = new ParticleEngine();
    this.currentEffect = EffectType.SPARKLES; // Default effect
    this._windowSignals = new Map();
    
    // Initialize settings
    this._initSettings();

    this._windowCreatedId = global.display.connect(
      'window-created',
      this._onWindowCreated.bind(this)
    );

    for (const windowActor of global.get_window_actors())
      this._trackWindow(windowActor.meta_window);
    
    
    // Load saved effect type from settings
    if (this._settings) {
      const savedEffect = this._settings.get_string('effect-type');
      if (savedEffect && Object.values(EffectType).includes(savedEffect)) {
        this.currentEffect = savedEffect;
      }
    }
    
    log('[Window Particles] Extension enabled with effect: ' + this.currentEffect);
  }
  
  _initSettings() {
    try {
      const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
        this.path + '/schemas',
        Gio.SettingsSchemaSource.get_default(),
        false
      );
      
      if (schemaSource) {
        const schema = schemaSource.lookup(
          'org.gnome.shell.extensions.window-particles',
          false
        );
        
        if (schema) {
          this._settings = new Gio.Settings({
            settings_schema: schema,
          });
          
          // Listen for effect changes
          this._settings.connect('changed::effect-type', () => {
            const newEffect = this._settings.get_string('effect-type');
            if (newEffect && Object.values(EffectType).includes(newEffect)) {
              this.currentEffect = newEffect;
              log('[Window Particles] Effect changed to: ' + this.currentEffect);
            }
          });
        }
      }
    } catch (e) {
      log('[Window Particles] Error loading settings: ' + e);
    }
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
    if (!this._shouldTrackWindow(window) || this._windowSignals.has(window))
      return;

    const signalId = window.connect('unmanaged', () => {
      this._windowSignals.delete(window);
      this._onWindowClosed(window);
    });

    this._windowSignals.set(window, signalId);
  }

  _onWindowClosed(window) {
    if (!this._shouldAnimateWindow(window))
      return;

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

  _shouldTrackWindow(window) {
    return window && HANDLED_WINDOW_TYPES.has(window.get_window_type());
  }

  _shouldAnimateWindow(window) {
    if (!this._shouldTrackWindow(window))
      return false;

    if (window.is_skip_taskbar())
      return false;

    const transientParent = window.get_transient_for();
    if (transientParent)
      return false;

    if (this._isBrowserWindow(window))
      return window.get_window_type() === Meta.WindowType.NORMAL;

    return true;
  }

  _isBrowserWindow(window) {
    const wmClass = window.get_wm_class()?.toLowerCase();
    return BROWSER_APP_PATTERNS.some(pattern => wmClass?.includes(pattern));
  }

  _isBlacklisted(wmClass) {
    const blacklist = this._getBlacklist();
    const normalizedClass = wmClass?.toLowerCase();
    return blacklist.some(pattern => normalizedClass?.includes(pattern));
  }

  _getBlacklist() {
    let custom = '';
    
    if (this._settings) {
      custom = this._settings.get_string('browser-blacklist') || '';
    }
    
    return custom
      .split(',')
      .map(pattern => pattern.trim().toLowerCase())
      .filter(pattern => pattern);
  }
}
