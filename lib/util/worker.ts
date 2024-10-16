import { type EventContexts, Operation, type WorkerEvent } from './lib/interface/context/base.ts';
import { EventQueue } from './lib/util/queue.ts';

/** Worker */
export class ActualWorker {
  private queue = new EventQueue<WorkerEvent>();

  public constructor() {
    self.addEventListener('message', async (event: MessageEvent<WorkerEvent>) => {
      const evt: EventContexts = event.data as EventContexts;

      switch (evt.op) {
        case Operation.SET_PACKAGE: {
          // console.info(evt);
          // TODO: Configure
          break;
        }
        case Operation.MESSAGE: {
          this.queue.add(evt);
          break;
        }
      }
    });
  }
}
