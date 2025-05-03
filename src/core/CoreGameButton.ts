import GLib from "@girs/glib-2.0";
import Observable from "./Observable";

export type GameButtonStatus =
  | "idle"
  | "flash"
  | "flash-correct"
  | "flash-incorrect";

export const ButtonColors = {
  red: "red",
  blue: "blue",
  green: "green",
  purple: "purple",
} as const;

export const AllButtonColors = Object.values(
  ButtonColors
) as ReadonlyArray<ButtonColor>;

export type ButtonColor = (typeof ButtonColors)[keyof typeof ButtonColors];

interface CoreGameButtonParams {
  color: ButtonColor;
}

class GameButton {
  private readonly _color: ButtonColor;
  private readonly _status = new Observable<GameButtonStatus>("idle");

  public get color() {
    return this._color;
  }

  public get status() {
    return this._status;
  }

  constructor({ color }: CoreGameButtonParams) {
    this._color = color;
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
