import type { PageAllContexts } from './interface/context.if.ts';
import { Op } from './interface/operation.if.ts';
import type { PageHandler } from './interface/page.if.ts';

/**
 * The Abstraction of a Page for a Pen to write. This is a Worker Process for a Pen.
 *
 * This abstracts the Worker Communications to a simplified API for consumption.
 */
export class Page {
  protected thread: PageHandler | null = null;
  protected options: unknown | null = null;

  /** Creates the Abstracted Communication Layer. */
  public constructor() {
    // Add Listeners.
    self.addEventListener('message', async (evt: MessageEvent<PageAllContexts>) => {
      try {
        switch (evt.data.op) {
          // Handle Configuration.
          case Op.SEND_CONFIGURATION: {
            this.thread = new (await import(evt.data.context.package.toString()) as { Page: new () => PageHandler }).Page();
            this.options = evt.data.context.options;
            break;
          }
          // Handle Heartbeats.
          case Op.HEARTBEAT: {
            this.post({
              op: Op.HEARTBEAT,
            });
            break;
          }
          // Handle Message.
          case Op.MESSAGE: {
            await this.thread?.receive(evt.data);
            break;
          }
        }
      } catch (e) {
        // Post Error.
        self.postMessage({
          op: Op.ERROR,
          context: {
            e,
          },
        });
      }
    });
  }

  /**
   * Post a {@link PageAllContexts} to your {@link Pen}.
   *
   * @param ctx A instance of {@link PageAllContexts}.
   */
  protected post(ctx: PageAllContexts): void {
    self.postMessage(ctx);
  }
}

new Page();
