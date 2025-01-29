import { Binder } from './lib/binder.ts';
import { type DispatchMessageContextPassthrough, Operation } from './lib/struct/interface/context.ts';
import { Level } from './lib/struct/interface/level.ts';
import type { BinderOption, LedgerOption } from './lib/struct/interface/options.ts';
import { IntervalManager } from './lib/util/interval.ts';

export class Ledger {
  private readonly options: LedgerOption;
  private readonly binders: Map<string, Binder> = new Map();
  private readonly restart = new IntervalManager();

  /**
   * Initializes an instance of Ledger.
   *
   * @param options The {@link LedgerOption} to use.
   */
  public constructor(options: LedgerOption) {
    this.options = options;
    this.restart.start(() => {
      this.binders.entries().filter(([_, v]) => !v.isAlive && v.wasAlive).forEach(([k, v]) => {
        v.terminate();
        this.binders.set(crypto.randomUUID(), new Binder(v.options, options));
        this.binders.delete(k);
      });
    }, 100);
  }

  /**
   * Register the options and configuration for a Binder.
   *
   * Please specify options.definition as the fully qualified import with versions. We recommend using JSR.io.
   *
   * @param options The {@link BinderOption} to register.
   * @returns {@link Ledger}
   */
  public register(options: BinderOption): Ledger {
    this.binders.set(crypto.randomUUID(), new Binder(options, this.options));
    return this;
  }

  public trace(message?: string, ...args: unknown[]): void {
    this.dispatch(Level.TRACE, {
      q: message,
      args: args,
    });
  }

  public information(message?: string, ...args: unknown[]): void {
    this.dispatch(Level.INFORMATION, {
      q: message,
      args: args,
    });
  }

  public warning(message?: string, ...args: unknown[]): void {
    this.dispatch(Level.WARNING, {
      q: message,
      args: args,
    });
  }

  public severe(message?: string | Error, ...args: unknown[]): void {
    this.dispatch(Level.SEVERE, {
      q: message,
      args: args,
    });
  }

  /**
   * Internal Dispatching Event. Used to wrap common logic for dispatching messages.
   *
   * @param context A {@link DispatchMessageContextPassthrough} to dispatch or enqueue immediately.
   */
  private dispatch(level: Level, context: DispatchMessageContextPassthrough): void {
    if (this.options.useAsyncDispatchQueue) {
      // Enqueue to dispatchQueue.
      this.binders.forEach((v) => {
        v.dispatchQueue.enqueue({
          operation: Operation.DISPATCH,
          context: {
            ...context,
            level: level,
            date: new Date(),
          },
        });
      });
    } else {
      // Immediately Dispatch.
      this.binders.forEach((v) => {
        try {
          v.postMessage({
            operation: Operation.DISPATCH,
            context: {
              ...context,
              level: level,
              date: new Date(),
            },
          });
        } catch (_: unknown) {
          const error = _ as Error;
          // deno-lint-ignore no-console
          console.error('ImmediateDispatch: Failed', error.stack);
        }
      });
    }
  }

  /**
   * Terminate Ledger and Workers Immediately.
   */
  public terminate(): void {
    this.restart.stop();
    this.binders.forEach((binder) => {
      binder.terminate();
    });
  }
}
