import type { PageAllContexts, PageMessageContext } from './interface/context.if.ts';
import { interval, Queue } from '../deps.ts';
import type { PageOptions } from './interface/page.if.ts';
import { Op } from './interface/operation.if.ts';

/** Pen API */
export class Pen extends Worker {
  public readonly options: PageOptions;
  public readonly queue: Queue<PageMessageContext> = new Queue();
  public controller: AbortController = new AbortController();

  private heartbeat = false;

  /**
   * Initialize a Worker with {@link PageOptions}.
   *
   * @param options The {@link PageOptions}.
   */
  public constructor(options: PageOptions) {
    super(options.package, { type: 'module' });
    this.options = options;

    // Add Event Listeners.
    this.addEventListener('message', (evt: MessageEvent<PageAllContexts>) => {
      switch (evt.data.op) {
        case Op.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
        case Op.ERROR: {
          // deno-lint-ignore no-console
          console.error(`[Ledger/NagPageAuthor] Unhandled Exception in Page (Worker Digestion). This is (likely) not a Ledger issue.\n`, evt.data.context.e);
          break;
        }
      }
    });

    // Post Configuration.
    this.post({
      op: Op.SEND_CONFIGURATION,
      context: {
        options: this.options.options,
      },
    });

    // Start Intervals.
    this.pulse().catch((e) => {
      // deno-lint-ignore no-console
      console.error(`[Ledger/NagLedgerDev] Internal Exception in Page (Worker Digestion). This is (likely) a Ledger issue. pulse()\n`, e);
      this.terminate();
    });
    this.beat().catch((e) => {
      // deno-lint-ignore no-console
      console.error(`[Ledger/NagLedgerDev] Internal Exception in Page (Worker Digestion). This is (likely) a Ledger issue. beat()\n`, e);
      this.terminate();
    });
    this.consume().catch((e) => {
      // deno-lint-ignore no-console
      console.error(`[Ledger/NagLedgerDev] Internal Exception in Page (Worker Digestion). This is (likely) a Ledger issue. consume()\n`, e);
      this.terminate();
    });
  }

  /**
   * Consume the Message Queue and Dispatch to Worker. (Handle Queue of Messages)
   */
  private async consume(): Promise<void> {
    for await (
      const _ of interval(
        () => {
          if (this.queue.isEmpty()) return;
          this.post(this.queue.dequeue()!);
        },
        0,
        this.controller,
      )
    ) {
      if (this.controller.signal.aborted) break;
    }
  }

  /**
   * Checks for a Pulse from the Pen. (Check Heartbeat)
  */
  private async pulse(): Promise<void> {
    for await (
      const check of interval(
        () => {
          if (this.controller.signal.aborted) return false;
          if (!this.heartbeat) {
            this.controller.abort();
            this.terminate();
            return false;
          }
          this.heartbeat = false;
          return true;
        },
        15,
        this.controller,
      )
    ) {
      if (!check) break;
      if (this.controller.signal.aborted) break;
    }
  }

  /**
   * Sends a Beat to Request a Pulse from the Pen. (Send Heartbeat)
   */
  private async beat(): Promise<void> {
    for await (
      const check of interval(
        () => {
          if (this.controller.signal.aborted) return false;
          if (this.heartbeat) return true;
          this.post({
            op: Op.HEARTBEAT,
          });
          return true;
        },
        5,
        this.controller,
      )
    ) {
      if (!check) break;
      if (this.controller.signal.aborted) break;
    }
  }

  /**
   * Post a {@link PageAllContexts} to your {@link Page}
   *
   * @param ctx A instance of {@link PageAllContexts} compatible payload.
   */
  public post(ctx: PageAllContexts): void {
    this.postMessage(ctx);
  }

  /**
   * Terminate the Pen and Page. (Kill Worker)
   */
  public override terminate(): void {
    this.controller.abort();
    super.terminate();
  }
}
