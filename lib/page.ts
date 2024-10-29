import type { WorkerMessageContext } from './interface/context.ts';
import { type JoinedWorkerContexts, Operation } from './interface/context.ts';

export abstract class Page {
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
            this.receive(evt.data).catch(this.error);
            break;
          }
          // case Operation.EXCEPT:
        }
      } catch (e) {
        this.error(e as Error);
      }
    });
  }

  /** Receive a Context Message from Parent. */
  protected abstract receive(context: WorkerMessageContext): Promise<void>;

  /** Post a Context Message to Parent. */
  protected send(ctx: JoinedWorkerContexts): void {
    self.postMessage(ctx);
  }

  /** Post an Exception Context Message tp Parent. */
  protected error(e: Error): void {
    this.send({
      op: Operation.ERROR,
      context: {
        e,
      },
    });
  }

  /** Post a Heartbeat Context Message to Parent. */
  protected heartbeat(): void {
    this.send({
      op: Operation.HEARTBEAT,
    });
  }
}
