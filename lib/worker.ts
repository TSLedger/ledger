// Original: Page

import type { MessageContext } from './struct/export.ts';
import { IndexedMessageContexts, Operation } from './struct/interface/context.ts';
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
            const handler = await import(evt.data.context.jsr) as { Handler: new () => WorkerHandler };
            this.handler = new handler.Handler();
            self.postMessage({
              operation: Operation.CONFIGURE_WORKER,
            });
            break;
          }
          case Operation.ALIVE: {
            self.postMessage({
              operation: Operation.ALIVE,
            });
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
