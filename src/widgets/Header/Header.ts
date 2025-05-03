import Adw from "@girs/adw-1";
import GObject from "@girs/gobject-2.0";
import Gtk from "@girs/gtk-4.0";

interface HeaderParams {
  appName: string;
}

export default class Header extends Adw.Bin {
  static {
    GObject.registerClass({ GTypeName: "Header" }, this);
  }

  private readonly _adwHeader: Adw.HeaderBar;

  constructor({ appName }: HeaderParams) {
    super({ name: "header-wrapper" });
    const titleWidget = new Gtk.Label({ label: appName, name: "title" });
    this._adwHeader = new Adw.HeaderBar({ titleWidget, name: "header" });
    this.set_child(this._adwHeader);
  }
}
