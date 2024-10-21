import { interval } from '../../deps.ts';
import { type JoinedWorkerContexts, Operation, type WorkerEvent, type WorkerMessageContext } from '../interface/context/base.ts';
import type { LedgerTransport } from '../transport.ts';
import { EventQueue } from './queue.ts';

/** Worker */
export class ActualWorker {
  private queue = new EventQueue<WorkerMessageContext>();
  private transport: LedgerTransport | null = null;

  public constructor() {
    self.addEventListener('message', async (event: MessageEvent<WorkerEvent>) => {
      try {
        const evt = event.data as JoinedWorkerContexts;

        switch (evt.op) {
          case Operation.HEARTBEAT: {
            self.postMessage(evt);
            break;
          }
          case Operation.SET_PACKAGE: {
            // throw new Error('failed to configure');
            // const { Transport } = await import(evt.context.options.package) as { Transport: typeof LedgerTransport };
            // this.transport = new Transport(evt.context.options.opts);
            break;
          }
          case Operation.MESSAGE: {
            this.queue.add(evt);
            break;
          }
        }
      } catch (e) {
        self.postMessage({
          op: Operation.ERROR,
          context: {
            e,
          },
        });
      }
    }); 
  }
}

try {
  new ActualWorker();
} catch (e) {
  self.postMessage({
    op: Operation.ERROR,
    context: {
      e,
    },
  });
}
