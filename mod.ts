import type { LedgerTransportOptions } from './lib/interface/struct.ts';
import { Level } from './lib/interface/level.ts';
import { TransportWorkerController } from './worker-controller.ts';
import { TransportOp } from './lib/interface/op.ts';

export class Ledger {
  public transports: Set<TransportWorkerController> = new Set();

  public constructor() {
  }

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

  public trace(...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.TRACE,
        date: new Date(),
        args,
      });
    });
  }

  public info(...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.INFO,
        date: new Date(),
        args,
      });
    });
  }

  public warn(...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.WARN,
        date: new Date(),
        args,
      });
    });
  }

  public severe(...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.SEVERE,
        date: new Date(),
        args,
      });
    });
  }

  public fatal(...args: unknown[]): void {
    this.transports.forEach((v) => {
      v.emit({
        op: TransportOp.HANDLE,
        level: Level.FATAL,
        date: new Date(),
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

const ledger = new Ledger()
  .addTransportWorker('jsr:@ledger/console-transport', {});

setInterval(async () => {
  ledger.trace('test test', 123, 123);
}, 500);
