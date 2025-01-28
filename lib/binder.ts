import { Queue } from '../deps.ts';
import { type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { BinderOption } from './struct/interface/options.ts';
import { IntervalManager } from './util/interval.ts';

export class Binder extends Worker {
  public readonly options: BinderOption;

  // Queue
  public readonly indexed: Queue<IndexedMessageContexts> = new Queue();

  // State Managers
  private readonly up = new IntervalManager();
  private readonly send = new IntervalManager();
  private readonly queue = new IntervalManager();

  // State Variables
  public isAlive = false;
  private isUp = true;

  /**
   * Initialize a Worker with {@link BinderOption}.
   *
   * @param options The {@link BinderOption} to initialize.
   */
  public constructor(options: BinderOption) {
    super(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.options = options;

    this.addEventListener('message', (evt: MessageEvent<IndexedMessageContexts>) => {
      switch (evt.data.operation) {
        case Operation.CONFIGURE_WORKER: {
          // Start Intervals.
          // Send Alive Check.
          this.send.start(() => {
            if (this.isUp) return true;
            this.postMessage({
              operation: Operation.ALIVE,
            });
            return true;
          }, 10);
          // Check for Alive Response.
          this.up.start(() => {
            if (!this.isUp) {
              this.terminate();
              return false;
            }
            this.isUp = false;
            return true;
          }, 30);
          // Process the Queue.
          // TODO(@xCykrix): Direct Posting Mode? Skip the queue and send sync to all worker threads. Always? Optional?
          this.queue.start(() => {
            if (this.indexed.isEmpty()) return;
            this.postMessage(this.indexed.dequeue());
          }, 1);
          break;
        }
        case Operation.ALIVE: {
          this.isAlive = true;
          this.isUp = true;
          break;
        }
        case Operation.LEDGER_ERROR: {
          // deno-lint-ignore no-console
          console.error(`[Ledger/NagBinderAuthor] Unhandled Exception in Binder Worker (Worker Handler). This is (likely) not a Ledger issue.\n`, evt.data.context);
          break;
        }
      }
    });

    // Start Configuration
    this.postMessage({
      operation: Operation.CONFIGURE_WORKER,
      context: this.options,
    });
  }

  public override terminate(): void {
    this.queue.stop();
    this.up.stop();
    this.send.stop();
    this.terminate();
  }
}
