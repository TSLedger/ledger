// deno-lint-ignore-file no-console
import { Queue } from '@cm-iv/queue';
import type { LedgerOption } from './struct/export.ts';
import { type AliveMessageContext, ConfigureWorkerMessageContext, type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { ServiceHandlerOption } from './struct/interface/options.ts';
import { IntervalManager } from './util/interval.ts';

export class Handler extends Worker {
  public readonly options: ServiceHandlerOption;

  // Queue
  public readonly dispatchQueue: Queue<IndexedMessageContexts> = new Queue();

  // State Managers
  private readonly alive = new IntervalManager();
  private readonly dispatch = new IntervalManager();

  // State Variables
  public isAlive = false;
  public wasAlive = false;
  public notAliveCount = 0;

  /**
   * Initialize a Worker with {@link HandlerOption}.
   *
   * @param options The {@link HandlerOption} to initialize.
   */
  public constructor(options: ServiceHandlerOption, parent: LedgerOption) {
    super(new URL(`./worker.ts`, import.meta.url), { type: 'module' });
    this.options = options;

    // Create Event Handler
    this.addEventListener('message', (evt: MessageEvent<IndexedMessageContexts>) => {
      // Handle Events
      switch (evt.data.operation) {
        case Operation.CONFIGURE_WORKER: {
          if (parent.troubleshooting) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} - Handler/Receive: Operation.CONFIGURE_WORKER, Update Alive. Begin Processing to Worker.`);
          this.isAlive = true;

          // Start Intervals.
          // Send Alive Check.
          this.alive.start(() => {
            if (this.isAlive === false) {
              this.notAliveCount++;
            }
            this.postMessage({
              operation: Operation.ALIVE,
            } as AliveMessageContext);
            this.isAlive = false;
            return true;
          }, 200);

          // Process the Queue.
          if (parent.useAsyncDispatchQueue ?? true) {
            this.dispatch.start(() => {
              if (this.dispatchQueue.isEmpty()) return;
              this.postMessage(this.dispatchQueue.dequeue());
            }, 1);
          }
          break;
        }

        case Operation.ALIVE: {
          if (parent.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} - Handler/Receive: Operation.ALIVE; Reset Alive State.`);
          this.notAliveCount = 0;
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

    // Post Configuration to Worker
    this.postMessage({
      operation: Operation.CONFIGURE_WORKER,
      context: {
        definition: this.options.definition,
        service: this.options.service,
        troubleshooting: this.options.troubleshooting,
        troubleshootingIPC: this.options.troubleshootingIPC,
      },
    } as ConfigureWorkerMessageContext);

    // Set State
    this.isAlive = true;
    this.wasAlive = true;
  }

  /** Terminate the Handler. */
  public override terminate(): void {
    this.dispatch.stop();
    this.alive.stop();
    this.isAlive = false;
    super.terminate();
  }
}
