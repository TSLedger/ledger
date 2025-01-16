import { Queue } from '../deps.ts';
import { IndexedMessageContexts, type MessageContext, Operation } from './struct/interface/context.ts';
import type { BinderOption } from './struct/interface/options.ts';

export class Binder extends Worker {
  public readonly options: BinderOption;

  public readonly queue: Queue<MessageContext> = new Queue();
  public readonly state: AbortController = new AbortController();

  private alive = true;

  /**
   * Initialize a Worker with {@link BinderOption}.
   *
   * @param options The {@link BinderOption} to initialize.
   */
  public constructor(options: BinderOption) {
    super(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.options = options;

    this.addEventListener('message', async (evt: MessageEvent<IndexedMessageContexts>) => {
      switch (evt.data.operation) {
        case Operation.CONFIGURE_WORKER: {
          // TODO(@xCykrix): Start Alive Checks (Heartbeating)! We are configured.
          break;
        }
        case Operation.ALIVE: {
          this.alive = true;
          break;
        }
        case Operation.LEDGER_ERROR: {
          // deno-lint-ignore no-console
          console.error(`[Ledger/NagPageAuthor] Unhandled Exception in Page (Worker Digestion). This is (likely) not a Ledger issue.\n`, evt.data.context);
          break;
        }
      }
    });
  }
}
