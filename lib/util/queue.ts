import { Queue } from '../../deps.ts';
import type { WorkerEvent } from '../interface/context/base.ts';

export class EventQueue<T extends WorkerEvent> {
  private queue: Queue<T> = new Queue();

  public add(context: T): void {
    this.queue.enqueue(context);
  }

  public next(): T | null {
    return this.queue.dequeue() ?? null;
  }

  public size(): number {
    return this.queue.size();
  }

  public clear(): void {
    this.queue.clear();
  }
}
