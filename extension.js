const { Extension } = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const ParticleEngine = Me.imports['particle-engine'].ParticleEngine;
const EffectType = Me.imports['effects'].EffectType;

var WindowParticlesExtension = class extends Extension {
  enable() {
    this.particleEngine = new ParticleEngine();
    
    // Load settings
    this._loadSettings();
    
    this._windowClosedId = global.display.connect(
      'window-closed',
      this._onWindowClosed.bind(this)
    );
    
    log('[Window Particles] Extension enabled with effect: ' + this.currentEffect);
  }

  _loadSettings() {
    // Try to load from settings, fall back to default
    try {
      const schemaSource = Gio.SettingsSchemaSource.new_from_directory(
        Me.path + '/schemas',
        Gio.SettingsSchemaSource.get_default(),
        false
      );
      if (schemaSource) {
        const schema = schemaSource.lookup(
          'org.gnome.shell.extensions.window-particles',
          false
        );
        if (schema) {
          this.settings = new Gio.Settings({
            settings_schema: schema,
          });
          this.currentEffect = this.settings.get_string('effect-type');
          this.enabledApps = this.settings.get_string('enabled-apps');
          return;
        }
      }
    } catch (e) {
      log('[Window Particles] Settings schema not found: ' + e);
    }
    
    // Fallback defaults
    this.currentEffect = EffectType.EXPLOSION;
    this.enabledApps = 'all'; // 'all' or comma-separated list
  }

  _isAppAllowed(window) {
    if (this.enabledApps === 'all') return true;
    
    const wmClass = window.get_wm_class() || '';
    const appName = window.get_title() || '';
    
    // Blocked apps (browsers, terminals with tab support)
    const blockedApps = [
      'firefox', 'chromium', 'chrome', 'google-chrome',
      'brave', 'vivaldi', 'opera', 'microsoft-edge',
      'epiphany', 'gnome-web'
    ];
    
    const isBlocked = blockedApps.some(app => 
      wmClass.toLowerCase().includes(app) || 
      appName.toLowerCase().includes(app)
    );
    
    return !isBlocked;
  }

  disable() {
    if (this._windowClosedId) {
      global.display.disconnect(this._windowClosedId);
    }
    
    if (this.particleEngine) {
      this.particleEngine.cleanup();
    }
    
    log('[Window Particles] Extension disabled');
  }

  _onWindowClosed(display, window) {
    // Skip if app is not allowed
    if (!this._isAppAllowed(window)) {
      return;
    }
    
    const [x, y, width, height] = window.get_frame_rect();
    
    // Spawn particles across the window area, not just from center
    this.particleEngine.spawnEffect(x, y, width, height, this.currentEffect);
  }
};

function init() {
  return new WindowParticlesExtension();
}
