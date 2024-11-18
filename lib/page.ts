import type { PageAllContexts, PageMessageContext } from './interface/context.if.ts';
import { Op } from './interface/operation.if.ts';

/**
 * The Abstraction of a Page for a Pen to write. This is a Worker Process for a Pen.
 *
 * This abstracts the Worker Communications to a simplified API for consumption.
 */
export class Page {
  protected options: unknown | null = null;

  /** Creates the Abstracted Communication Layer. */
  public constructor() {
    self.addEventListener('message', (evt: MessageEvent<PageAllContexts>) => {
      try {
        switch (evt.data.op) {
          case Op.SEND_CONFIGURATION: {
            this.options = evt.data.context.options;
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

  /** Receive a {@link PageMessageContext} from your {@link Pen} via the Abstracted Communication Layer. */
  protected async receive({ context }: PageMessageContext): Promise<void> {
  }

  /**
   * Post a {@link PageAllContexts} to your {@link Pen}.
   *
   * @param ctx A instance of {@link PageAllContexts}.
   */
  protected post(ctx: PageAllContexts): void {
    self.postMessage(ctx);
  }

  /** Post an {@link Error} to your {@link Pen}. */
  protected error(e: Error): void {
    self.postMessage({
      op: Op.ERROR,
      context: {
        e,
      },
    });
  }
}
