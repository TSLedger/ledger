import type { LedgerTransportOptions } from './lib/interface/struct.ts';
import { Level } from './lib/interface/level.ts';
import { TransportWorkerController } from './worker-controller.ts';
import { TransportOp } from './lib/interface/op.ts';

export class Ledger {
  public transports: Set<TransportWorkerController> = new Set();

  /**
   * Initializes a {@link TransportWorkerController} from a https://jsr.io/ package.
   *
   * @param jsrPackage A jsr.io package in 'jsr:@scope/package' format.
   * @param options The {@link LedgerTransportOptions} for the package.
   */
  public addTransportWorker<T extends LedgerTransportOptions>(jsrPackage: string, options: T): Ledger {
    this.transports.add(new TransportWorkerController(jsrPackage, options));
    return this;
  }

  public trace(message: string, ...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.TRACE,
        date: new Date(),
        message,
        args,
      });
    });
  }

  public info(message: string, ...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.INFO,
        date: new Date(),
        message,
        args,
      });
    });
  }

  public warn(message: string, ...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.WARN,
        date: new Date(),
        message,
        args,
      });
    });
  }

  public severe(message: string, ...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.SEVERE,
        date: new Date(),
        message,
        args,
      });
    });
  }

  public restart(): void {
    this.transports.forEach((v) => {
      v.restart();
    });
  }

  public shutdown(): void {
    this.transports.forEach((v) => {
      v.shutdown();
    });
    this.transports.clear();
  }
}
