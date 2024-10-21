import { Operation, type WorkerEvent } from './lib/interface/context/base.ts';
import type { LedgerOptions } from './lib/interface/option.ts';
import { WrappedWorker } from './lib/util/wrapped_worker.ts';

/** WorkerController */
export class WorkerController {
  public workers = new Set<WrappedWorker>();

  /** */
  public constructor(options: LedgerOptions) {
    for (const opts of options.workers) {
      if (opts.mode === 'jsr.io' && !/^(?:jsr:)?@.*\/.*$/.test(opts.package)) {
        throw new Error(`Package '${opts.package}' is not valid for type 'jsr.io' formatting.`);
      }
      this.workers.add(
        new WrappedWorker(opts),
      );
    }
    for (const worker of this.workers) {
      worker.create();
    }
  }

  /** */
  public record(event: WorkerEvent): void {
    for (const worker of this.workers) {
      worker.get().postMessage(event);
    }
  }

  /** */
  public async shutdown(): Promise<void> {
    const queue: Promise<void>[] = [];
    for (const worker of this.workers) {
      queue.push(worker.exit());
    }
    await Promise.all(queue);
  }
}

// export class TransportWorkerController {
//   private setPackageMessage: TransportSetPackageMessage;
//   private errorHandle: (event: TransportInternalErrorMessage) => void = () => {};

//   private uid = crypto.randomUUID();
//   private worker: Worker | null = null;
//   private ini = false;
//   private heartbeat = false;
//     }
//     this.errorHandle = fn;
//     this.setPackageMessage = {
//       op: TransportOp.CONFIGURE,
//       package: pkg,
//       options,
//     };
//     this.create();
//   }

//   /** Emit a Message to Worker. */
//   public emit(message: TransportHandleMessage): void {
//     this.worker?.postMessage(message);
//   }

//   /** Create the Worker and Assign Configuration. */
//   private create(): void {
//     this.worker?.terminate();
//     this.uid = crypto.randomUUID();
//     this.ini = false;
//     this.heartbeat = true;
//     this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
//     this.worker.addEventListener('message', (event: MessageEvent<TransportMessage>) => {
//       switch (event.data.op) {
//         case TransportOp.HEARTBEAT: {
//           this.heartbeat = true;
//           break;
//         }
//         case TransportOp.CONFIGURE: {
//           this.ini = true;
//           this.heartbeating(`${this.uid}`);
//           break;
//         }
//         case TransportOp.INTERNAL_ERROR: {
//           this.errorHandle(event.data as TransportInternalErrorMessage);
//           this.shutdown();
//           break;
//         }
//       }
//     });
//     this.worker.postMessage(this.setPackageMessage);
//   }

//   /** Send Heartbeat to Worker */
//   private heartbeating(uid: string): void {
//     (async () => {
//       while (this.ini) {
//         await delay(500);
//         if (this.worker === null || this.uid !== uid) {
//           break;
//         }
//         if (this.heartbeat === false) {
//           this.create();
//           break;
//         }

//         this.heartbeat = false;
//         this.worker?.postMessage({
//           op: TransportOp.HEARTBEAT,
//         });
//       }
//     })();
//   }

//   /** Await the Worker Controller and IWP to be initialized. */
//   public async await(int: number = 100): Promise<void> {
//     while (!this.ini) {
//       await delay(int);
//     }
//     return;
//   }

//   /**
//    * Restart Worker.
//    */
//   public restart(): void {
//     this.worker?.terminate();
//   }

//   /**
//    * Shutdown Worker.
//    */
//   public shutdown(): void {
//     this.ini = false;
//     this.heartbeat = false;
//     this.worker?.terminate();
//     this.worker = null;
//   }
// }
