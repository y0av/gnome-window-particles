import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { EffectType } from './effects.js';

export default class WindowParticlesPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();
    const page = new Adw.PreferencesPage({
      title: 'Window Particle Effects',
      icon_name: 'preferences-system-symbolic',
    });

    const effectGroup = new Adw.PreferencesGroup({
      title: 'Particle Effect',
      description: 'Choose which particle effect to display when closing windows',
    });

    const effectRow = new Adw.ComboBoxRow({
      title: 'Effect Type',
    });

    const effectModel = new Gtk.StringList();
    const effects = [
      { id: EffectType.SPARKLES, label: 'Sparkles' },
      { id: EffectType.CONFETTI, label: 'Confetti' },
      { id: EffectType.SMOKE, label: 'Smoke' },
      { id: EffectType.EXPLOSION, label: 'Explosion' },
      { id: EffectType.RAINBOW, label: 'Rainbow' },
    ];

    effects.forEach(effect => effectModel.append(effect.label));
    effectRow.set_model(effectModel);

    const currentEffect = settings.get_string('effect-type');
    const currentIndex = effects.findIndex(effect => effect.id === currentEffect);
    effectRow.set_selected(currentIndex >= 0 ? currentIndex : 0);

    effectRow.connect('notify::selected', row => {
      const selectedEffect = effects[row.get_selected()];
      if (selectedEffect)
        settings.set_string('effect-type', selectedEffect.id);
    });

    effectGroup.add(effectRow);
    page.add(effectGroup);

    const appGroup = new Adw.PreferencesGroup({
      title: 'App Exclusions',
      description: 'Automatically disable effect for certain apps',
    });

    const blacklistHelp = new Adw.ActionRow({
      title: 'Browser Blacklist',
      subtitle: 'Comma-separated app class names (e.g., firefox,chromium)',
    });

    const blacklistRow = new Adw.EntryRow({
      title: 'Excluded Apps',
      text: settings.get_string('browser-blacklist'),
    });

    blacklistRow.connect('notify::text', row => {
      settings.set_string('browser-blacklist', row.get_text());
    });

    appGroup.add(blacklistHelp);
    appGroup.add(blacklistRow);
    page.add(appGroup);

    const infoGroup = new Adw.PreferencesGroup({
      title: 'About',
    });

    infoGroup.add(new Adw.ActionRow({
      title: 'Window Particle Effects',
      subtitle: 'v0.2.0 - Satisfying particles when closing windows',
    }));
    page.add(infoGroup);

    window.add(page);
  }
}
