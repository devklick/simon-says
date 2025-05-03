import GLib from "@girs/glib-2.0";
import Observable from "./Observable";

export type GameButtonStatus =
  | "idle"
  | "flash"
  | "flash-correct"
  | "flash-incorrect";

export type ButtonColor = "red" | "blue" | "green" | "purple";

interface CoreGameButtonParams {
  color: ButtonColor;
}

class GameButton {
  color: ButtonColor;
  status: Observable<GameButtonStatus>;

  constructor({ color }: CoreGameButtonParams) {
    this.color = color;
    this.status = new Observable<GameButtonStatus>("idle");
  }

  public flash(
    type: Exclude<GameButtonStatus, "idle"> = "flash",
    duration = 300
  ) {
    this.status.value = type;

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration, () => {
      this.status.value = "idle";
      return false;
    });
  }
}
export default GameButton;
