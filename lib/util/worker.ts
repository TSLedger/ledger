import { type JoinedWorkerContexts, Operation, type WorkerEvent, type WorkerMessageContext } from '../interface/context/base.ts';
import type { LedgerTransport } from '../transport.ts';
import { EventQueue } from './queue.ts';

/** Worker */
export class ActualWorker {
  private queue = new EventQueue<WorkerMessageContext>();
  private transport: LedgerTransport | null = null;

  public constructor() {
    self.addEventListener('message', async (event: MessageEvent<WorkerEvent>) => {
      const evt = event.data as JoinedWorkerContexts;

      switch (evt.op) {
        case Operation.HEARTBEAT: {
          self.postMessage(evt);
          break;
        }
        case Operation.SET_PACKAGE: {
          const { Transport } = await import(evt.context.options.package) as { Transport: typeof LedgerTransport };
          this.transport = new Transport(evt.context.options.opts);
          break;
        }
        case Operation.MESSAGE: {
          this.queue.add(evt);
          break;
        }
      }
    });

    // (async () => {
    //   while (this.transport !== null) {
    //     await new Promise((resolve) => setTimeout(resolve, 1));
    //     const ctx = this.queue.next();
    //     if (ctx === null) continue;
    //     try {
    //       this.transport.consume(ctx).catch((e) => {
    //         // Internal Transport Error
    //       });
    //     } catch (e: unknown) {
    //       // Worker Error
    //     }
    //   }
    // })();
  }
}

new ActualWorker();
