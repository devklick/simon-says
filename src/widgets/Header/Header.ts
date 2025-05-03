import Adw from "@girs/adw-1";
import Gio from "@girs/gio-2.0";
import GObject from "@girs/gobject-2.0";
import Gtk from "@girs/gtk-4.0";

interface HeaderParams {
  appName: string;
  /**
   * A map of the actions registered in the application.
   *
   * Required for launching the SettingsWindow.
   */
  actionMap: Gio.ActionMap;
}

export default class Header extends Adw.Bin {
  static {
    GObject.registerClass({ GTypeName: "Header" }, this);
  }

  private readonly _adwHeader: Adw.HeaderBar;

  constructor({ appName, actionMap }: HeaderParams) {
    super({ name: "header-wrapper" });
    const titleWidget = new Gtk.Label({ label: appName, name: "title" });
    this._adwHeader = new Adw.HeaderBar({ titleWidget, name: "header" });

    const menuModel = new Gio.Menu();
    menuModel.append("Settings", "app.settings");

    const settingsButton = new Gtk.Button({
      icon_name: "emblem-system-symbolic",
    });

    settingsButton.connect("clicked", () =>
      actionMap.lookup_action("settings")?.activate(null)
    );

    this._adwHeader.pack_start(settingsButton);

    this.set_child(this._adwHeader);
  }
}
