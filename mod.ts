import { interval } from './deps.ts';
import type { PageMessageContext } from './lib/interface/context.if.ts';
import { Level } from './lib/interface/level.if.ts';
import { Op } from './lib/interface/operation.if.ts';
import type { PageOptions } from './lib/interface/page.if.ts';
import { Pen } from './lib/pen.ts';

/** Ledger API */
export class Ledger {
  private readonly options: LedgerOptions;
  private readonly pens: Map<string, Pen> = new Map();
  private readonly controller = new AbortController();

  /**
   * Initialize the Ledger API with Pen(s).
   *
   * @param options The {@link LedgerOptions}.
   */
  public constructor(options: LedgerOptions) {
    this.options = options;
    for (const page of this.options.page) {
      this.pens.set(crypto.randomUUID(), new Pen(page));
    }

    this.regenerate().catch((e) => {
      console.error('[Ledger/NagLedgerDev] Fatal Internal Exception in Ledger (API). Failed to regenerate a Pen (Worker). This is (likely) a Ledger issue.\n', e);
    });
  }

  public trace(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.TRACE);
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.INFO);
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.WARN);
  }

  public severe(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.SEVERE);
  }

  /**
   * Enqueue a Message to Worker Pens.
   *
   * @param message The string message to send.
   * @param args Additional unknown arguments to send.
   * @param level The {@link Level} to send.
   *
   * @internal
   */
  private write(message: string, args: unknown[], level: Level): void {
    const ctx: PageMessageContext = {
      op: Op.MESSAGE,
      context: {
        message,
        args,
        level,
        date: new Date(),
      },
    };

    this.pens.forEach((p) => {
      p.queue.enqueue(ctx);
    });
  }

  /**
   * Regenerate Workers (Pens) if Terminated.
   *
   * @internal
   */
  private async regenerate(): Promise<void> {
    for await (
      const _ of interval(
        () => {
          try {
            for (const [k, pen] of this.pens) {
              if (pen.terminated) {
                this.pens.set(k, new Pen(pen.options));
                console.error('[Ledger/NagPageAuthor] Unhandled Exception in Ledger (API) from Page (Worker Digestion). This is (likely) not a Ledger issue.\n', `(${k}}) Package '${pen.options.package.toString()}' exited when not expected.`);
              }
            }
          } catch (e) {
            console.error('[Ledger/NagLedgerDev] Internal Exception in Ledger (API). Failed to regenerate a Pen (Worker). This is (likely) a Ledger issue.\n', e);
          }
        },
        100,
        this.controller,
      )
    ) {
      if (this.controller.signal.aborted) break;
    }
  }

  /**
   * Terminate the Ledger API and Worker Pens Immediately.
   */
  public terminate(): void {
    this.controller.abort();
    this.pens.forEach((p) => p.terminate());
  }
}

/** The LedgerOptions Interface. */
export interface LedgerOptions {
  /** The Pens and Pages to Initialize. */
  page: PageOptions[];
}
