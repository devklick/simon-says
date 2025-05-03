import Gtk from "@girs/gtk-4.0";
import GObject from "@girs/gobject-2.0";
import GLib from "@girs/glib-2.0";

import Observable from "../../core/Observable";

type GameButtonColor = "red" | "blue" | "green" | "yellow";
type GameButtonStatus = "idle" | "flash" | "flash-incorrect" | "flash-correct";

interface GameButtonParams {
  color: GameButtonColor;
}

export default class GameButton extends Gtk.Button {
  static {
    GObject.registerClass({ GTypeName: "GameButton" }, this);
  }
  constructor({ color }: GameButtonParams) {
    super({
      cssClasses: [`button-${color}`],
      widthRequest: 80,
      heightRequest: 80,
      opacity: 0.5,
      name: `game-button-${color}`,
    });
  }
}
