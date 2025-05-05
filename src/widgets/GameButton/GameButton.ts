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
  private readonly _correctIcon: Gtk.Image;
  private readonly _incorrectIcon: Gtk.Image;
  private readonly _color: ButtonColor;
  private _audioEnabled: boolean;

  constructor({ color, settings }: GameButtonParams) {
    super({
      cssClasses: [`button-${color}`],
      widthRequest: 80,
      heightRequest: 80,
      opacity: 0.5,
      name: `game-button-${color}`,
    });
    this._color = color;
    this._audioEnabled = settings.get_boolean("audio-enabled");

    settings.connect("changed", () => {
      this._audioEnabled = settings.get_boolean("audio-enabled");
    });

    this._correctIcon = new Gtk.Image({
      iconName: "dialog-ok-symbolic",
      pixelSize: 48,
    });
    this._incorrectIcon = new Gtk.Image({
      iconName: "process-stop",
      pixelSize: 48,
    });
  }

  public startFlash(status: GameButtonStatus): void {
    this.set_opacity(1);

    this.playAudio(status === "flash" || status === "flash-correct");

    // depending on the type of flash, display the appropriate icon
    if (status === "flash-correct") {
      this.set_child(this._correctIcon);
    } else if (status === "flash-incorrect") {
      this.set_child(this._incorrectIcon);
    }
  }

  public endFlash(): void {
    this.set_opacity(0.5);
    this.set_child(null);
  }

  private createAudioPlayer(audioFileName: string): Gst.Element | null {
    const audioPath = GLib.build_filenamev([
      GLib.get_current_dir(),
      `resources/audio/${audioFileName}`,
    ]);
    const uri = `file://${audioPath}`;
    const player = Gst.ElementFactory.make("playbin", null);
    player?.set_property("uri", uri);
    return player;
  }

  private playAudio(correct: boolean) {
    if (!this._audioEnabled) return;
    // Create an audio player to play the sound relevant to this scenario.
    const audioFileName = `${this._color}${correct ? "" : "-incorrect"}.mp3`;
    const player = this.createAudioPlayer(audioFileName);
    if (!player) return;

    const bus = player.get_bus();
    if (!bus) return;

    // Listen for signals coming from the player to perform cleanup actions
    bus.add_signal_watch();
    bus.connect("message", (_, message) => {
      switch (message.type) {
        // Playback has ended, so dispose of this player
        case Gst.MessageType.EOS:
          player.set_state(Gst.State.NULL);
          player.unref();
          break;

        // Playback hit an error, log it and dispose
        case Gst.MessageType.ERROR:
          const [, err] = message.parse_error();
          console.error("Playback error:", err);
          player.set_state(Gst.State.NULL);
          player.unref();
          break;
      }
    });
    // Play the sound
    player.set_state(Gst.State.PLAYING);
  }
}
