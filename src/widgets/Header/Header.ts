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

  private _adwHeader: Adw.HeaderBar;

  constructor({ appName }: HeaderParams) {
    super();
    const titleWidget = new Gtk.Label({ label: appName });
    this._adwHeader = new Adw.HeaderBar({ titleWidget });
    this.set_child(this._adwHeader);
  }
}
