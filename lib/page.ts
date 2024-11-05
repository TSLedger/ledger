import type {JoinedWorkerContexts, PageMessageContext} from './interface/context.if.ts';
import { Op } from './interface/operation.if.ts';
import type {PageConfigurationOptions} from './interface/page.if.ts';

export abstract class Page {
  protected options: PageConfigurationOptions | null = null;

  protected constructor() {
    self.addEventListener('message', (evt: MessageEvent<JoinedWorkerContexts>) => {
      try {
        switch (evt.data.op) {
          case Op.SEND_CONFIGURATION: {
            this.options = evt.data.context.options;
            this.post({
              op: Op.INITIALIZED,
            });
            break;
          }
          case Op.HEARTBEAT: {
            this.post({
              op: Op.HEARTBEAT,
            });
            break;
          }
          case Op.MESSAGE: {
            this.receive(evt.data).catch(this.error);
            break;
          }
        }
      } catch (e) {
        this.error(e as Error);
      }
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
    self.postMessage({
      op: Op.ERROR,
      context: {
        e,
      },
    });
  }
}
