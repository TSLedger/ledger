// Original: Page

import { type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { WorkerHandler } from './struct/interface/handler.ts';

/** Worker for Binder. Loads  */
new class Worker {
  protected handler: WorkerHandler | null = null;

  /** Initialize Worker */
  public constructor() {
    self.addEventListener('message', async (evt: MessageEvent<IndexedMessageContexts>) => {
      try {
        switch (evt.data.operation) {
          case Operation.CONFIGURE_WORKER: {
            this.handler = new (await import(evt.data.context.definition) as { Handler: new () => WorkerHandler }).Handler();
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
          case Operation.DISPATCH: {
            this.handler?.receive({
              operation: Operation.DISPATCH,
              context: {
                q: evt.data.context.q,
                args: evt.data.context.args,
                date: evt.data.context.date,
                level: evt.data.context.level,
              },
            });
            break;
          }
        }
      } catch (_: unknown) {
        const error = _ as Error;
        // deno-lint-ignore no-console
        console.info(error.stack);
      }
    });
  }
}();
