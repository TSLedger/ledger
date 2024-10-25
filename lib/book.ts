import type { WorkerMessageContext } from './interface/context.ts';
import { type JoinedWorkerContexts, Operation } from './interface/context.ts';

export abstract class Book {
  public constructor() {
    self.addEventListener('message', (evt: MessageEvent<JoinedWorkerContexts>) => {
      try {
        switch (evt.data.op) {
          case Operation.SET_PACKAGE: {
            break;
          }
          case Operation.HEARTBEAT: {
            this.heartbeat();
            break;
          }
          // case Operation.INITIALIZED:
          case Operation.MESSAGE: {
            this.receive(evt.data).catch(this.except);
            break;
          }
            // case Operation.EXCEPT:
        }
      } catch (e) {
        this.except(e as Error);
      }
    });
  }

  /** Receive a Context Message from Parent. */
  protected abstract receive(context: WorkerMessageContext): Promise<void>;

  /** Post a Heartbeat Context Message to Parent. */
  protected heartbeat(): void {
    this.post({
      op: Operation.HEARTBEAT,
    });
  }

  /** Post an Exception Context Message tp Parent. */
  protected except(e: Error): void {
    this.post({
      op: Operation.EXCEPT,
      context: {
        e,
      },
    });
  }

  /** Post a Context Message to Parent. */
  protected post(ctx: JoinedWorkerContexts): void {
    self.postMessage(ctx);
  }
}
