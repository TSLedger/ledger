// deno-lint-ignore-file no-console
import { Queue } from '@cm-iv/queue';
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
  private readonly dispatchInterval = new IntervalManager();

  // State Variables
  public isAlive = false;
  public wasAlive = false;
  public notAliveCount = 0;

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
          if (parent.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} - Handler/Receive: Operation.CONFIGURE_WORKER`);

          // Start Intervals.
          // Send Alive Check.
          this.sendInterval.start(() => {
            if (this.isAlive === false) {
              this.notAliveCount++;
            }
            if (this.notAliveCount >= 3) {
              if (parent.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} - Handler got no alive for 3 consecutive checks. Terminating Worker.`);
              this.terminate();
            }
            this.postMessage({
              operation: Operation.ALIVE,
            } as AliveMessageContext);
            this.isAlive = false;
            return true;
          }, 125);
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
          if (parent.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} - Handler/Receive: Operation.ALIVE`);
          this.isAlive = true;
          this.wasAlive = true;
          break;
        }
        case Operation.LEDGER_ERROR: {
          console.error(`[Ledger/NagHandlerAuthor] ${this.options.definition} - Unhandled Exception in Handler Worker (Worker Handler). This is (likely) not a Ledger issue.\n`, evt.data.context);
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
    this.isAlive = true;
    this.wasAlive = true;
  }

  /** Terminate the Handler. */
  public override terminate(): void {
    if (this.dispatchInterval.running()) this.dispatchInterval.stop();
    if (this.sendInterval.running()) this.sendInterval.stop();
    this.isAlive = false;
    super.terminate();
  }
}
