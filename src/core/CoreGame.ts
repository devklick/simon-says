import GLib from "@girs/glib-2.0";
import Observable from "./Observable";
import CoreGameButton from "./CoreGameButton";

export type GameStatus =
  | "setup"
  | "playing-sequence"
  | "waiting-for-user"
  | "game-over";

interface CoreGameParams {
  buttons: ReadonlyArray<Readonly<CoreGameButton>>;
  speed: number;
}

class Game {
  private readonly _score = new Observable<number>(0);
  private readonly _status = new Observable<GameStatus>("setup");

  /**
   * The score that the player has accumulated during the current round.
   * Gets reset on game-over, or if player reset's the game mid-round.
   */
  public get score() {
    return this._score;
  }

  /**
   * The current status of this game round.
   */
  public get status() {
    return this._status;
  }

  /**
   * The game input buttons, i.e. color buttons, for the user to click when
   * repeating the generated sequence.
   */
  public readonly buttons: ReadonlyArray<Readonly<CoreGameButton>>;

  /**
   * The generated sequence that the player must repeat.
   * These values refer to the index of the buttons.
   */
  private readonly _sequence: Array<number> = [];
  /**
   * The sequence that the player has clicked when repeating the sequence.
   * These values refer to the index of the buttons that the player has clicked.
   */
  private readonly _playerInput: Array<number> = [];
  /**
   * The index of the button which is currently being flashed to the user while
   * the sequence is playing.
   */
  private _currentIndex: number = 0;

  private _speed: number = 500;

  private get _delay() {
    // min speed is 100, max speed is 1000.
    // flip this and use it as delay in MS
    return 1100 - this._speed;
  }

  constructor({ buttons, speed }: CoreGameParams) {
    this.buttons = buttons;
    this._speed = speed;
  }

  /**
   * Initializes a fresh game and starts playing the sequence.
   */
  public start() {
    this.status.value = "setup";
    this._sequence.length = 0;
    this._playerInput.length = 0;
    this._currentIndex = 0;
    this.score.value = 0;
    this.addButtonToSequence();
    this.emitSequence();
  }

  public setSpeed(value: number) {
    this._speed = value;
  }

  /**
   * Handles user input, when the player clicks the button they believe
   * to be next in the sequence.
   * @param buttonIndex The index of the button clicked by the player
   */
  public handleButtonClick(buttonIndex: number) {
    if (this.status.value !== "waiting-for-user") {
      return;
    }

    // Capture the players input for later
    this._playerInput.push(buttonIndex);
    const button = this.buttons[buttonIndex];

    // Loop over each item in the players input so far, checking if it's correct
    for (const [i, input] of this._playerInput.entries()) {
      const correct = input === this._sequence[i];
      // Temp fix to only flash the button if the last in the sequence is correct.
      // This is a hacky solution because we're looping over each item in the _playerInput array
      // every time the player pressed a button. The long term solution is to store
      // something to tell us which position in the sequence this button press relates to,
      // so we only need to check a single input, rather than checking all (we know previous)
      // inputs are correct or we wouldnt get here...
      if (i === this._playerInput.length - 1) {
        // Flash the button when clicked
        button.flash(correct ? "flash-correct" : "flash-incorrect");
      }

      // If the input was wrong, it's game over.
      if (!correct) {
        this.status.value = "game-over";
        return;
      }
    }

    // Once the player has entered all buttons correctly, we can mark
    // this sequence as correct and move on.
    if (this._playerInput.length === this._sequence.length) {
      this.sequenceCorrect();
    }
  }

  /**
   * Randomly picks a button and adds it to the sequence.
   */
  private addButtonToSequence() {
    const buttonIndex = GLib.random_int_range(0, this.buttons.length);
    this._sequence.push(buttonIndex);
  }

  /**
   * Plays the current sequence of colors to the player.
   */
  private emitSequence() {
    this.status.value = "playing-sequence";

    // Add a small delay to give a gap between the player
    // pressing a button and the game presenting the next sequence
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 800, () => {
      const more = this.emitCurrent();
      if (more) {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, this._delay, () =>
          this.emitCurrent()
        );
      }
      return false;
    });
  }

  private emitCurrent() {
    // If we've not got through all buttons in the current sequence,
    // play the one that's marked as current.
    if (this._currentIndex < this._sequence.length) {
      const buttonIndex = this._sequence[this._currentIndex];
      this.buttons[buttonIndex].flash("flash", this._delay / 2);
      this._currentIndex += 1;
      // Return true to continue repeating this timeout
      return true;
    }

    // We've played all colors in this sequence, so reset the counter
    // and update the status to reflect that we're now waiting on user input.
    this._currentIndex = 0;
    this.status.value = "waiting-for-user";
    // Return false to stop repeating the timeout
    return false;
  }

  /**
   * Performs the relevant actions that take place once a player has correctly
   * repeated an entire sequence of colors.
   */
  private sequenceCorrect() {
    this.score.value += 1;
    this._playerInput.length = 0;
    this.addButtonToSequence();
    this.emitSequence();
  }
}

export default Game;
