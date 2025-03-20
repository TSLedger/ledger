import { Queue } from '../deps.ts';
import type { LedgerOption } from './struct/export.ts';
import { type AliveMessageContext, type ConfigureWorkerMessageContext, type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { HandlerOption } from './struct/interface/options.ts';
import { IntervalManager } from './util/interval.ts';

export class Handler extends Worker {
  public readonly options: HandlerOption;

  // Queue
  public readonly dispatchQueue: Queue<IndexedMessageContexts> = new Queue();

  // State Managers
  private readonly sendInterval = new IntervalManager();
  private readonly upInterval = new IntervalManager();
  private readonly dispatchInterval = new IntervalManager();

  // State Variables
  public isAlive = false;
  public wasAlive = false;
  private isUp = true;

  /**
   * Initialize a Worker with {@link HandlerOption}.
   *
   * @param options The {@link HandlerOption} to initialize.
   */
  public constructor(options: HandlerOption, parent: LedgerOption) {
    super(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.options = options;

    // Create Event Handler
    this.addEventListener('message', (evt: MessageEvent<IndexedMessageContexts>) => {
      // Handle Events
      switch (evt.data.operation) {
        case Operation.CONFIGURE_WORKER: {
          if (parent.troubleshooting) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} Handler/Receive: Operation.CONFIGURE_WORKER`);

          // Start Intervals.
          // Send Alive Check.
          this.sendInterval.start(() => {
            if (this.isUp) return true;
            this.postMessage({
              operation: Operation.ALIVE,
            } as AliveMessageContext);
            return true;
          }, 10);
          // Check for Alive Response.
          this.upInterval.start(() => {
            if (!this.isUp) {
              this.terminate();
              return false;
            }
            this.isUp = false;
            return true;
          }, 30);
          // Process the Queue.
          if (parent.useAsyncDispatchQueue ?? true) {
            this.dispatchInterval.start(() => {
              if (this.dispatchQueue.isEmpty()) return;
              this.postMessage(this.dispatchQueue.dequeue());
            }, 1);
          }
          break;
        }
        case Operation.ALIVE: {
          if (parent.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} Handler/Receive: Operation.ALIVE`);
          this.isAlive = true;
          this.wasAlive = true;
          this.isUp = true;
          break;
        }
        case Operation.LEDGER_ERROR: {
          // deno-lint-ignore no-console
          console.error(`[Ledger/NagHandlerAuthor] Unhandled Exception in Handler Worker (Worker Handler). This is (likely) not a Ledger issue.\n`, evt.data.context);
          break;
        }
      }
    });

    // Start Configuration
    this.postMessage({
      operation: Operation.CONFIGURE_WORKER,
      context: {
        service: parent.service,
        ...this.options,
        troubleshootingIPC: parent.troubleshootingIPC ?? false,
      },
    } as ConfigureWorkerMessageContext);
  }

  /** Terminate the Handler. */
  public override terminate(): void {
    if (this.dispatchInterval.running()) this.dispatchInterval.stop();
    if (this.upInterval.running()) this.upInterval.stop();
    if (this.sendInterval.running()) this.sendInterval.stop();
    this.isAlive = false;
    super.terminate();
  }
}
