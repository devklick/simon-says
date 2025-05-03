import Adw from "@girs/adw-1";
import GObject from "@girs/gobject-2.0";
import Gio from "@girs/gio-2.0";
import Gtk from "@girs/gtk-4.0";
import Gdk from "@girs/gdk-4.0";
import { exit } from "@girs/gjs/system";

import Window from "../Window";
import CoreGame from "../../core/CoreGame";
import CoreGameButton, { AllButtonColors } from "../../core/CoreGameButton";

import styles from "../../styles.css?inline";

const APPLICATION_ID = "com.devklick.simon-says";

export default class Application extends Adw.Application {
  public readonly name = "Simon Says";

  static {
    Adw.init();
    GObject.registerClass({ GTypeName: "Application" }, this);
  }

  private _window: Window | null = null;
  public readonly game: Readonly<CoreGame>;

  private get window(): Window {
    this._window ??= new Window(this);
    return this._window;
  }

  constructor() {
    super({
      applicationId: APPLICATION_ID,
      flags: Gio.ApplicationFlags.FLAGS_NONE,
    });

    this.game = new CoreGame({
      buttons: AllButtonColors.map((color) => new CoreGameButton({ color })),
    });
  }

  override vfunc_activate(): void {
    super.vfunc_activate();
    this.initStyles();
    this.window.present();
  }

  private initStyles(): void {
    const cssProvider = new Gtk.CssProvider();
    cssProvider.load_from_string(styles);

    const display = Gdk.Display.get_default();

    if (!display) {
      console.error("No display found");
      return exit(1);
    }

    Gtk.StyleContext.add_provider_for_display(
      display,
      cssProvider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );
  }
}
