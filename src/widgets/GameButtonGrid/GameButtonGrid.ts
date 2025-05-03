import Gtk from "@girs/gtk-4.0";
import GObject from "@girs/gobject-2.0";

import GameButton from "../GameButton";

interface GameButtonGridParams {
  buttons: Array<GameButton>;
}

export default class GameButtonGrid extends Gtk.Box {
  static {
    GObject.registerClass({ GTypeName: "GameButtonGrid" }, this);
  }

  constructor({ buttons }: GameButtonGridParams) {
    super({
      orientation: Gtk.Orientation.VERTICAL,
      valign: Gtk.Align.CENTER,
      spacing: 12,
      name: "game-button-grid",
    });

    this.appendRowItems(...buttons.slice(0, 2));
    this.appendRowItems(...buttons.slice(2, 4));
  }

  private appendRowItems(...items: Array<Gtk.Widget>) {
    const row = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      halign: Gtk.Align.CENTER,
      spacing: 12,
      homogeneous: true,
    });

    for (const item of items) {
      row.append(item);
    }

    this.append(row);
  }
}
