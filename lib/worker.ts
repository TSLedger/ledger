import { type AliveMessageContext, type DispatchMessageContext, type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { WorkerHandler } from './struct/interface/handler.ts';
import type { ServiceBinderOption } from './struct/interface/options.ts';

/** Worker for Handler. */
new class Worker {
  protected handler: WorkerHandler | null = null;

  /** Initialize Worker */
  public constructor() {
    // Create Event Handler
    self.addEventListener('message', async (evt: MessageEvent<IndexedMessageContexts>) => {
      try {
        // Handle Events
        switch (evt.data.operation) {
          case Operation.CONFIGURE_WORKER: {
            this.handler = new (await import(evt.data.context.definition) as { Handler: new (option: ServiceBinderOption) => WorkerHandler }).Handler(evt.data.context);
            self.postMessage({
              operation: Operation.CONFIGURE_WORKER,
            });
            break;
          }
          case Operation.ALIVE: {
            self.postMessage({
              operation: Operation.ALIVE,
            } as AliveMessageContext);
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
            } as DispatchMessageContext);
            break;
          }
        }
      } catch (_: unknown) {
        // no-op
      }
    });
  }
}();
