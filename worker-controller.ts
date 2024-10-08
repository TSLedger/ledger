import { TransportOp } from './lib/interface/op.ts';
import type { LedgerTransportOptions, TransportHandleMessage, TransportMessage, TransportSetPackageMessage } from './lib/interface/struct.ts';

export class TransportWorkerController {
  private setPackageMessage: TransportSetPackageMessage;
  private heartbeat = false;
  private worker: Worker | null = null;

  /**
   * Initializes a Worker from a https://jsr.io/ package.
   *
   * @param jsrPackage A jsr.io package in 'jsr:@scope/package' format.
   */
  public constructor(jsrPackage: string, options: LedgerTransportOptions) {
    if (!options.developerMode && !jsrPackage.match(/jsr:@.*\/.*$/)) {
      throw new Error(`jsrPackage must be in 'jsr:@scope/package' format.`);
    }
    this.setPackageMessage = {
      op: TransportOp.SET_PACKAGE,
      package: jsrPackage,
      options,
    };
    this.createWorker();
  }

  public emit(message: TransportHandleMessage): void {
    this.worker?.postMessage(message);
  }

  private createWorker(): void {
    this.worker?.terminate();
    this.heartbeat = true;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', (event: MessageEvent<TransportMessage>) => {
      switch (event.data.op) {
        case TransportOp.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
        case TransportOp.INTERNAL_ERROR: {
          break;
        }
      }
    });
    this.worker.postMessage(this.setPackageMessage);
    this.heartbeatWorker();
  }

  private heartbeatWorker(): void {
    // failed heartbeat (250ms)
    if (this.worker === null) return;
    if (this.heartbeat === false) {
      this.createWorker();
      return;
    }

    // success heartbeat
    this.heartbeat = false;
    this.worker?.postMessage({
      op: TransportOp.HEARTBEAT,
    });

    // iterate
    setTimeout(() => {
      this.heartbeatWorker();
    }, 250);
  }

  public restart(): void {
    this.worker?.terminate();
  }

  public shutdown(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
