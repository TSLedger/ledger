export class IntervalManager {
  private id: number | null = null;

  start(callback: () => void, interval: number): void {
    if (this.id !== null) {
      throw new Error('IntervalManger in use.');
    }
    this.id = setInterval(callback, interval);
  }

  stop(): void {
    if (this.id === null) {
      throw new Error('IntervalManager is not in use.');
    }
    clearInterval(this.id);
    this.id = null;
  }

  running(): boolean {
    return this.id !== null;
  }
}
