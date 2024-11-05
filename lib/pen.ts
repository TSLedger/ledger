import type {JoinedWorkerContexts} from "./interface/context.if.ts";
import {interval} from "../deps.ts";
import type { PageOptions } from './interface/page.if.ts';
import { Op } from './interface/operation.if.ts';

export class Pen extends Worker {
  public readonly options: PageOptions;
  private readonly internal = new AbortController();

  public terminated = false;
  private initialized = false;
  private heartbeat = false;

  public constructor(options: PageOptions) {
    super(options.package, { type: 'module' });
    this.options = options;

    // Add Event Listeners.
    this.addEventListener('message', (evt: MessageEvent<JoinedWorkerContexts>) => {
      switch (evt.data.op) {
        case Op.INITIALIZED: {
          this.initialized = true;
          break;
        }
        case Op.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
        case Op.ERROR: {
          // deno-lint-ignore no-console
          console.error(`[Ledger/NagAuthor] Unhandled Exception in Page (Worker Digestion). This is (likely) not a Ledger issue.\n`, evt.data.context.e);
          break;
        }
      }
    });

    // Post Configuration.
    this.post({
      op: Op.SEND_CONFIGURATION,
      context: {
        options: this.options.options
      }
    });

    // Start Intervals.
    this.pulse().catch(() => {});
    this.beat().catch(() => {});
  }

  public async writeable(): Promise<void> {
    for await (const check of interval(() => {
      return this.initialized && this.heartbeat;
    }, 5, this.internal)) {
      if (!check) continue;
      break;
    }
  }

  private async pulse(): Promise<void> {
    for await (const val of interval(() => {
      if (this.internal.signal.aborted) return false;
      if (!this.heartbeat) {
        this.internal.abort();
        this.terminate();
        return false;
      }
      this.heartbeat = false;
      return true;
    }, 15, this.internal)) {
      if (!val) break;
      if (this.internal.signal.aborted) break;
    }
  }

  private async beat(): Promise<void> {
    for await (const val of interval(() => {
      if (this.internal.signal.aborted) return false;
      if (this.heartbeat) return true;
      this.post({
        op: Op.HEARTBEAT,
      });
      return true;
    }, 5, this.internal)) {
      if (!val) break;
      if (this.internal.signal.aborted) break;
    }
  }

  public post(ctx: JoinedWorkerContexts): void {
    this.postMessage(ctx);
  }

  public override terminate(): void {
    this.internal.abort();
    this.terminated = true;
    super.terminate();
  }
}
