import Adw from "@girs/adw-1";
import GObject from "@girs/gobject-2.0";
import Gtk from "@girs/gtk-4.0";
import Gio from "@girs/gio-2.0";

import Application from "../Application";
import Header from "../Header";
import Layout from "../Layout";
import CoreGame from "../../core/CoreGame";
import GameButtonGrid from "../GameButtonGrid";
import GameButton from "../GameButton";
import InfoPanel from "../InfoPanel";

interface WindowParams {
  application: Application;
  settings: Gio.Settings;
}

export default class Window extends Adw.ApplicationWindow {
  static {
    GObject.registerClass({ GTypeName: "Window" }, this);
  }

  constructor({ application, settings }: WindowParams) {
    super({
      application,
      defaultHeight: 351,
      defaultWidth: 212,
      resizable: false,
      name: "main-window",
    });

    this.set_content(
      new Layout({
        header: new Header({
          appName: application.name,
          actionMap: application,
        }),
        buttonGrid: this.buildGameButtonGrid(application.game, settings),
        infoPanel: this.buildInfoPanel(application.game),
        startButton: this.buildStartButton(application.game),
      })
    );
  }

  /*
    The following functions to build and hook up the widgets doesnt feel 
    like it belongs in the Window widget. 
    TODO: Revisit these helper functions
  */

  private buildGameButtonGrid(
    game: Readonly<CoreGame>,
    settings: Gio.Settings
  ): GameButtonGrid {
    const buttonWidgets: Array<GameButton> = [];

    for (const [i, button] of game.buttons.entries()) {
      const widget = new GameButton({ color: button.color, settings });
      widget.connect("clicked", () => game.handleButtonClick(i));

      // When the button status indicates a flash, temporarily decrease the opacity
      button.status.subscribeWhen(
        (status) => status.startsWith("flash"),
        (status) => widget.startFlash(status)
      );

      // reset the opacity to half and clear the button icon when the button does back to idle
      button.status.subscribeWhen(
        (status) => status === "idle",
        () => widget.endFlash()
      );

      buttonWidgets.push(widget);
    }

    return new GameButtonGrid({ buttons: buttonWidgets });
  }

  private buildInfoPanel(game: Readonly<CoreGame>): InfoPanel {
    const infoPanel = new InfoPanel();
    game.score.subscribe((score) => infoPanel.updateScore(score));
    return infoPanel;
  }

  private buildStartButton(game: Readonly<CoreGame>): Gtk.Button {
    const button = new Gtk.Button({ label: "Start", name: "start-button" });

    // Start (or restart) the game when the button is pressed
    button.connect("clicked", () => {
      button.set_label("Restart");
      game.start();
    });

    // Reset the button label to Start when game over
    game.status.subscribeWhen(
      (value) => value === "game-over",
      () => button.set_label("Start")
    );

    return button;
  }
}
