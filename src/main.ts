/**
 * GJS example showing how to build javascript applications using Libadwaita Application.
 * @see https://gitlab.gnome.org/GNOME/libadwaita/-/blob/main/examples/hello-world/hello.c
 */

import Gio from "@girs/gio-2.0";
import GLib from "@girs/glib-2.0";
import Gtk from "@girs/gtk-4.0";
import Adw from "@girs/adw-1";
import Gdk from "@girs/gdk-4.0";
import { exit } from "@girs/gjs/system";

import styles from "./styles.css?inline";

import Game from "./Game";
import GameButton from "./GameButton";

const app = new Adw.Application({
  applicationId: "com.github.jumplink.gjs.adw-1-hello",
  flags: Gio.ApplicationFlags.FLAGS_NONE,
});

const initStyles = () => {
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
};

const buildGame = (): Game => {
  return new Game([
    new GameButton("red"),
    new GameButton("blue"),
    new GameButton("green"),
    new GameButton("yellow"),
  ]);
};

const buildButtonWidget = (button: GameButton) => {
  return new Gtk.Button({
    css_classes: [`button-${button.color}`],
    width_request: 80,
    height_request: 80,
    opacity: 0.5,
  });
};

const buildGameButtons = (game: Game): Array<Gtk.Button> => {
  const widgets: Array<Gtk.Button> = [];

  for (const [i, button] of game.buttons.entries()) {
    const widget = buildButtonWidget(button);
    widget.connect("clicked", () => game.handleButtonClick(i));

    // When the button status indicates a flash, temporarily decrease the opacity
    button.status.subscribeWhen(
      (status) => status.startsWith("flash"),
      (status) => {
        widget.set_opacity(1);
        // depending on the type of flash, display the appropriate icon
        if (status === "flash-correct") {
          widget.set_icon_name("dialog-ok-symbolic");
        } else if (status === "flash-incorrect") {
          widget.set_icon_name("process-stop");
        }
      }
    );

    // reset the opacity to half and clear the button icon when the button does back to idle
    button.status.subscribeWhen(
      (status) => status === "idle",
      () => {
        widget.set_opacity(0.5);
        widget.set_icon_name("");
      }
    );

    widgets.push(widget);
  }

  return widgets;
};

const buildLayout = (widgets: Array<Array<Gtk.Widget>>): Gtk.Box => {
  const grid = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    valign: Gtk.Align.CENTER,
    spacing: 12,
    marginTop: 20,
    marginBottom: 20,
    marginStart: 20,
    marginEnd: 20,
  });

  for (const widgetsInRow of widgets) {
    const row = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      halign: Gtk.Align.CENTER,
      spacing: 12,
      homogeneous: false,
    });
    for (const item of widgetsInRow) {
      row.append(item);
    }
    grid.append(row);
  }
  return grid;
};

const buildStartButton = (game: Game) => {
  const button = new Gtk.Button({ label: "Start" });

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
};

const buildScoreLabel = (game: Game) => {
  const label = new Gtk.Label({ label: "Score: 0" });
  game.score.subscribe((score) => {
    label.set_label(`Score: ${score}`);
  });
  return label;
};

const onActivate = (app: Adw.Application) => {
  initStyles();

  const game = buildGame();
  const buttons = buildGameButtons(game);
  const startButton = buildStartButton(game);
  const scoreLabel = buildScoreLabel(game);

  const layout = buildLayout([
    [buttons[0], buttons[1]],
    [buttons[2], buttons[3]],
    [scoreLabel],
    [startButton],
  ]);

  const window = new Gtk.ApplicationWindow({
    application: app,
    title: "Simon",
  });

  window.connect("close-request", app.quit);
  window.set_child(layout);
  window.present();
};

app.connect("activate", onActivate);
app.run([imports.system.programInvocationName].concat(ARGV));
