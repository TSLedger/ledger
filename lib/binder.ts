import { interval, Queue } from '../deps.ts';
import { type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { BinderOption } from './struct/interface/options.ts';

export class Binder extends Worker {
  public readonly options: BinderOption;

  public readonly queue: Queue<IndexedMessageContexts> = new Queue();
  public readonly state: AbortController = new AbortController();

  public ready = false;
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
          // Start Intervals.
          this.sendAliveCheck().catch((e) => {
            // deno-lint-ignore no-console
            console.error(`[Ledger/NagLedgerAuthor] Internal Exception in Binder Worker (Worker Handler Parent). This is (likely) a Ledger issue. sendAliveCheck()\n`, e);
            this.state.abort();
            this.terminate();
          });
          this.verifyAliveCheck().catch((e) => {
            // deno-lint-ignore no-console
            console.error(`[Ledger/NagLedgerAuthor] Internal Exception in Binder Worker (Worker Handler Parent). This is (likely) a Ledger issue. verifyAliveCheck()\n`, e);
            this.state.abort();
            this.terminate();
          });
          // this.consume().catch((e) => {
          //   // deno-lint-ignore no-console
          //   console.error(`[Ledger/NagLedgerDev] Internal Exception in Page (Worker Digestion). This is (likely) a Ledger issue. consume()\n`, e);
          //   this.terminate();
          // });
          break;
        }
        case Operation.ALIVE: {
          this.alive = true;
          console.info('alive-binder-op');
          break;
        }
        case Operation.LEDGER_ERROR: {
          // deno-lint-ignore no-console
          console.error(`[Ledger/NagBinderAuthor] Unhandled Exception in Binder Worker (Worker Handler). This is (likely) not a Ledger issue.\n`, evt.data.context);
          break;
        }
      }
    });
  }

  private async sendAliveCheck(): Promise<void> {
    for await (
      const check of interval(
        () => {
          if (this.state.signal.aborted) return false;
          if (!this.alive) {
            this.state.abort();
            this.terminate();
            return false;
          }
          this.alive = false;
          return true;
        },
        50,
        this.state,
      )
    ) {
      if (this.state.signal.aborted || !check) break;
    }
  }

  private async verifyAliveCheck(): Promise<void> {
    for await (
      const check of interval(
        () => {
          if (this.state.signal.aborted) return false;
          if (this.alive) return true;
          this.postMessage({
            operation: Operation.ALIVE,
          });
          return true;
        },
        15,
        this.state,
      )
    ) {
      if (this.state.signal.aborted || !check) break;
    }
  }
}
