import GObject from "@girs/gobject-2.0";
import Gtk from "@girs/gtk-4.0";

export default class InfoPanel extends Gtk.Box {
  static {
    GObject.registerClass({ GTypeName: "InfoPanel" }, this);
  }

  private readonly _scoreLabel: Gtk.Label;

  constructor() {
    super({ halign: Gtk.Align.CENTER });
    this._scoreLabel = new Gtk.Label({ label: "Score: 0" });
    this.append(this._scoreLabel);
  }

  public updateScore(score: number): void {
    this._scoreLabel.set_label(`Score: ${score}`);
  }
}
