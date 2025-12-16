// deno-lint-ignore-file no-console
import { type AliveMessageContext, type DispatchMessageContext, type IndexedMessageContexts, type LedgerErrorMessageContext, Operation } from './struct/interface/context.ts';
import type { WorkerHandler } from './struct/interface/handler.ts';
import { Level } from './struct/interface/level.ts';
import type { ServiceHandlerOption } from './struct/interface/options.ts';

/** Worker for Handler. */
new class Worker {
  protected handler: WorkerHandler | null = null;
  private options: ServiceHandlerOption | null = null;

  /** Initialize Worker */
  public constructor() {
    // Create Event Handler
    self.addEventListener('message', async (evt: MessageEvent<IndexedMessageContexts>) => {
      try {
        // Handle Events
        switch (evt.data.operation) {
          case Operation.CONFIGURE_WORKER: {
            this.options = evt.data.context;
            if (this.options?.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${evt.data.context.definition} ${evt.data.context.service} Worker/Receive: Operation.CONFIGURE_WORKER - Initializing Handler from Definition.`);
            this.handler = new (await import(evt.data.context.definition) as {
              Handler: new (option: ServiceHandlerOption) => WorkerHandler;
            }).Handler(evt.data.context);
            self.postMessage({
              operation: Operation.CONFIGURE_WORKER,
            });
            if (this.options?.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${evt.data.context.definition} ${evt.data.context.service} Worker/Receive: Operation.CONFIGURE_WORKER - Respond to Handler with CONFIGURE_WORKER.`);
            return;
          }
          case Operation.ALIVE: {
            self.postMessage({
              operation: Operation.ALIVE,
            } as AliveMessageContext);
            if (this.options?.troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${this.options.definition} ${this.options.service} Worker/Receive: Operation.ALIVE`);
            return;
          }
          case Operation.DISPATCH: {
            if (!(evt.data.context.level >= (this.options?.level ?? Level.TRACE))) return;
            this.handler?.receive({
              operation: Operation.DISPATCH,
              context: evt.data.context,
            } as DispatchMessageContext);
            return;
          }
        }
      } catch (e: unknown) {
        if (!(e instanceof Error)) return;
        self.postMessage({
          operation: Operation.LEDGER_ERROR,
          context: {
            message: e.message,
            stack: e.stack,
          },
        } as LedgerErrorMessageContext);
      }
    });
  }
}();
