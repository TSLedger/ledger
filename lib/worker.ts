// Original: Page

import { type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { WorkerHandler } from './struct/interface/options.ts';

/** Worker for Binder. Loads  */
new class Worker {
  protected handler: WorkerHandler | null = null;

  /** Initialize Worker */
  public constructor() {
    self.addEventListener('message', async (evt: MessageEvent<IndexedMessageContexts>) => {
      try {
        switch (evt.data.operation) {
          case Operation.CONFIGURE_WORKER: {
            this.handler = new (await import(evt.data.context.jsr) as { Handler: new () => WorkerHandler }).Handler();
            self.postMessage({
              operation: Operation.CONFIGURE_WORKER,
            });
            break;
          }
          case Operation.ALIVE: {
            self.postMessage({
              operation: Operation.ALIVE,
            });
            console.info('alive-worker-op');
            break;
          }
          case Operation.DISPATCH:
            break;
        }
      } catch (exception: unknown) {
        self.postMessage({});
      }
    });
  }
}();
