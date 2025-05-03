type Action<T> = (value: T) => void;
type Predicate<T> = (value: T) => boolean;

/*
  The Observable class could probably be replaced by using Gtk property bindings. 
  I haven't delved into these yet, and I quite like this way of doing things, 
  so I'm happy with this approach for now.
*/

class Observable<T> {
  private _value: T;
  private readonly subscriptions: Array<{
    predicate?: Predicate<T>;
    action: Action<T>;
  }>;

  constructor(value: T) {
    this._value = value;
    this.subscriptions = [];
  }

  /**
   * Gets the current value
   */
  get value(): T {
    return this._value;
  }

  /**
   * Sets the value and broadcasts the new value to the subscribers.
   */
  set value(value: T) {
    this._value = value;
    this.emit();
  }

  /**
   * Subscribes the action to all changes that are made to the value.
   * @param action The function to be called when the value changes
   */
  subscribe(action: Action<T>): void {
    this.subscriptions.push({ action: action });
  }

  /**
   * Subscribes the handler to changes to the value if the specified predicate is met.
   * @param predicate The function to be called to determine whether the subscriber
   * should be notified of the change to the value.
   * @param action The function to be called when the value changes and meets
   * the specified predicate
   */
  subscribeWhen(predicate: Predicate<T>, action: Action<T>): void {
    this.subscriptions.push({ predicate, action });
  }

  /**
   * Broadcast the value to the relevant subscribers.
   */
  private emit() {
    for (const { action, predicate } of this.subscriptions) {
      if (!predicate || predicate(this.value)) {
        action(this._value);
      }
    }
  }
}

export default Observable;
