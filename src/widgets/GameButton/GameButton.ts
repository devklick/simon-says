import Gtk from "@girs/gtk-4.0";
import GObject from "@girs/gobject-2.0";

import { ButtonColor } from "../../core/CoreGameButton";

interface GameButtonParams {
  color: ButtonColor;
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
