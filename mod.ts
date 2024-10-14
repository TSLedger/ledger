import type { LedgerTransportOptions } from './lib/interface/struct.ts';
import { Level } from './lib/interface/level.ts';
import { TransportWorkerController } from './worker-controller.ts';
import { TransportOp } from './lib/interface/op.ts';

/** Ledger */
export class Ledger {
  public transports: Set<TransportWorkerController> = new Set();

  /**
   * Adds a {@link TransportWorkerController} from a https://jsr.io/ package to the current worker pool.
   *
   * @param jsr A jsr.io package in 'jsr:@scope/package' format.
   * @param options The {@link LedgerTransportOptions} for the package.
   */
  public addTransportWorker<T extends LedgerTransportOptions>(jsr: string, options: T): Ledger {
    this.transports.add(new TransportWorkerController(jsr, options));
    return this;
  }

  /**
   * Await all transports initialized status.
   */
  public async await(): Promise<Ledger> {
    const wait: Promise<void>[] = [];
    this.transports.forEach((v) => {
      wait.push(v.await());
    });
    await Promise.all(wait);
    return this;
  }

  /**
   * Submit a TRACE {@link Level} Severity Message to Transports.
   *
   * @param message The base message string.
   * @param args Additional context or reference objects.
   */
  public trace(message: string, ...args: unknown[]): void {
    this.forwardLogEvent(Level.TRACE, message, args);
  }

  /**
   * Submit a INFO {@link Level} Severity Message to Transports.
   *
   * @param message The base message string.
   * @param args Additional context or reference objects.
   */
  public info(message: string, ...args: unknown[]): void {
    this.forwardLogEvent(Level.INFO, message, args);
  }

  /**
   * Submit a WARN {@link Level} Severity Message to Transports.
   *
   * @param message The base message string.
   * @param args Additional context or reference objects.
   */
  public warn(message: string, ...args: unknown[]): void {
    this.forwardLogEvent(Level.WARN, message, args);
  }

  /**
   * Submit a SEVERE {@link Level} Severity Message to Transports.
   *
   * @param message The base message string.
   * @param args Additional context or reference objects.
   */
  public severe(message: string, ...args: unknown[]): void {
    this.forwardLogEvent(Level.SEVERE, message, args);
  }

  /**
   * Restart the Transport Workers.
   */
  public restart(): void {
    this.transports.forEach((v) => {
      v.restart();
    });
  }

  /**
   * Shutdown the Transport Workers.
   */
  public shutdown(): void {
    this.transports.forEach((v) => {
      v.shutdown();
    });
    this.transports.clear();
  }

  /**
   * Creates and Forwards a Message to all Transports.
   *
   * @param level
   * @param message
   * @param args
   *
   * @private
   * @internal
   */
  private forwardLogEvent(level: Level, message: string, args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: level,
        date: new Date(),
        message,
        args,
      });
    });
  }
}

/** Exports for Accessing Internals. */
export { LedgerTransport } from './lib/transport.ts';
export type { LedgerTransportOptions, TransportHandleMessage } from './lib/interface/struct.ts';
export { Level } from './lib/interface/level.ts';
