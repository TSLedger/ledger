import { delay } from './deps.ts';
import { TransportOp } from './lib/interface/op.ts';
import type { LedgerTransportOptions, TransportHandleMessage, TransportMessage, TransportSetPackageMessage } from './lib/interface/struct.ts';

/**
 * Transport Worker Controller Class.
 *
 * @internal
 */
export class TransportWorkerController {
  private setPackageMessage: TransportSetPackageMessage;
  private uid = crypto.randomUUID();
  private worker: Worker | null = null;
  private ini = false;
  private heartbeat = false;

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
    this.create();
  }

  /** Emit a Message to Worker. */
  public emit(message: TransportHandleMessage): void {
    this.worker?.postMessage(message);
  }

  /** Create the Worker and Assign Configuration. */
  private create(): void {
    this.worker?.terminate();
    this.uid = crypto.randomUUID();
    this.ini = false;
    this.heartbeat = true;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.addEventListener('message', (event: MessageEvent<TransportMessage>) => {
      switch (event.data.op) {
        case TransportOp.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
        case TransportOp.SET_PACKAGE: {
          this.ini = true;
          this.heartbeating(`${this.uid}`);
          break;
        }
        case TransportOp.INTERNAL_ERROR: {
          this.create();
          break;
        }
      }
    });
    this.worker.postMessage(this.setPackageMessage);
  }

  /** Send Heartbeat to Worker */
  private heartbeating(uid: string): void {
    (async () => {
      while (this.ini) {
        await delay(500);
        if (this.worker === null || this.uid !== uid) {
          break;
        }
        if (this.heartbeat === false) {
          this.create();
          break;
        }

        this.heartbeat = false;
        this.worker?.postMessage({
          op: TransportOp.HEARTBEAT,
        });
      }
    })();
  }

  /** Await the Worker Controller and IWP to be initialized. */
  public async await(int: number = 100): Promise<void> {
    while (!this.ini) {
      await delay(int);
    }
    return;
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
    this.ini = false;
    this.heartbeat = false;
    this.worker?.terminate();
    this.worker = null;
  }
}
