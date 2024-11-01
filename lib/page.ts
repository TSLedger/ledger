import type {PageMessageContext} from './interface/context.ts';
import {type JoinedWorkerContexts, Operation} from './interface/context.ts';

export abstract class Page {
  protected constructor() {
    self.addEventListener('message', (evt: MessageEvent<JoinedWorkerContexts>) => {
      try {
        switch (evt.data.op) {
          case Operation.SET_PACKAGE: {
            // TODO(xCykrix): Implement SET_PACKAGE.
            break;
          }
          case Operation.HEARTBEAT: {
            this.post({
              op: Operation.HEARTBEAT,
            });
            break;
          }
          case Operation.MESSAGE: {
            this.receive(evt.data).catch(this.error);
            break;
          }
        }
      } catch (e) {
        this.error(e as Error);
      }
    });

    this.post({
      op: Operation.INITIALIZED,
    });
  }

  /** Receive a Context Message from Parent. */
  protected abstract receive(context: PageMessageContext): Promise<void>;

  /** Post a Context Message to Parent. */
  protected post(ctx: JoinedWorkerContexts): void {
    self.postMessage(ctx);
  }

  /** Post an Exception Context Message to Parent. */
  protected error(e: Error): void {
    this.post({
      op: Operation.ERROR,
      context: {
        e,
      },
    });
  }
}
