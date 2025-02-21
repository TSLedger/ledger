/**
 * Manages a single Interval with a callback.
 */
export class IntervalManager {
  private id: number | null = null;

  /**
   * Start the {@link IntervalManager}.
   *
   * @param callback A callback with no return value.
   * @param interval The interval in milliseconds to execute the callback.
   */
  start(callback: () => void, interval: number): void {
    if (this.id !== null) {
      throw new Error('This instance of the IntervalManager is already in use.');
    }
    this.id = setInterval(callback, interval);
  }

  /**
   * Stop the {@link IntervalManager}.
   */
  stop(): void {
    if (this.id === null) {
      return;
    }
    clearInterval(this.id);
    this.id = null;
  }

  /**
   * Check if the {@link IntervalManager} is running.
   *
   * @returns True if the {@link IntervalManager} is running. Otherwise, false.
   */
  running(): boolean {
    return this.id !== null;
  }
}
