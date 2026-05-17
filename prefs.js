const { Adw, Gtk, Gio, GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { EffectType } = Me.imports['effects'];

var PrefsWidget = GObject.registerClass(
  class PrefsWidget extends Adw.PreferencesPage {
    _init() {
      super._init({
        title: 'Window Particle Effects',
        icon_name: 'preferences-system-symbolic',
      });

      // Create settings if available
      this._loadSettings();

      // Effect selection group
      const effectGroup = new Adw.PreferencesGroup({
        title: 'Particle Effect',
        description: 'Choose which particle effect to display when closing windows',
      });

      const effectRow = new Adw.ComboBoxRow({
        title: 'Effect Type',
      });

      // Create effect model
      const effectModel = new Gtk.StringList();
      const effects = [
        { id: EffectType.SPARKLES, label: '✨ Sparkles' },
        { id: EffectType.CONFETTI, label: '🎉 Confetti' },
        { id: EffectType.SMOKE, label: '💨 Smoke' },
        { id: EffectType.EXPLOSION, label: '💥 Explosion' },
        { id: EffectType.RAINBOW, label: '🌈 Rainbow' },
      ];

      effects.forEach(effect => {
        effectModel.append(effect.label);
      });

      effectRow.set_model(effectModel);

      // Set current effect
      if (this.settings) {
        const currentEffect = this.settings.get_string('effect-type');
        const index = effects.findIndex(e => e.id === currentEffect);
        if (index >= 0) {
          effectRow.set_selected(index);
        }
      }

      // Connect to changes
      effectRow.connect('notify::selected-item', (row) => {
        const selected = effects[row.get_selected()];
        if (this.settings && selected) {
          this.settings.set_string('effect-type', selected.id);
        }
      });

      effectGroup.add(effectRow);
      this.add(effectGroup);

      // Browser exclusion info
      const appGroup = new Adw.PreferencesGroup({
        title: 'App Exclusions',
        description: 'Effect is automatically disabled for browsers and tab-based apps',
      });

      const blockedAppsRow = new Adw.ActionRow({
        title: 'Excluded Applications',
        subtitle: 'Firefox, Chrome, Brave, and other browsers',
      });

      appGroup.add(blockedAppsRow);
      this.add(appGroup);

      // Info
      const infoGroup = new Adw.PreferencesGroup({
        title: 'About',
      });

      const infoRow = new Adw.ActionRow({
        title: 'Window Particle Effects',
        subtitle: 'v0.2.0 - Satisfying particles when closing windows',
      });

      infoGroup.add(infoRow);
      this.add(infoGroup);
    }

    _loadSettings() {
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
          }
        }
      } catch (e) {
        log('[Window Particles] Could not load settings: ' + e);
      }
    }
  }
);

function fillPreferencesWindow(window) {
  let prefs = new PrefsWidget();
  window.add(prefs);
}
