import Gtk from "@girs/gtk-4.0";
import GObject from "@girs/gobject-2.0";
import Gst from "@girs/gst-1.0";
import GLib from "@girs/glib-2.0";
import Gio from "@girs/gio-2.0";

import { ButtonColor, GameButtonStatus } from "../../core/CoreGameButton";

interface GameButtonParams {
  color: ButtonColor;
  settings: Gio.Settings;
}

export default class GameButton extends Gtk.Button {
  static {
    GObject.registerClass({ GTypeName: "GameButton" }, this);
  }
  private readonly _audioCorrectPlayer: Gst.Element | null;
  private readonly _audioIncorrectPlayer: Gst.Element | null;
  public _audioEnabled: boolean;

  constructor({ color, settings }: GameButtonParams) {
    super({
      cssClasses: [`button-${color}`],
      widthRequest: 80,
      heightRequest: 80,
      opacity: 0.5,
      name: `game-button-${color}`,
    });
    this._audioCorrectPlayer = this.createAudioPlayer(`${color}.mp3`);
    this._audioIncorrectPlayer = this.createAudioPlayer(
      `${color}-incorrect.mp3`
    );
    this._audioEnabled = settings.get_boolean("audio-enabled");

    settings.connect("changed", () => {
      this._audioEnabled = settings.get_boolean("audio-enabled");
    });
  }

  public startFlash(status: GameButtonStatus): void {
    this.set_opacity(1);

    this.playAudio(status === "flash" || status === "flash-correct");

    // depending on the type of flash, display the appropriate icon
    if (status === "flash-correct") {
      this.set_icon_name("dialog-ok-symbolic");
    } else if (status === "flash-incorrect") {
      this.set_icon_name("process-stop");
    }
  }

  public endFlash(): void {
    this.set_opacity(0.5);
    this.set_icon_name("");
  }

  private createAudioPlayer(audioFileName: string): Gst.Element | null {
    const audioPath = GLib.build_filenamev([
      GLib.get_current_dir(),
      `resources/audio/${audioFileName}`,
    ]);
    const uri = `file://${audioPath}`;
    const player = Gst.ElementFactory.make("playbin", `play-${audioFileName}`);
    player?.set_property("uri", uri);
    return player;
  }

  private playAudio(correct: boolean) {
    if (!this._audioEnabled) return;
    if (correct && this._audioCorrectPlayer) {
      this._audioCorrectPlayer.set_state(Gst.State.NULL);
      this._audioCorrectPlayer.set_state(Gst.State.PLAYING);
    } else if (!correct && this._audioIncorrectPlayer) {
      this._audioIncorrectPlayer.set_state(Gst.State.NULL);
      this._audioIncorrectPlayer.set_state(Gst.State.PLAYING);
    }
  }
}
