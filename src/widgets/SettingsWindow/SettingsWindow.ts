import Adw from "@girs/adw-1";
import Gio from "@girs/gio-2.0";
import Gtk from "@girs/gtk-4.0";
import Application from "../Application";
import GObject from "@girs/gobject-2.0";

interface SettingsWindowParams {
  application: Application;
  settings: Gio.Settings;
}

export default class SettingsWindow extends Adw.PreferencesWindow {
  static {
    GObject.registerClass({ GTypeName: "SettingsWindow" }, this);
  }

  private readonly settings: Gio.Settings;
  private readonly audioSwitch: Gtk.Switch;

  constructor({ application, settings }: SettingsWindowParams) {
    super({ application, title: "Settings" });
    this.settings = settings;

    const page = new Adw.PreferencesPage({ title: "General" });

    const group = new Adw.PreferencesGroup();
    group.set_title("Audio");

    const row = new Adw.ActionRow({
      title: "Enable Audio",
      subtitle: "Play sound effects during gameplay",
    });

    this.audioSwitch = new Gtk.Switch({ valign: Gtk.Align.CENTER });
    row.add_suffix(this.audioSwitch);
    group.add(row);

    this.audioSwitch.set_active(this.settings.get_boolean("audio-enabled"));

    this.audioSwitch.connect("notify::active", () => {
      this.settings.set_boolean("audio-enabled", this.audioSwitch.get_active());
    });

    page.add(group);

    this.add(page);
  }

  vfunc_close_request(): boolean {
    this.hide();
    return true;
  }
}
