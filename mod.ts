import { Heartbeat, Payload, PayloadCode } from './lib/util/payload.ts';

/*

Acknowledge Queue. Send a Log 'Request' to Worker and Worker must ack request to remove from stack. Non-ack will resend after short time. Protects against missed events on restart or worker death.

*/

/**
 * The Ledger Builder Class.
 */
export class Ledger {
  private options: LedgerOptions;
  private worker: Worker;

  private heartbeatInterval: number;
  private heartbeats = new Set<string>();

  public constructor(options: LedgerOptions) {
    this.options = options;
    this.worker = new Worker(new URL('./lib/handler.ts', import.meta.url).href, { type: 'module' });
    this.addListener();

    this.heartbeatInterval = setInterval(async () => {
      if (!(await this.waitForHeartbeat())) {
        console.info('heartbeat fail');
        this.worker.terminate();
        this.worker = new Worker(new URL('./lib/handler.ts', import.meta.url).href, { type: 'module' });
        this.addListener();
        // TODO: Post Message to Logs for Fatal Error Recovery (Possible Missed Events)
      }
    }, 500);
  }

  private addListener(): void {
    // Heartbeat Handler
    this.worker.addEventListener('message', (ctx: MessageEvent<Payload>) => {
      switch (ctx.data.code) {
        case PayloadCode.HEARTBEAT: {
          const message: Heartbeat = ctx.data as Heartbeat;
          this.heartbeats.add(message.heartbeat);
          break;
        }
      }
    });
  }

  private async waitForHeartbeat(): Promise<boolean> {
    const heartbeat = crypto.randomUUID();
    this.worker.postMessage({
      code: PayloadCode.HEARTBEAT,
      heartbeat,
    });
    return await new Promise((resolve) => {
      setTimeout(() => {
        if (this.heartbeats.has(heartbeat)) {
          this.heartbeats.clear();
          return resolve(true);
        } else {
          return resolve(false);
        }
      }, 100);
    });
  }

  public shutdown(): void {
    clearInterval(this.heartbeatInterval);
    this.worker.terminate();
  }

  public restart(): void {
    this.worker.terminate();
  }
}

export interface LedgerOptions {
  name: string;
}

const r = new Ledger({
  name: 'test',
});
setTimeout(() => {
  r.restart();
}, 3000);
