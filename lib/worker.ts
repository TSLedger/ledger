// deno-lint-ignore-file no-console
import { type AliveMessageContext, type DispatchMessageContext, type IndexedMessageContexts, Operation } from './struct/interface/context.ts';
import type { WorkerHandler } from './struct/interface/handler.ts';
import type { ServiceHandlerOption } from './struct/interface/options.ts';

/** Prepare State in Constant Space. */
const url = new URL(self.location.href);
const definition = url.searchParams.get('definition')!;
const service = url.searchParams.get('service')!;
const troubleshooting = url.searchParams.get('troubleshooting') === 'true';
const troubleshootingIPC = url.searchParams.get('troubleshootingIPC') === 'true';

if (troubleshootingIPC) {
  console.info(`[Ledger/Troubleshoot] ${definition} ${service} Worker/Start: Initializing Worker. definition=${definition}, service=${service}`);
}

/** Generate Handler. */
const handler: WorkerHandler = new (
  await import(definition) as {
    Handler: new (option: ServiceHandlerOption) => WorkerHandler;
  }
).Handler({
  definition,
  service,
  troubleshooting,
  troubleshootingIPC,
});

/** Acknowledge Configuration to Parent. */
self.postMessage({
  operation: Operation.CONFIGURE_WORKER,
});

/** Worker for Handler. */
new class Worker {
  /** Initialize Worker */
  public constructor() {
    // Create Event Handler
    self.addEventListener('message', (evt: MessageEvent<IndexedMessageContexts>) => {
      try {
        // Handle Events
        switch (evt.data.operation) {
          case Operation.ALIVE: {
            self.postMessage({
              operation: Operation.ALIVE,
            } as AliveMessageContext);
            if (troubleshootingIPC) console.debug(`[Ledger/Troubleshoot] ${definition} ${service} Worker/Receive: Operation.ALIVE`);
            break;
          }
          case Operation.DISPATCH: {
            handler?.receive({
              operation: Operation.DISPATCH,
              context: evt.data.context,
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
