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
            const { Transport } = await import(evt.context.options.package) as { Transport: typeof LedgerTransport };
            this.transport = new Transport(evt.context.options.opts);
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

    this.digest().catch((err) => {
      self.postMessage({
        op: Operation.ERROR,
        context: {
          e: err,
        },
      });
    });
  }

  private async digest(): Promise<void> {
    for await (
      const _ of interval(() => {
        const ctx = this.queue.next();
        if (ctx === null) return true;
        try {
          this.transport?.consume(ctx).catch((e) => {
            self.postMessage({
              op: Operation.ERROR,
              context: {
                e,
              },
            });
          });
        } catch (e) {
          self.postMessage({
            op: Operation.ERROR,
            context: {
              e,
            },
          });
        }
        return true;
      }, 1)
    ) if (_ === false) break;
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
