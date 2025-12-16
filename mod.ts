// deno-lint-ignore-file no-console
import { Handler } from './lib/handler.ts';
import { type DispatchMessageContextPassthrough, Operation } from './lib/struct/interface/context.ts';
import { Level } from './lib/struct/interface/level.ts';
import type { LedgerOption, ServiceHandlerOption } from './lib/struct/interface/options.ts';
import { IntervalManager } from './lib/util/interval.ts';

/**
 * Ledger is a multi-process logging interface allowing for the asynchronous distribution of event messages for services.
 */
export class Ledger {
  private readonly options: LedgerOption;
  private readonly handlers: Map<string, Handler> = new Map();
  private readonly restart = new IntervalManager();

  /**
   * Initializes an instance of Ledger.
   *
   * @param options The {@link LedgerOption} to use.
   */
  public constructor(options: LedgerOption) {
    this.options = options;
    this.restart.start(() => {
      Array.from(this.handlers.entries()).filter(([_, v]) => v.notAliveCount >= 5).forEach(([k, v]) => {
        if (this.options.troubleshooting) {
          console.debug(`[Ledger/Troubleshoot] Restarting Handler: '${v.options.definition}' - '${k}' due to no-alive.`, {
            isAlive: v.isAlive,
            wasAlive: v.wasAlive,
          });
        }
        v.terminate();
        this.handlers.set(crypto.randomUUID(), new Handler(v.options, options));
        this.handlers.delete(k);
      });
    }, 100);
  }

  /**
   * Register the options and configuration for a Handler.
   *
   * Please specify options.definition as the fully qualified import with versions. We recommend using JSR.io.
   *
   * @param options The {@link HandlerOption} to register.
   * @returns {@link Ledger}
   */
  public register<T>(options: T & Pick<ServiceHandlerOption, 'definition' | 'level'>): Ledger {
    if (this.options.troubleshooting) console.debug(`[Ledger/Troubleshoot] Register Handler: '${options.definition}' `);
    this.handlers.set(
      crypto.randomUUID(),
      new Handler({
        ...options,
        definition: options.definition,
        service: this.options.service,
        troubleshooting: this.options.troubleshooting ?? false,
        troubleshootingIPC: this.options.troubleshootingIPC ?? false,
      }, this.options),
    );
    return this;
  }

  /**
   * Dispatches a Trace Event Message.
   *
   * @param message
   * @param args
   */
  public trace(message?: string, ...args: unknown[]): void {
    this.dispatch(Level.TRACE, {
      q: message,
      args: args,
    });
  }

  /**
   * Dispatches a Information Event Message.
   * @param message
   * @param args
   */
  public information(message?: string, ...args: unknown[]): void {
    this.dispatch(Level.INFORMATION, {
      q: message,
      args: args,
    });
  }

  /**
   * Dispatches a Warning Event Message.
   *
   * @param message
   * @param args
   */
  public warning(message?: string, ...args: unknown[]): void {
    this.dispatch(Level.WARNING, {
      q: message,
      args: args,
    });
  }

  /**
   * Dispatches a Severe Event Message.
   *
   * @param message A string or Error to dispatch.
   * @param args
   */
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
      this.handlers.forEach((v) => {
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
      this.handlers.forEach((v) => {
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
          console.error('ImmediateDispatch: Failed', error.stack);
        }
      });
    }
  }

  /**
   * Await for all Handlers to be indicated as alive.
   */
  public async alive(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      while (Array.from(this.handlers.values()).filter((v) => !v.isAlive).length > 0) {
        if (this.options.troubleshooting) console.debug(`[Ledger/Troubleshoot] Checking Handler Alive. Still waiting on one or more handlers to be alive.`);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * Terminate Ledger and Workers Immediately.
   */
  public terminate(): void {
    if (this.options.troubleshooting) console.debug(`[Ledger/Troubleshoot] Terminating Ledger and Handlers...`);
    this.restart.stop();
    this.handlers.forEach((handler) => {
      handler.terminate();
    });
  }
}
