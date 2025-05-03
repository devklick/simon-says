import Gtk from "@girs/gtk-4.0";
import GObject from "@girs/gobject-2.0";

import Header from "../Header";
import GameButtonGrid from "../GameButtonGrid";
import InfoPanel from "../InfoPanel";

interface LayoutParams {
  header: Header;
  buttonGrid: GameButtonGrid;
  infoPanel: InfoPanel;
  startButton: Gtk.Button;
}

export default class Layout extends Gtk.Box {
  static {
    GObject.registerClass({ GTypeName: "Layout" }, this);
  }

  constructor({ header, buttonGrid, infoPanel, startButton }: LayoutParams) {
    super({
      orientation: Gtk.Orientation.VERTICAL,
      name: "layout",
    });

    const content = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      halign: Gtk.Align.CENTER,
      marginTop: 20,
      marginBottom: 20,
      marginStart: 20,
      marginEnd: 20,
      spacing: 20,
      name: "content",
    });

    content.append(buttonGrid);
    content.append(infoPanel);
    content.append(startButton);

    this.append(header);
    this.append(content);
  }
}
