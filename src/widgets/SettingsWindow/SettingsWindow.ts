import Adw from "@girs/adw-1";
import Gio from "@girs/gio-2.0";
import Gtk from "@girs/gtk-4.0";
import Application from "../Application";
import GObject from "@girs/gobject-2.0";

interface SettingsWindowParams {
  application: Application;
  settings: Gio.Settings;
}

// TODO: Tidy this up...

export default class SettingsWindow extends Adw.PreferencesWindow {
  static {
    GObject.registerClass({ GTypeName: "SettingsWindow" }, this);
  }

  private readonly settings: Gio.Settings;
  private readonly audioSwitch: Gtk.Switch;
  private readonly speedSlider: Gtk.Scale;

  constructor({ application, settings }: SettingsWindowParams) {
    super({ application, title: "Settings" });
    this.settings = settings;
    this.audioSwitch = new Gtk.Switch({ valign: Gtk.Align.CENTER });
    this.speedSlider = new Gtk.Scale({
      orientation: Gtk.Orientation.HORIZONTAL,
      adjustment: new Gtk.Adjustment({
        lower: -100,
        upper: 100,
        stepIncrement: 1,
        pageIncrement: 10,
        value: 0,
      }),
      hexpand: true,
      valuePos: Gtk.PositionType.RIGHT,
      widthRequest: 50,
    });

    const page = new Adw.PreferencesPage({ title: "General" });
    this.add(page);

    const audioGroup = new Adw.PreferencesGroup({ title: "Audio" });
    const audioRow = new Adw.ActionRow({
      title: "Enable Audio",
      subtitle: "Play sound effects during gameplay",
    });
    audioRow.add_suffix(this.audioSwitch);
    audioGroup.add(audioRow);

    const speedGroup = new Adw.PreferencesGroup({ title: "Speed" });
    const speedRow = new Adw.ActionRow({
      title: "Game Speed",
      subtitle: "How fast or slow the patterns are played",
    });

    speedRow.add_suffix(this.speedSlider);
    speedGroup.add(speedRow);

    page.add(audioGroup);
    page.add(speedGroup);

    this.audioSwitch.set_active(this.settings.get_boolean("audio-enabled"));
    this.audioSwitch.connect("notify::active", () => {
      this.settings.set_boolean("audio-enabled", this.audioSwitch.get_active());
    });

    this.speedSlider.set_value(this.settings.get_int("game-speed"));
    this.speedSlider.connect("value-changed", () => {
      console.log("Speed", this.settings.get_int("game-speed"));
      this.settings.set_int("game-speed", this.speedSlider.get_value());
    });
  }

  vfunc_close_request(): boolean {
    this.hide();
    return true;
  }
}
