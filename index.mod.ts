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

    // Initialize Pens.
    for (const page of this.options.page) {
      // Import on Thread before Initialization.
      import(page.package.toString()).then(() => {
        this.pens.set(crypto.randomUUID(), new Pen(page));
      });
    }

    // Start Pen Refills.
    this.refill().catch((e) => {
      // deno-lint-ignore no-console
      console.error('[Ledger/NagLedgerDev] Fatal Internal Exception in Ledger (API). Failed to regenerate a Pen (Worker). This is (likely) a Ledger issue.\n', e);
    });
  }

  /**
   * Send a Trace Event Message.
   *
   * @param message The message to emit.
   * @param args Additional arguments to emit.
   */
  public trace(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.TRACE);
  }

  /**
   * Send a Info Event Message.
   *
   * @param message The message to emit.
   * @param args Additional arguments to emit.
   */
  public info(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.INFO);
  }

  /**
   * Send a Warn Event Message.
   *
   * @param message The message to emit.
   * @param args Additional arguments to emit.
   */
  public warn(message: string, ...args: unknown[]): void {
    if (this.controller.signal.aborted) return;
    this.write(message, args, Level.WARN);
  }

  /**
   * Send a Severe Event Message.
   *
   * @param message The message to emit.
   * @param args Additional arguments to emit.
   */
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

    // Enqueue the Message Context to the Pen.
    this.pens.forEach((p) => {
      p.queue.enqueue(ctx);
    });
  }

  /**
   * Regenerate Workers (Pens) if Terminated.
   *
   * @internal
   */
  private async refill(): Promise<void> {
    // Iterate 100ms. Break on Abort.
    for await (
      const _ of interval(
        () => {
          try {
            // Try to initialize aborted Pens.
            for (const [k, pen] of this.pens) {
              if (pen.controller.signal.aborted) {
                this.pens.set(k, new Pen(pen.options));
                // deno-lint-ignore no-console
                console.error('[Ledger/NagPageAuthor] Unhandled Exception in Ledger (API) from Page (Worker Digestion). This is (likely) not a Ledger issue.\n', `(${k}) Package '${pen.options.package.toString()}' exited when not expected.`);
              }
            }
          } catch (e) {
            // deno-lint-ignore no-console
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
