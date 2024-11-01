import {type JoinedWorkerContexts, Operation} from "./interface/context.ts";
import {interval} from "../deps.ts";
import type { PageOptions } from '../mod.ts';

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
        case Operation.INITIALIZED: {
          this.initialized = true;
          break;
        }
        case Operation.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
        case Operation.ERROR: {
          break;
        }
        // case Operation.ENSURE: {
        //   // TODO(xCykrix): Implement ENSURE.
        //   break;
        // }
      }
    });

    // Post Configuration.
    this.post({
      op: Operation.SET_PACKAGE,
      context: {
        options: this.options
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
    }, 100, this.internal)) {
      if (!val) break;
    }
  }

  private async beat(): Promise<void> {
    for await (const val of interval(() => {
      if (this.internal.signal.aborted) return false;
      if (this.heartbeat) return true;
      this.post({
        op: Operation.HEARTBEAT,
      });
      return true;
    }, 25, this.internal)) {
      if (!val) break;
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
