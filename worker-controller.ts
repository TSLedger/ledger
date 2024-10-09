import { TransportOp } from './lib/interface/op.ts';
import type { LedgerTransportOptions, TransportHandleMessage, TransportMessage, TransportSetPackageMessage } from './lib/interface/struct.ts';

/**
 * Transport Worker Controller Class.
 *
 * @internal
 */
export class TransportWorkerController {
  private setPackageMessage: TransportSetPackageMessage;
  private heartbeat = false;
  private worker: Worker | null = null;

  /**
   * Initializes a Worker from a https://jsr.io/ package.
   *
   * @param jsr A jsr.io package in 'jsr:@scope/package' format.
   * @param options
   */
  public constructor(jsr: string, options: LedgerTransportOptions) {
    if (!options.developerMode && !jsr.match(/jsr:@.*\/.*$/)) {
      throw new Error(`jsrPackage must be in 'jsr:@scope/package' format.`);
    }
    this.setPackageMessage = {
      op: TransportOp.SET_PACKAGE,
      package: jsr,
      options,
    };
    this.createWorker();
  }

  /** Emit a Message to Worker. */
  public emit(message: TransportHandleMessage): void {
    this.worker?.postMessage(message);
  }

  /** Create the Worker and Assign Configuration. */
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

  /** Send Heartbeat to Worker */
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

  /**
   * Restart Worker.
   */
  public restart(): void {
    this.worker?.terminate();
  }

  /**
   * Shutdown Worker.
   */
  public shutdown(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
